import type { GithubCache, HeatmapCell, LanguageSlice, StarPoint } from '$lib/types';

export function toHeatmapCells(calendar: GithubCache['contributionCalendar']): HeatmapCell[] {
	return calendar.map((entry, i) => {
		const d = new Date(entry.date);
		return {
			date: entry.date,
			count: entry.count,
			week: Math.floor(i / 7),
			dayOfWeek: d.getDay(),
		};
	});
}

export function toLanguageSlices(languageBytes: Record<string, number>): LanguageSlice[] {
	const total = Object.values(languageBytes).reduce((s, b) => s + b, 0);
	return Object.entries(languageBytes)
		.map(([name, bytes]) => ({ name, bytes, percentage: (bytes / total) * 100 }))
		.sort((a, b) => b.bytes - a.bytes);
}

export function toStarTimeline(history: GithubCache['koreStarHistory']): StarPoint[] {
	return history.map((entry, i) => ({
		date: entry.starredAt.slice(0, 10),
		cumulative: i + 1,
	}));
}
