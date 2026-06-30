import type { GithubCache } from '$lib/types';

const BASE = 'https://api.github.com';

async function gh(path: string, token: string) {
	const res = await fetch(`${BASE}${path}`, {
		headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
	});
	if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
	return res.json() as Promise<unknown>;
}

async function ghGraphQL(query: string, variables: Record<string, unknown>, token: string) {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, variables }),
	});
	if (!res.ok) throw new Error(`GitHub GraphQL: ${res.status}`);
	return (res.json() as Promise<{ data: unknown }>).then((r) => r.data);
}

export async function fetchGithubCache(token: string, username: string): Promise<GithubCache> {
	// Fetch repos list
	const repos = (await gh(`/users/${username}/repos?sort=updated&per_page=100`, token)) as {
		fork: boolean;
		name: string;
		description: string | null;
		stargazers_count: number;
		created_at: string;
		topics: string[];
		html_url: string;
	}[];

	const ownRepos = repos.filter((r) => !r.fork);

	// Aggregate language bytes across all repos
	const languageBytes: Record<string, number> = {};
	await Promise.all(
		ownRepos.map(async (repo) => {
			const langs = (await gh(`/repos/${username}/${repo.name}/languages`, token)) as Record<
				string,
				number
			>;
			for (const [lang, bytes] of Object.entries(langs)) {
				languageBytes[lang] = (languageBytes[lang] ?? 0) + bytes;
			}
		}),
	);

	// Contribution calendar via GraphQL
	const now = new Date();
	const from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
	const calData = (await ghGraphQL(
		`query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`,
		{ login: username, from, to: now.toISOString() },
		token,
	)) as {
		user: {
			contributionsCollection: {
				contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] };
			};
		};
	};

	const contributionCalendar =
		calData.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) =>
			w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
		);

	// Kore star history via GraphQL
	const koreData = (await ghGraphQL(
		`query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        stargazers(first: 100, orderBy: {field: STARRED_AT, direction: ASC}) {
          edges { starredAt }
        }
      }
    }`,
		{ owner: username, name: 'Kore' },
		token,
	)) as { repository: { stargazers: { edges: { starredAt: string }[] } } };

	const koreStarHistory = koreData.repository.stargazers.edges.map((e) => ({
		starredAt: e.starredAt,
	}));

	return {
		fetchedAt: now.toISOString(),
		contributionCalendar,
		languageBytes,
		repos: ownRepos.map((r) => ({
			name: r.name,
			description: r.description,
			stars: r.stargazers_count,
			createdAt: r.created_at,
			topics: r.topics,
			url: r.html_url,
		})),
		koreStarHistory,
	};
}
