<script lang="ts">
	import type { HeatmapCell } from '$lib/types';

	interface Props {
		cells: HeatmapCell[];
	}

	let { cells }: Props = $props();

	const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const maxCount = $derived(Math.max(1, ...cells.map((c) => c.count)));

	// Group cells by week column
	const weeks = $derived.by(() => {
		const map = new Map<number, HeatmapCell[]>();
		for (const cell of cells) {
			const arr = map.get(cell.week) ?? [];
			arr.push(cell);
			map.set(cell.week, arr);
		}
		return Array.from(map.entries())
			.sort(([a], [b]) => a - b)
			.map(([, days]) => days.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
	});

	// Month label positions
	const monthLabels = $derived.by(() => {
		const seen = new Set<string>();
		const labels: { weekIndex: number; label: string }[] = [];
		weeks.forEach((days, weekIndex) => {
			const first = days[0];
			if (!first) return;
			const month = first.date.slice(0, 7);
			if (!seen.has(month)) {
				seen.add(month);
				const [, m] = month.split('-');
				labels.push({
					weekIndex,
					label: new Date(`${month}-01`).toLocaleString('en', { month: 'short' }),
				});
			}
		});
		return labels;
	});

	function color(count: number): string {
		const t = count / maxCount;
		if (t === 0) return '#1a2535';
		if (t < 0.15) return '#064e3b';
		if (t < 0.35) return '#065f46';
		if (t < 0.60) return '#10b981';
		if (t < 0.85) return '#34d399';
		return '#6ee7b7';
	}

	let tooltip = $state<{ text: string; x: number; y: number } | null>(null);

	function showTip(e: MouseEvent, cell: HeatmapCell) {
		tooltip = {
			text: `${cell.count} contributions · ${cell.date}`,
			x: (e.target as HTMLElement).getBoundingClientRect().left + window.scrollX,
			y: (e.target as HTMLElement).getBoundingClientRect().top + window.scrollY - 36,
		};
	}
</script>

<div class="w-full overflow-x-auto">
	<div class="inline-block min-w-full">
		<!-- Month labels -->
		<div class="mb-1 flex" style="padding-left: 2rem;">
			{#each monthLabels as { weekIndex, label } (weekIndex)}
				<div
					class="text-xs text-slate-500"
					style="position: relative; left: {weekIndex * 14}px; min-width: 0;"
				>
					{label}
				</div>
			{/each}
		</div>

		<div class="flex gap-0">
			<!-- Day labels -->
			<div class="mr-1.5 flex flex-col justify-around">
				{#each DAYS as day, i (day)}
					<div class="h-3 text-[10px] leading-3 text-slate-600">
						{i % 2 === 1 ? day.slice(0, 3) : ''}
					</div>
				{/each}
			</div>

			<!-- Grid -->
			<div class="flex gap-px" role="img" aria-label="GitHub contribution heatmap for the past year">
				{#each weeks as week, wi (wi)}
					<div class="flex flex-col gap-px">
						{#each Array(7) as _, day (day)}
							{@const cell = week.find((c) => c.dayOfWeek === day)}
							{#if cell}
								<div
									class="h-3 w-3 cursor-default rounded-sm transition-opacity hover:opacity-80"
									style="background-color: {color(cell.count)}"
									title="{cell.count} contributions on {cell.date}"
									role="presentation"
									onmouseenter={(e) => showTip(e, cell)}
									onmouseleave={() => (tooltip = null)}
								></div>
							{:else}
								<div class="h-3 w-3 rounded-sm" style="background-color: #0f172a"></div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<!-- Legend -->
		<div class="mt-3 flex items-center gap-2 text-xs text-slate-500" style="padding-left: 2rem;">
			<span>Less</span>
			{#each ['#1a2535', '#064e3b', '#065f46', '#10b981', '#34d399', '#6ee7b7'] as c (c)}
				<div class="h-3 w-3 rounded-sm" style="background-color: {c}"></div>
			{/each}
			<span>More</span>
		</div>
	</div>
</div>
