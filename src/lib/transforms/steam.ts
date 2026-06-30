import type { SteamCache, PlaytimeEntry } from '$lib/types';

export function toPlaytimeEntries(
	games: SteamCache['games'],
	topN = 20,
): PlaytimeEntry[] {
	return games
		.map((g) => ({
			appid: g.appid,
			name: g.name,
			hours: g.playtimeMinutes / 60,
			recentHours: (g.recentPlaytimeMinutes ?? 0) / 60,
			iconUrl: g.iconUrl,
			genre: g.genre,
		}))
		.sort((a, b) => b.hours - a.hours)
		.slice(0, topN);
}
