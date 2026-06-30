import type { AtomClickerCache } from '$lib/types';

const BASE = 'https://atom-clicker.ayfri.com/api';

interface LeaderboardEntry {
	atoms: number;
	level: number;
	is_online?: boolean;
	lastUpdated: number;
	createdAt: number;
}

const ABSURD_ATOM_THRESHOLD = 1e120;
const ABSURD_LEVEL_THRESHOLD = 5_000;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function numberFrom(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

function toLeaderboardEntry(value: unknown): LeaderboardEntry | null {
	if (!isRecord(value)) return null;
	return {
		atoms: numberFrom(value.atoms),
		level: numberFrom(value.level),
		is_online: value.is_online === true,
		lastUpdated: numberFrom(value.lastUpdated),
		createdAt: numberFrom(value.createdAt ?? value.created_at),
	};
}

function bucketCount(entries: LeaderboardEntry[], buckets: { label: string; test: (entry: LeaderboardEntry) => boolean }[]) {
	return buckets.map((bucket) => ({
		label: bucket.label,
		count: entries.filter(bucket.test).length,
	}));
}

function monthlyHistory(entries: LeaderboardEntry[], field: 'createdAt' | 'lastUpdated') {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		const timestamp = entry[field];
		if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
		const date = new Date(timestamp);
		const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	let cumulative = 0;
	return [...counts.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, count]) => {
			cumulative += count;
			return { date, count, cumulative };
		});
}

export async function fetchAtomClickerCache(): Promise<AtomClickerCache> {
	const [statsResponse, leaderboardResponse] = await Promise.all([
		fetch(`${BASE}/stats`),
		fetch(`${BASE}/leaderboard`),
	]);

	if (!statsResponse.ok) throw new Error(`Atom Clicker stats: ${statsResponse.status}`);
	if (!leaderboardResponse.ok) throw new Error(`Atom Clicker leaderboard: ${leaderboardResponse.status}`);

	const stats = (await statsResponse.json()) as unknown;
	const leaderboardRaw = (await leaderboardResponse.json()) as unknown;
	const leaderboardEntries = isRecord(leaderboardRaw) ? leaderboardRaw.entries : leaderboardRaw;
	const entries = (Array.isArray(leaderboardEntries) ? leaderboardEntries : [])
		.map(toLeaderboardEntry)
		.filter((entry): entry is LeaderboardEntry => entry !== null);
	const now = Date.now();
	const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
	const displayEntries = entries.filter(
		(entry) => entry.atoms > 0 && entry.atoms < ABSURD_ATOM_THRESHOLD && entry.level < ABSURD_LEVEL_THRESHOLD,
	);
	const outlierUsers = entries.length - displayEntries.length;

	return {
		fetchedAt: new Date().toISOString(),
		totalUsers: isRecord(stats) ? numberFrom(stats.totalUsers) : entries.length,
		leaderboardSize: entries.length,
		onlineUsers: entries.filter((entry) => entry.is_online).length,
		activeLast7Days: entries.filter((entry) => entry.lastUpdated >= weekAgo).length,
		topAtoms: Math.max(0, ...displayEntries.map((entry) => entry.atoms)),
		topLevel: Math.max(0, ...displayEntries.map((entry) => entry.level)),
		outlierUsers,
		observedUserHistory: monthlyHistory(entries, 'lastUpdated'),
		registrationHistory: monthlyHistory(entries, 'createdAt'),
		levelBuckets: bucketCount(displayEntries, [
			{ label: '0', test: (entry) => entry.level <= 0 },
			{ label: '1-5', test: (entry) => entry.level >= 1 && entry.level <= 5 },
			{ label: '6-10', test: (entry) => entry.level >= 6 && entry.level <= 10 },
			{ label: '11-20', test: (entry) => entry.level >= 11 && entry.level <= 20 },
			{ label: '21-40', test: (entry) => entry.level >= 21 && entry.level <= 40 },
			{ label: '41+', test: (entry) => entry.level >= 41 },
		]),
		atomBands: bucketCount(displayEntries, [
			{ label: '<1K', test: (entry) => entry.atoms < 1_000 },
			{ label: '1K-100K', test: (entry) => entry.atoms >= 1_000 && entry.atoms < 100_000 },
			{ label: '100K-10M', test: (entry) => entry.atoms >= 100_000 && entry.atoms < 10_000_000 },
			{ label: '10M-1B', test: (entry) => entry.atoms >= 10_000_000 && entry.atoms < 1_000_000_000 },
			{ label: '1B+', test: (entry) => entry.atoms >= 1_000_000_000 },
		]),
	};
}
