import type { GithubCache, HeatmapCell, LanguageSlice, StarPoint, StarSeries } from '$lib/types';

export function toHeatmapCells(calendar: GithubCache['contributionCalendar']): HeatmapCell[] {
	if (calendar.length === 0) return [];
	const first = new Date(calendar[0].date);
	const firstMonday = new Date(first);
	firstMonday.setDate(first.getDate() - ((first.getDay() + 6) % 7));

	return calendar.map((entry) => {
		const date = new Date(entry.date);
		const daysFromStart = Math.floor((date.getTime() - firstMonday.getTime()) / 86_400_000);
		return {
			date: entry.date,
			count: entry.count,
			week: Math.floor(daysFromStart / 7),
			dayOfWeek: (date.getDay() + 6) % 7,
		};
	});
}

export function toLanguageSlices(github: GithubCache): LanguageSlice[] {
	const byteCounts = github.languageBytes;
	const repoCounts = github.languageRepos ?? github.repos.reduce<Record<string, number>>((counts, repo) => {
		if (!repo.primaryLanguage) return counts;
		counts[repo.primaryLanguage] = (counts[repo.primaryLanguage] ?? 0) + 1;
		return counts;
	}, {});
	const fileCounts = github.languageFiles ?? {};
	const names = new Set([
		...Object.keys(repoCounts),
		...Object.keys(fileCounts),
		...Object.keys(byteCounts),
	]);
	const repoTotal = Math.max(1, github.repos.length);
	const fileTotal = Math.max(1, Object.values(fileCounts).reduce((sum, count) => sum + count, 0));
	const byteTotal = Math.max(1, Object.values(byteCounts).reduce((sum, bytes) => sum + bytes, 0));

	return [...names]
		.map((name) => {
			const repoCount = repoCounts[name] ?? 0;
			const fileCount = fileCounts[name] ?? 0;
			const bytes = byteCounts[name] ?? 0;
			const repoPercentage = (repoCount / repoTotal) * 100;
			const filePercentage = (fileCount / fileTotal) * 100;
			const bytePercentage = (bytes / byteTotal) * 100;
			return {
				name,
				repoCount,
				fileCount,
				bytes,
				percentage: repoPercentage,
				repoPercentage,
				filePercentage,
				bytePercentage,
			};
		})
		.sort((a, b) => b.repoCount - a.repoCount || b.fileCount - a.fileCount || b.bytes - a.bytes);
}

export function toStarTimeline(history: GithubCache['koreStarHistory']): StarPoint[] {
	return history.map((entry, i) => ({
		date: entry.starredAt.slice(0, 10),
		cumulative: i + 1,
	}));
}

export function toStarSeries(github: GithubCache): StarSeries[] {
	const histories = github.starHistories ?? [
		{
			name: 'Kore',
			owner: 'Ayfri',
			url: 'https://github.com/Ayfri/Kore',
			stars: github.koreStarHistory.length,
			history: github.koreStarHistory,
		},
	];

	return histories
		.map((repo) => ({
			name: repo.name,
			owner: repo.owner,
			url: repo.url,
			stars: repo.stars,
			points: toStarTimeline(repo.history),
		}))
		.filter((repo) => repo.points.length > 0)
		.sort((a, b) => b.stars - a.stars);
}
