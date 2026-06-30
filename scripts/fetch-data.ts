// Run with: bun run scripts/fetch-data.ts
// Requires .env with GITHUB_TOKEN, GITHUB_USERNAME, STEAM_API_KEY, STEAM_ID

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchGithubCache } from '../src/lib/fetchers/github';
import { fetchSteamCache } from '../src/lib/fetchers/steam';
import { fetchAtomClickerCache } from '../src/lib/fetchers/atom-clicker';
import { parseDiscordExport } from '../src/lib/parsers/discord';

const CACHE_DIR = join(import.meta.dir, '../src/lib/data/cache');
const RAW_DIR = join(import.meta.dir, '../src/lib/data/raw/discord-export');

function requireEnv(key: string): string {
	const val = process.env[key];
	if (!val) throw new Error(`Missing env var: ${key}`);
	return val;
}

async function main() {
	console.log('Fetching GitHub data...');
	const github = await fetchGithubCache(
		requireEnv('GITHUB_TOKEN'),
		requireEnv('GITHUB_USERNAME'),
	);
	writeFileSync(join(CACHE_DIR, 'github.json'), JSON.stringify(github, null, 2));
	console.log(`  ${github.repos.length} repos, ${github.contributionCalendar.length} calendar days`);

	console.log('Fetching Steam data...');
	const steam = await fetchSteamCache(
		requireEnv('STEAM_API_KEY'),
		requireEnv('STEAM_ID'),
	);
	writeFileSync(join(CACHE_DIR, 'steam.json'), JSON.stringify(steam, null, 2));
	console.log(`  ${steam.games.length} games`);

	console.log('Fetching Atom Clicker public aggregates...');
	const atomClicker = await fetchAtomClickerCache();
	writeFileSync(join(CACHE_DIR, 'atom-clicker.json'), JSON.stringify(atomClicker, null, 2));
	console.log(`  ${atomClicker.totalUsers} total users, ${atomClicker.leaderboardSize} leaderboard entries`);

	const analyticsDir = join(RAW_DIR, 'activity', 'analytics');
	if (existsSync(analyticsDir)) {
		console.log('Parsing Discord export...');
		const discord = parseDiscordExport(RAW_DIR, process.env['DISCORD_EXPORT_DATE'] ?? '');
		writeFileSync(join(CACHE_DIR, 'discord.json'), JSON.stringify(discord, null, 2));
		console.log(`  ${discord.gameSessions.length} game session entries`);
	} else {
		console.log('Skipping Discord export (no export found at src/lib/data/raw/discord-export/)');
	}

	console.log('Done. Commit src/lib/data/cache/ to refresh the site data.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
