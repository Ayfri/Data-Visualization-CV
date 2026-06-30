<script lang="ts">
	import type { SteamCache, DiscordCache } from '$lib/types';
	import PlaytimeBar from '$lib/components/charts/PlaytimeBar.svelte';
	import GameActivityTimeline from '$lib/components/charts/GameActivityTimeline.svelte';
	import { toPlaytimeEntries } from '$lib/transforms/steam';
	import { toGameActivityDays } from '$lib/transforms/discord';

	interface Props {
		steam: SteamCache;
		discord: DiscordCache;
	}

	let { steam, discord }: Props = $props();

	const topGames = $derived(toPlaytimeEntries(steam.games));
	const activityDays = $derived(toGameActivityDays(discord.gameSessions));

	const totalHours = $derived(
		steam.games.reduce((s, g) => s + g.playtimeMinutes / 60, 0),
	);
</script>

<section class="mx-auto max-w-5xl px-6 py-16">
	<h2 class="text-2xl font-semibold">Gaming</h2>
	<p class="mt-1 text-gray-400">{totalHours.toFixed(0)} hours on Steam</p>

	{#if topGames.length > 0}
		<div class="mt-6">
			<h3 class="mb-3 text-lg font-medium">Top games by playtime</h3>
			<PlaytimeBar games={topGames} />
		</div>
	{/if}

	{#if activityDays.length > 0}
		<div class="mt-10">
			<h3 class="mb-3 text-lg font-medium">Discord game activity</h3>
			<GameActivityTimeline days={activityDays} />
		</div>
	{/if}
</section>
