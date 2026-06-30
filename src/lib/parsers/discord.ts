import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DiscordCache } from '$lib/types';

interface AnalyticsEvent {
	event_type?: string;
	[key: string]: unknown;
}

export function parseDiscordExport(exportDir: string, exportDate: string): DiscordCache {
	const analyticsDir = join(exportDir, 'activity', 'analytics');

	const files = readdirSync(analyticsDir).filter((f) => f.startsWith('analytics-'));
	if (files.length === 0) throw new Error(`No analytics files found in ${analyticsDir}`);

	const sessionsByDay = new Map<string, Map<string, number>>();

	for (const file of files) {
		const raw = readFileSync(join(analyticsDir, file), 'utf-8');
		const events: AnalyticsEvent[] = JSON.parse(raw);

		for (const event of events) {
			// Inspect your own export to confirm exact field names -- Discord has changed this over time.
			// Common patterns: event_type contains "game" or "application", with fields like
			// "game_name"/"application_name", "duration_ms"/"seconds_on_screen", and a timestamp.
			const type = String(event['event_type'] ?? '');
			if (!type.toLowerCase().includes('game') && !type.toLowerCase().includes('application'))
				continue;

			const gameName =
				String(event['game_name'] ?? event['application_name'] ?? '').trim();
			if (!gameName) continue;

			// Prefer a dedicated date field; fall back to parsing a timestamp field
			const rawDate =
				event['day'] ??
				event['date'] ??
				event['timestamp'] ??
				event['occurred_at'];
			if (!rawDate) continue;
			const date = String(rawDate).slice(0, 10); // keep YYYY-MM-DD

			const durationMs =
				Number(event['duration_ms'] ?? 0) ||
				Number(event['seconds_on_screen'] ?? 0) * 1000;
			const minutes = Math.round(durationMs / 60_000);
			if (minutes <= 0) continue;

			if (!sessionsByDay.has(date)) sessionsByDay.set(date, new Map());
			const day = sessionsByDay.get(date)!;
			day.set(gameName, (day.get(gameName) ?? 0) + minutes);
		}
	}

	const gameSessions: DiscordCache['gameSessions'] = [];
	for (const [date, games] of sessionsByDay) {
		for (const [gameName, minutesPlayed] of games) {
			gameSessions.push({ gameName, date, minutesPlayed });
		}
	}
	gameSessions.sort((a, b) => a.date.localeCompare(b.date));

	return {
		fetchedAt: new Date().toISOString(),
		parsedFromExportDate: exportDate,
		gameSessions,
	};
}
