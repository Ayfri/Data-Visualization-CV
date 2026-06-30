<script lang="ts">
	import type { SteamCache, DiscordCache } from '$lib/types';
	import PlaytimeBar from '$lib/components/charts/PlaytimeBar.svelte';
	import GameActivityTimeline from '$lib/components/charts/GameActivityTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { toPlaytimeEntries } from '$lib/transforms/steam';
	import { toGameActivityDays } from '$lib/transforms/discord';

	interface Props {
		steam: SteamCache;
		discord: DiscordCache;
	}

	let { steam, discord }: Props = $props();

	const topGames = $derived(toPlaytimeEntries(steam.games, 15));
	const activityDays = $derived(toGameActivityDays(discord.gameSessions));

	const totalHours = $derived(
		Math.round(steam.games.reduce((s, g) => s + g.playtimeMinutes / 60, 0)),
	);
	const gamesWithTime = $derived(steam.games.filter((g) => g.playtimeMinutes > 0).length);
	const mostPlayed = $derived(topGames[0]);
</script>

<section class="mx-auto max-w-7xl px-6 py-16">
	<SectionHeading
		title="Gaming"
		subtitle="Live data from Steam · {steam.games.length} games owned"
		accent="violet"
	/>

	<!-- Stats strip -->
	<div class="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
		<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4 text-center">
			<p class="text-2xl font-semibold text-zinc-100">{totalHours.toLocaleString()}</p>
			<p class="text-xs uppercase tracking-[0.18em] text-zinc-600">hours on Steam</p>
		</div>
		<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4 text-center">
			<p class="text-2xl font-semibold text-zinc-100">{gamesWithTime}</p>
			<p class="text-xs uppercase tracking-[0.18em] text-zinc-600">games played</p>
		</div>
		<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4 text-center">
			<p class="truncate text-2xl font-semibold text-zinc-100">{mostPlayed?.name ?? '-'}</p>
			<p class="text-xs uppercase tracking-[0.18em] text-zinc-600">most played</p>
		</div>
	</div>

	{#if topGames.length > 0}
		<div class="mb-12 rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
			<h3 class="mb-5 text-sm font-medium text-zinc-400">Steam playtime orbit</h3>
			<PlaytimeBar games={topGames} />
		</div>
	{/if}

	<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
		<h3 class="mb-5 text-sm font-medium text-zinc-400">Discord activity pulse</h3>
		<GameActivityTimeline days={activityDays} />
	</div>
</section>
