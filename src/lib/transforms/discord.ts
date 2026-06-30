import type { DiscordCache, GameActivityDay } from '$lib/types';

export function toGameActivityDays(sessions: DiscordCache['gameSessions']): GameActivityDay[] {
	return sessions.map((s) => ({
		date: s.date,
		gameName: s.gameName,
		minutesPlayed: s.minutesPlayed,
	}));
}

export function topGamesByTime(
	sessions: DiscordCache['gameSessions'],
	topN = 10,
): { gameName: string; totalMinutes: number }[] {
	const totals = new Map<string, number>();
	for (const s of sessions) {
		totals.set(s.gameName, (totals.get(s.gameName) ?? 0) + s.minutesPlayed);
	}
	return [...totals.entries()]
		.map(([gameName, totalMinutes]) => ({ gameName, totalMinutes }))
		.sort((a, b) => b.totalMinutes - a.totalMinutes)
		.slice(0, topN);
}
