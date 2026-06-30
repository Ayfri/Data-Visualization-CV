import type { GithubCache } from '$lib/types';

const BASE = 'https://api.github.com';

const EXTENSION_LANGUAGES: Record<string, string> = {
	'.kt': 'Kotlin',
	'.kts': 'Kotlin',
	'.ts': 'TypeScript',
	'.tsx': 'TypeScript',
	'.js': 'JavaScript',
	'.jsx': 'JavaScript',
	'.svelte': 'Svelte',
	'.vue': 'Vue',
	'.py': 'Python',
	'.rs': 'Rust',
	'.go': 'Go',
	'.java': 'Java',
	'.css': 'CSS',
	'.scss': 'SCSS',
	'.html': 'HTML',
	'.md': 'Markdown',
	'.mdx': 'Markdown',
	'.sh': 'Shell',
	'.bash': 'Shell',
	'.zsh': 'Shell',
	'.fish': 'Shell',
	'.json': 'JSON',
	'.jsonc': 'JSON',
	'.yml': 'YAML',
	'.yaml': 'YAML',
	'.toml': 'TOML',
	'.xml': 'XML',
	'.sql': 'SQL',
	'.ipynb': 'Jupyter Notebook',
};

const FILE_LANGUAGE_NAMES: Record<string, string> = {
	Dockerfile: 'Dockerfile',
	Makefile: 'Makefile',
};

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

async function fetchRepositoryStarHistory(token: string, owner: string, name: string) {
	const history: { starredAt: string }[] = [];
	let cursor: string | null = null;
	let hasNextPage = true;

	while (hasNextPage) {
		const data = (await ghGraphQL(
			`query($owner: String!, $name: String!, $cursor: String) {
      repository(owner: $owner, name: $name) {
        stargazers(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: ASC}) {
          edges { starredAt }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`,
			{ owner, name, cursor },
			token,
		)) as {
			repository: {
				stargazers: {
					edges: { starredAt: string }[];
					pageInfo: { hasNextPage: boolean; endCursor: string | null };
				};
			} | null;
		};

		const stargazers = data.repository?.stargazers;
		if (!stargazers) break;
		history.push(...stargazers.edges.map((edge) => ({ starredAt: edge.starredAt })));
		hasNextPage = stargazers.pageInfo.hasNextPage;
		cursor = stargazers.pageInfo.endCursor;
	}

	return history;
}

function languageFromPath(path: string): string | null {
	const filename = path.split('/').at(-1) ?? path;
	const named = FILE_LANGUAGE_NAMES[filename];
	if (named) return named;
	const lower = filename.toLowerCase();
	const extension = Object.keys(EXTENSION_LANGUAGES)
		.sort((a, b) => b.length - a.length)
		.find((ext) => lower.endsWith(ext));
	return extension ? EXTENSION_LANGUAGES[extension] : null;
}

export async function fetchGithubCache(token: string, username: string): Promise<GithubCache> {
	// Fetch all repositories the token can see: personal, organization, collaborator, and private.
	const repos = (await gh(
		'/user/repos?sort=updated&per_page=100&visibility=all&affiliation=owner,collaborator,organization_member',
		token,
	)) as {
		fork: boolean;
		private: boolean;
		owner: { login: string };
		name: string;
		description: string | null;
		stargazers_count: number;
		created_at: string;
		updated_at: string;
		pushed_at: string | null;
		language: string | null;
		size: number;
		open_issues_count: number;
		watchers_count: number;
		default_branch: string;
		topics: string[];
		html_url: string;
	}[];

	const ownRepos = repos.filter((r) => !r.fork || r.owner.login !== username);

	// Aggregate language signals across all repos. GitHub byte totals can be skewed by huge generated
	// outputs, so the UI prefers repo presence and file counts.
	const languageBytes: Record<string, number> = {};
	const languageRepos: Record<string, number> = {};
	const languageFiles: Record<string, number> = {};
	const repoLanguagesByKey = new Map<string, Set<string>>();
	await Promise.all(
		ownRepos.map(async (repo) => {
			const repoOwner = repo.owner.login;
			const langs = (await gh(`/repos/${repoOwner}/${repo.name}/languages`, token)) as Record<
				string,
				number
			>;
			for (const [lang, bytes] of Object.entries(langs)) {
				languageBytes[lang] = (languageBytes[lang] ?? 0) + bytes;
			}

			const repoLanguages = new Set<string>();
			try {
				const tree = (await gh(
					`/repos/${repoOwner}/${repo.name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`,
					token,
				)) as { tree?: { path: string; type: string }[] };
				for (const item of tree.tree ?? []) {
					if (item.type !== 'blob') continue;
					const language = languageFromPath(item.path);
					if (!language) continue;
					languageFiles[language] = (languageFiles[language] ?? 0) + 1;
					repoLanguages.add(language);
				}
			} catch {
				for (const language of Object.keys(langs)) repoLanguages.add(language);
			}

			if (repoLanguages.size === 0 && repo.language) repoLanguages.add(repo.language);
			repoLanguagesByKey.set(`${repoOwner}/${repo.name}`, repoLanguages);
			for (const language of repoLanguages) {
				languageRepos[language] = (languageRepos[language] ?? 0) + 1;
			}
		}),
	);

	const languageTimeline = buildLanguageTimeline(ownRepos, repoLanguagesByKey);

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

	const topStarRepos = ownRepos
		.filter((repo) => !repo.private && repo.stargazers_count > 0)
		.sort((a, b) => b.stargazers_count - a.stargazers_count)
		.slice(0, 6);
	const starHistories = await Promise.all(
		topStarRepos.map(async (repo) => ({
			name: repo.name,
			owner: repo.owner.login,
			url: repo.html_url,
			stars: repo.stargazers_count,
			history: await fetchRepositoryStarHistory(token, repo.owner.login, repo.name),
		})),
	);

	const publicRepos = ownRepos.filter((r) => !r.private);
	const privateRepos = ownRepos.filter((r) => r.private);

	return {
		fetchedAt: now.toISOString(),
		contributionCalendar,
		languageBytes,
		languageRepos,
		languageFiles,
		languageTimeline,
		repos: [
			...publicRepos.map((r) => ({
				name: r.name,
				description: r.description,
				stars: r.stargazers_count,
				topics: r.topics,
				url: r.html_url,
				isPrivate: false as const,
			})),
			...privateRepos.map((_, i) => ({
				name: `private-${i + 1}`,
				description: null,
				stars: 0,
				topics: [] as string[],
				url: '',
				isPrivate: true as const,
			})),
		],
		starHistories,
	};
}

function quarterKey(dateString: string) {
	const date = new Date(dateString);
	const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
	return `${date.getUTCFullYear()} Q${quarter}`;
}

function buildLanguageTimeline(
	repos: { owner: { login: string }; name: string; created_at: string }[],
	repoLanguagesByKey: Map<string, Set<string>>,
) {
	const quarters = [...new Set(repos.map((repo) => quarterKey(repo.created_at)))].sort();
	return quarters.map((quarter) => {
		const languages: Record<string, number> = {};
		for (const repo of repos) {
			if (quarterKey(repo.created_at) !== quarter) continue;
			for (const language of repoLanguagesByKey.get(`${repo.owner.login}/${repo.name}`) ?? []) {
				languages[language] = (languages[language] ?? 0) + 1;
			}
		}
		return { semester: quarter, languages };
	});
}
