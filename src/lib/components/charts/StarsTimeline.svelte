<script lang="ts">
	import type { StarSeries } from '$lib/types';
	import { ExternalLink, Star } from '@lucide/svelte';

	interface Props {
		series: StarSeries[];
	}

	let { series }: Props = $props();
	let focusedName = $state<string | null>(null);

	const width = 780;
	const height = 260;
	const pad = 30;
	const colors = ['#c8d08a', '#8aa1a8', '#b8926a', '#a8a29e', '#8f9b77', '#c6976b'];
	const focusedSeries = $derived(series.find((item) => item.name === focusedName) ?? series[0] ?? null);
	const bounds = $derived.by(() => {
		const timestamps = series.flatMap((item) => item.points.map((point) => new Date(point.date).getTime()));
		const maxStars = Math.max(1, ...series.flatMap((item) => item.points.map((point) => point.cumulative)));
		return {
			minDate: Math.min(...timestamps),
			maxDate: Math.max(...timestamps),
			maxStars,
		};
	});

	function xFor(date: string) {
		const span = Math.max(1, bounds.maxDate - bounds.minDate);
		return pad + ((new Date(date).getTime() - bounds.minDate) / span) * (width - pad * 2);
	}

	function yFor(stars: number) {
		return height - pad - (stars / bounds.maxStars) * (height - pad * 2);
	}

	function pathFor(item: StarSeries) {
		return item.points
			.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.date)} ${yFor(point.cumulative)}`)
			.join(' ');
	}

	function choose(name: string) {
		focusedName = focusedName === name ? null : name;
	}

	function handleKeydown(event: KeyboardEvent, name: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(name);
		}
	}
</script>

<div class="grid gap-5 lg:grid-cols-[1fr_16rem] lg:items-center">
	<div class="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
		<div class="mb-3 flex items-center justify-between gap-4">
			<div>
				<p class="text-[10px] uppercase tracking-[0.22em] text-zinc-600">cumulative stars</p>
				<p class="text-2xl font-semibold text-zinc-100">{focusedSeries?.stars ?? 0}</p>
			</div>
			<p class="text-right text-sm text-zinc-500">{focusedSeries ? `${focusedSeries.owner}/${focusedSeries.name}` : '-'}</p>
		</div>

		<svg viewBox="0 0 {width} {height}" class="h-72 w-full overflow-visible" role="img" aria-label="Cumulative star histories for featured projects">
			{#each [0.25, 0.5, 0.75, 1] as line (line)}
				<line x1={pad} x2={width - pad} y1={height - pad - line * (height - pad * 2)} y2={height - pad - line * (height - pad * 2)} stroke="#27272a" stroke-width="1" />
			{/each}
			{#each series as item, index (item.name)}
				{@const isFocused = !focusedName || focusedName === item.name}
				<path
					d={pathFor(item)}
					fill="none"
					stroke={colors[index % colors.length]}
					stroke-width={focusedName === item.name ? 3.5 : 2}
					stroke-linecap="round"
					stroke-linejoin="round"
					opacity={isFocused ? 1 : 0.18}
					class="cursor-pointer transition"
					onmouseenter={() => (focusedName = item.name)}
					onclick={() => choose(item.name)}
					onkeydown={(event) => handleKeydown(event, item.name)}
					role="button"
					tabindex="0"
					aria-label="{item.owner}/{item.name}: {item.stars} stars"
				/>
				{@const lastPoint = item.points.at(-1)}
				{#if lastPoint}
					<circle cx={xFor(lastPoint.date)} cy={yFor(lastPoint.cumulative)} r={focusedName === item.name ? 5 : 3} fill={colors[index % colors.length]} opacity={isFocused ? 1 : 0.2} />
				{/if}
			{/each}
		</svg>
	</div>

	<div class="space-y-2">
		{#each series as item, index (item.name)}
			<button
				type="button"
				class="grid w-full cursor-pointer grid-cols-[0.75rem_1fr_auto] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-left transition hover:border-zinc-600 {focusedName === item.name ? 'border-zinc-500 bg-zinc-900' : ''}"
				onmouseenter={() => (focusedName = item.name)}
				onclick={() => choose(item.name)}
			>
				<span class="h-2.5 w-2.5 rounded-full" style="background-color: {colors[index % colors.length]}"></span>
				<span class="min-w-0">
					<span class="block truncate text-sm font-medium text-zinc-200">{item.name}</span>
					<span class="block truncate text-xs text-zinc-600">{item.owner}</span>
				</span>
				<span class="inline-flex items-center gap-1 text-sm text-zinc-400"><Star size={12} />{item.stars}</span>
			</button>
		{/each}
		{#if focusedSeries}
			<a href={focusedSeries.url} target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200">
				<ExternalLink size={13} />
				Open focused project
			</a>
		{/if}
	</div>
</div>
