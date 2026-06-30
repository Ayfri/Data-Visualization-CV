<script lang="ts">
	import type { GameActivityDay } from '$lib/types';
	import { CalendarRange, Gamepad2, Rows3 } from '@lucide/svelte';

	interface Props {
		days: GameActivityDay[];
	}

	let { days }: Props = $props();

	type View = 'pulse' | 'matrix';

	let view = $state<View>('pulse');
	let selectedGame = $state<string>('all');

	const totalDays = $derived(new Set(days.map((d) => d.date)).size);
	const totalMinutes = $derived(days.reduce((s, d) => s + d.minutesPlayed, 0));

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

	const filteredDays = $derived(
		selectedGame === 'all' ? days : days.filter((day) => day.gameName === selectedGame),
	);

	const dailyTotals = $derived.by(() => {
		const map = new Map<string, number>();
		for (const day of filteredDays) {
			map.set(day.date, (map.get(day.date) ?? 0) + day.minutesPlayed);
		}
		return [...map.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, minutes]) => ({ date, minutes, hours: minutes / 60 }));
	});

	const matrixRows = $derived.by(() => {
		return topGames.map((game) => {
			const entries = days
				.filter((day) => day.gameName === game.name)
				.sort((a, b) => a.date.localeCompare(b.date));
			return { ...game, entries };
		});
	});

	const maxDailyMinutes = $derived(Math.max(1, ...dailyTotals.map((day) => day.minutes)));
	const maxGameMinutes = $derived(Math.max(1, ...topGames.map((game) => game.hours * 60)));
	const selectedTotal = $derived(filteredDays.reduce((sum, day) => sum + day.minutesPlayed, 0));
	const hasData = $derived(days.length > 0);

	function formatHours(minutes: number) {
		return `${Math.round(minutes / 60).toLocaleString()}h`;
	}
</script>

{#if !hasData}
	<div class="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-zinc-800 bg-zinc-950/40 py-12 text-center">
		<div class="flex h-12 w-12 items-center justify-center rounded bg-zinc-900">
			<Gamepad2 size={24} class="text-zinc-500" />
		</div>
		<p class="text-sm font-medium text-zinc-400">No Discord activity data available</p>
		<p class="max-w-xs text-xs text-zinc-600">
			Request a Discord data export and run <code class="rounded bg-zinc-900 px-1 py-0.5 font-mono text-zinc-400">bun run fetch:data</code> to populate this chart.
		</p>
	</div>
{:else}
	<div class="space-y-5">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="grid grid-cols-3 gap-3">
				<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-center">
					<p class="text-xl font-semibold text-zinc-100">{formatHours(totalMinutes)}</p>
					<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">tracked</p>
				</div>
				<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-center">
					<p class="text-xl font-semibold text-zinc-100">{totalDays}</p>
					<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">days</p>
				</div>
				<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-center">
					<p class="text-xl font-semibold text-zinc-100">{topGames.length}</p>
					<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">games</p>
				</div>
			</div>

			<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {view === 'pulse' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
					onclick={() => (view = 'pulse')}
					aria-pressed={view === 'pulse'}
				>
					<CalendarRange size={14} />
					Pulse
				</button>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {view === 'matrix' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
					onclick={() => (view = 'matrix')}
					aria-pressed={view === 'matrix'}
				>
					<Rows3 size={14} />
					Matrix
				</button>
			</div>
		</div>

		<div class="flex gap-2 overflow-x-auto pb-1">
			<button
				type="button"
				class="shrink-0 rounded-md border px-3 py-1.5 text-xs transition {selectedGame === 'all' ? 'border-zinc-500 bg-zinc-800 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-200'}"
				onclick={() => (selectedGame = 'all')}
			>
				All games
			</button>
			{#each topGames as game (game.name)}
				<button
					type="button"
					class="shrink-0 rounded-md border px-3 py-1.5 text-xs transition {selectedGame === game.name ? 'border-zinc-500 bg-zinc-800 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-200'}"
					onclick={() => (selectedGame = game.name)}
				>
					{game.name}
				</button>
			{/each}
		</div>

		{#if view === 'pulse'}
			<div class="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
				<div class="mb-4 flex items-center justify-between text-xs text-zinc-600">
					<span>{selectedGame === 'all' ? 'All games' : selectedGame}</span>
					<span>{formatHours(selectedTotal)}</span>
				</div>
				<div class="flex h-52 items-end gap-1 border-b border-zinc-800">
					{#each dailyTotals as day (day.date)}
						<div
							class="group min-w-1 flex-1 rounded-t bg-linear-to-t from-stone-800 via-zinc-500 to-lime-200 opacity-70 transition hover:opacity-100"
							style="height: {Math.max(3, (day.minutes / maxDailyMinutes) * 100)}%"
							title="{day.date}: {formatHours(day.minutes)}"
						></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				{#each matrixRows as game (game.name)}
					<div class="grid grid-cols-[9rem_1fr_4rem] items-center gap-3">
						<button
							type="button"
							class="truncate text-left text-sm {selectedGame === game.name ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
							onclick={() => (selectedGame = game.name)}
						>
							{game.name}
						</button>
						<div class="flex h-8 items-center gap-px overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 px-1">
							{#each game.entries.slice(-80) as entry (`${game.name}-${entry.date}`)}
								<span
									class="block min-w-1 flex-1 rounded-sm bg-lime-200"
									style="height: {Math.max(10, (entry.minutesPlayed / maxGameMinutes) * 100)}%; opacity: {0.25 + Math.min(0.7, entry.minutesPlayed / maxGameMinutes)}"
									title="{entry.date}: {formatHours(entry.minutesPlayed)}"
								></span>
							{/each}
						</div>
						<span class="text-right text-xs text-zinc-500">{game.hours}h</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
