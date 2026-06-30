<script lang="ts">
	import type { GameActivityDay } from '$lib/types';

	interface Props {
		days: GameActivityDay[];
	}

	let { days }: Props = $props();

	const totalDays = $derived(new Set(days.map((d) => d.date)).size);
	const totalMinutes = $derived(days.reduce((s, d) => s + d.minutesPlayed, 0));

	// Top games by total minutes
	const topGames = $derived.by(() => {
		const map = new Map<string, number>();
		for (const d of days) {
			map.set(d.gameName, (map.get(d.gameName) ?? 0) + d.minutesPlayed);
		}
		return Array.from(map.entries())
			.sort(([, a], [, b]) => b - a)
			.slice(0, 8)
			.map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60) }));
	});

	const hasData = $derived(days.length > 0);
</script>

{#if !hasData}
	<div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-12 text-center">
		<div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
			<span class="text-2xl">🎮</span>
		</div>
		<p class="text-sm font-medium text-slate-400">No Discord activity data available</p>
		<p class="max-w-xs text-xs text-slate-600">
			Request a Discord data export and run <code class="rounded bg-slate-800 px-1 py-0.5 font-mono text-slate-400">bun run fetch:data</code> to populate this chart.
		</p>
	</div>
{:else}
	<div class="space-y-4">
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
				<p class="text-2xl font-bold text-white">{Math.round(totalMinutes / 60)}h</p>
				<p class="text-xs text-slate-500">total tracked</p>
			</div>
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
				<p class="text-2xl font-bold text-white">{totalDays}</p>
				<p class="text-xs text-slate-500">active days</p>
			</div>
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
				<p class="text-2xl font-bold text-white">{topGames.length}</p>
				<p class="text-xs text-slate-500">games played</p>
			</div>
		</div>

		{#if topGames.length > 0}
			<div>
				<p class="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Top games via Discord</p>
				<div class="space-y-2">
					{#each topGames as game (game.name)}
						{@const maxH = topGames[0].hours}
						<div class="flex items-center gap-3">
							<span class="w-32 truncate text-right text-sm text-slate-300">{game.name}</span>
							<div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
								<div
									class="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
									style="width: {(game.hours / maxH) * 100}%"
								></div>
							</div>
							<span class="w-14 text-sm text-slate-400">{game.hours}h</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
