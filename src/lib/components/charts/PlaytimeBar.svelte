<script lang="ts">
	import type { PlaytimeEntry } from '$lib/types';
	import { Clock3, Orbit, Rows3 } from '@lucide/svelte';

	interface Props {
		games: PlaytimeEntry[];
	}

	let { games }: Props = $props();

	type View = 'orbit' | 'rank';
	type Metric = 'total' | 'recent';

	let view = $state<View>('orbit');
	let metric = $state<Metric>('total');
	let activeName = $state<string | null>(null);

	const maxHours = $derived(Math.max(1, ...games.map((game) => game.hours)));
	const maxRecentHours = $derived(Math.max(1, ...games.map((game) => game.recentHours ?? 0)));
	const hasRecent = $derived(games.some((game) => (game.recentHours ?? 0) > 0));

	const chartData = $derived.by(() => {
		return [...games]
			.sort((a, b) => {
				const left = metric === 'recent' ? (a.recentHours ?? 0) : a.hours;
				const right = metric === 'recent' ? (b.recentHours ?? 0) : b.hours;
				return right - left;
			})
			.map((game, index) => {
				const value = metric === 'recent' ? (game.recentHours ?? 0) : game.hours;
				const angle = (index / Math.max(1, games.length)) * Math.PI * 2 - Math.PI / 2;
				const distance = 76 + (Math.sqrt(game.hours / maxHours) * 92);
				return {
					...game,
					value,
					rank: index + 1,
					size: 18 + Math.sqrt(game.hours / maxHours) * 34,
					x: 170 + Math.cos(angle) * distance,
					y: 170 + Math.sin(angle) * distance,
					recentRatio: (game.recentHours ?? 0) / maxRecentHours,
				};
			});
	});

	const activeGame = $derived(chartData.find((game) => game.name === activeName) ?? chartData[0] ?? null);

	function formatHours(hours: number) {
		return `${Math.round(hours).toLocaleString()}h`;
	}

	function toggleGame(name: string) {
		activeName = activeName === name ? null : name;
	}

	function handleGameKeydown(event: KeyboardEvent, name: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleGame(name);
		}
	}
</script>

<div class="space-y-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {view === 'orbit' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
				onclick={() => (view = 'orbit')}
				aria-pressed={view === 'orbit'}
			>
				<Orbit size={14} />
				Orbit
			</button>
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {view === 'rank' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
				onclick={() => (view = 'rank')}
				aria-pressed={view === 'rank'}
			>
				<Rows3 size={14} />
				Rank
			</button>
		</div>

		<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {metric === 'total' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
				onclick={() => (metric = 'total')}
				aria-pressed={metric === 'total'}
			>
				<Clock3 size={14} />
				Lifetime
			</button>
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {metric === 'recent' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'} {hasRecent ? '' : 'opacity-40'}"
				onclick={() => (metric = 'recent')}
				aria-pressed={metric === 'recent'}
				disabled={!hasRecent}
			>
				<Clock3 size={14} />
				Recent
			</button>
		</div>
	</div>

	{#if view === 'orbit'}
		<div class="grid gap-5 lg:grid-cols-[24rem_1fr] lg:items-center">
			<div class="relative mx-auto h-96 w-full max-w-96 overflow-hidden rounded-md border border-zinc-800 bg-[radial-gradient(circle_at_center,#18181b_0,#09090b_62%,#050505_100%)]">
				<svg viewBox="0 0 340 340" class="h-full w-full" role="img" aria-label="Steam playtime orbital map">
					<circle cx="170" cy="170" r="58" fill="none" stroke="#27272a" stroke-width="1" />
					<circle cx="170" cy="170" r="112" fill="none" stroke="#27272a" stroke-width="1" stroke-dasharray="3 7" />
					<circle cx="170" cy="170" r="158" fill="none" stroke="#27272a" stroke-width="1" />
					{#each chartData as game (game.name)}
						<line x1="170" y1="170" x2={game.x} y2={game.y} stroke="#27272a" stroke-width="1" opacity={activeName === game.name ? 0.9 : 0.25} />
						<g
							class="cursor-pointer"
							onmouseenter={() => (activeName = game.name)}
							onfocus={() => (activeName = game.name)}
							onclick={() => toggleGame(game.name)}
							onkeydown={(event) => handleGameKeydown(event, game.name)}
							role="button"
							tabindex="0"
							aria-label="{game.name}: {formatHours(game.hours)}"
						>
							<circle cx={game.x} cy={game.y} r={game.size / 2 + 4} fill="#09090b" stroke={activeName === game.name ? '#d6d3d1' : '#3f3f46'} stroke-width="1.5" />
							<circle cx={game.x} cy={game.y} r={game.size / 2} fill="#78716c" fill-opacity={0.45 + Math.min(0.45, game.hours / maxHours)} />
							{#if game.recentRatio > 0}
								<circle cx={game.x} cy={game.y} r={game.size / 2 + 8} fill="none" stroke="#c8d08a" stroke-width="3" stroke-dasharray="{Math.max(2, game.recentRatio * 18)} 8" />
							{/if}
						</g>
					{/each}
				</svg>

				<div class="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
					<div>
						<p class="max-w-36 truncate text-lg font-semibold text-zinc-100">{activeGame?.name ?? 'Steam'}</p>
						<p class="text-sm text-zinc-500">{activeGame ? formatHours(activeGame.hours) : `${games.length} games`}</p>
						{#if activeGame?.recentHours}
							<p class="text-xs text-lime-200/70">{formatHours(activeGame.recentHours)} recent</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="grid gap-2 sm:grid-cols-2">
				{#each chartData.slice(0, 8) as game (game.name)}
					<button
						type="button"
						class="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-left transition hover:border-zinc-600 {activeName === game.name ? 'border-zinc-500 bg-zinc-900' : ''}"
						onclick={() => toggleGame(game.name)}
					>
						<span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-zinc-900 text-xs text-zinc-500">
							{#if game.iconUrl}
								<img src={game.iconUrl} alt="" class="h-full w-full object-cover" />
							{:else}
								#{game.rank}
							{/if}
						</span>
						<span class="min-w-0">
							<span class="block truncate text-sm font-medium text-zinc-200">{game.name}</span>
							<span class="block text-xs text-zinc-600">rank {game.rank}</span>
						</span>
						<span class="text-sm text-zinc-400">{formatHours(game.value)}</span>
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="space-y-2">
			{#each chartData as game (game.name)}
				<button
					type="button"
					class="grid w-full grid-cols-[2rem_1fr_4.5rem] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-left transition hover:border-zinc-600 {activeName === game.name ? 'border-zinc-500 bg-zinc-900' : ''}"
					onclick={() => toggleGame(game.name)}
				>
					<span class="text-xs tabular-nums text-zinc-600">#{game.rank}</span>
					<span class="min-w-0">
						<span class="block truncate text-sm text-zinc-200">{game.name}</span>
						<span class="mt-1 block h-2 overflow-hidden rounded-full bg-zinc-900">
							<span class="block h-full rounded-full bg-linear-to-r from-stone-700 via-zinc-500 to-lime-200" style="width: {(game.value / Math.max(1, ...chartData.map((item) => item.value))) * 100}%"></span>
						</span>
					</span>
					<span class="text-right text-sm text-zinc-400">{formatHours(game.value)}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
