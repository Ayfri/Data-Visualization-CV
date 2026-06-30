<script lang="ts">
	import type { HeatmapCell } from '$lib/types';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { Activity, CalendarDays, ScanLine } from '@lucide/svelte';

	interface Props {
		cells: HeatmapCell[];
	}

	let { cells }: Props = $props();

	type Mode = 'calendar' | 'signal' | 'weekday';

	let mode = $state<Mode>('calendar');
	let selectedDate = $state<string | null>(null);
	let pointer = $state<{ text: string; x: number; y: number } | null>(null);

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const MODES: { id: Mode; label: string; icon: typeof CalendarDays }[] = [
		{ id: 'calendar', label: 'Calendar', icon: CalendarDays },
		{ id: 'signal', label: 'Signal', icon: Activity },
		{ id: 'weekday', label: 'Weekday', icon: ScanLine },
	];

	const maxCount = $derived(Math.max(1, ...cells.map((c) => c.count)));
	const total = $derived(cells.reduce((sum, cell) => sum + cell.count, 0));
	const activeDays = $derived(cells.filter((cell) => cell.count > 0).length);
	const selectedCell = $derived(cells.find((cell) => cell.date === selectedDate) ?? null);
	const bestCell = $derived.by(() => {
		return cells.reduce<HeatmapCell | null>((best, cell) => {
			if (!best || cell.count > best.count) return cell;
			return best;
		}, null);
	});

	const weeks = $derived.by(() => {
		const map = new SvelteMap<number, HeatmapCell[]>();
		for (const cell of cells) {
			const arr = map.get(cell.week) ?? [];
			arr.push(cell);
			map.set(cell.week, arr);
		}
		return Array.from(map.entries())
			.sort(([a], [b]) => a - b)
			.map(([, days]) => days.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
	});

	const monthLabels = $derived.by(() => {
		const seen = new SvelteSet<string>();
		const labels: { weekIndex: number; label: string }[] = [];
		weeks.forEach((days, weekIndex) => {
			const first = days[0];
			if (!first) return;
			const month = first.date.slice(0, 7);
			if (!seen.has(month)) {
				seen.add(month);
				labels.push({
					weekIndex,
					label: new Date(`${month}-01`).toLocaleString('en', { month: 'short' }),
				});
			}
		});
		return labels;
	});

	const monthWeekdayGrid = $derived.by(() => {
		const monthMap = new SvelteMap<string, SvelteMap<number, number[]>>();
		for (const cell of cells) {
			const month = cell.date.slice(0, 7);
			if (!monthMap.has(month)) monthMap.set(month, new SvelteMap());
			const dayMap = monthMap.get(month)!;
			const existing = dayMap.get(cell.dayOfWeek) ?? [];
			existing.push(cell.count);
			dayMap.set(cell.dayOfWeek, existing);
		}
		const months = [...monthMap.keys()].sort();
		const monthShort = months.map((m) => new Date(`${m}-01`).toLocaleString('en', { month: 'short' }));
		const grid = DAYS.map((_, dayIdx) =>
			months.map((month) => {
				const counts = monthMap.get(month)?.get(dayIdx) ?? [];
				const sum = counts.reduce((a, b) => a + b, 0);
				return counts.length === 0 ? 0 : Math.round(sum / counts.length);
			}),
		);
		return { months, monthShort, grid };
	});

	const weeklySignal = $derived.by(() => {
		return weeks.map((week, index) => {
			const count = week.reduce((sum, cell) => sum + cell.count, 0);
			const active = week.filter((cell) => cell.count > 0).length;
			return { index, count, active, week };
		});
	});

	const weekdayTotals = $derived.by(() => {
		return DAYS.map((day, index) => {
			const dayCells = cells.filter((cell) => cell.dayOfWeek === index);
			const count = dayCells.reduce((sum, cell) => sum + cell.count, 0);
			return { day, count, active: dayCells.filter((cell) => cell.count > 0).length };
		});
	});


	const longestStreak = $derived.by(() => {
		let current = 0;
		let longest = 0;
		for (const cell of cells) {
			if (cell.count > 0) {
				current += 1;
				longest = Math.max(longest, current);
			} else {
				current = 0;
			}
		}
		return longest;
	});

	function color(count: number): string {
		const t = count / maxCount;
		if (t === 0) return '#14181f';
		if (t < 0.15) return '#223028';
		if (t < 0.35) return '#31503c';
		if (t < 0.60) return '#4b7c59';
		if (t < 0.85) return '#87a96b';
		return '#c8d08a';
	}

	function showTip(event: MouseEvent, text: string) {
		pointer = {
			text,
			x: event.clientX,
			y: event.clientY,
		};
	}

	function selectCell(cell: HeatmapCell) {
		selectedDate = selectedDate === cell.date ? null : cell.date;
	}
</script>

<div class="relative space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.2em] text-zinc-600">total</p>
				<p class="text-xl font-semibold text-zinc-100">{total.toLocaleString()}</p>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.2em] text-zinc-600">active</p>
				<p class="text-xl font-semibold text-zinc-100">{activeDays}</p>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.2em] text-zinc-600">streak</p>
				<p class="text-xl font-semibold text-zinc-100">{longestStreak}</p>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.2em] text-zinc-600">peak</p>
				<p class="text-xl font-semibold text-zinc-100">{bestCell?.count ?? 0}</p>
			</div>
		</div>

		<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
			{#each MODES as option (option.id)}
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition {mode === option.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
					onclick={() => (mode = option.id)}
					aria-pressed={mode === option.id}
				>
					<option.icon size={14} />
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	{#if mode === 'calendar'}
		<div class="w-full overflow-x-auto pb-2">
			<div class="min-w-184">
				<div class="grid grid-cols-[2.5rem_1fr] gap-2">
					<div></div>
					<div class="relative mb-2 h-4">
						{#each monthLabels as { weekIndex, label } (weekIndex)}
							<span
								class="absolute top-0 text-[10px] uppercase tracking-wide text-zinc-600"
								style="left: {(weekIndex / Math.max(1, weeks.length - 1)) * 100}%"
							>
								{label}
							</span>
						{/each}
					</div>

					<div class="grid grid-rows-7 gap-1">
						{#each DAYS as day, index (day)}
							<div class="flex items-center text-[10px] leading-none text-zinc-700">{index % 2 === 0 ? day : ''}</div>
						{/each}
					</div>

					<div
						class="grid gap-1"
						style="grid-template-columns: repeat({weeks.length}, minmax(0, 1fr));"
						role="img"
						aria-label="GitHub contribution calendar for the past year"
					>
						{#each weeks as week, weekIndex (weekIndex)}
							<div class="grid grid-rows-7 gap-1">
								{#each Array(7) as _, day (day)}
									{@const cell = week.find((candidate) => candidate.dayOfWeek === day)}
									{#if cell}
										<button
											type="button"
											class="aspect-square w-full min-w-0 cursor-pointer rounded-[3px] border border-black/20 transition duration-150 hover:scale-125 hover:border-zinc-300/60 {selectedDate === cell.date ? 'ring-2 ring-zinc-200 ring-offset-1 ring-offset-zinc-950' : ''}"
											style="background-color: {color(cell.count)}; opacity: {cell.count === 0 ? 0.62 : 1};"
											title="{cell.count} contributions on {cell.date}"
											onclick={() => selectCell(cell)}
											onmouseenter={(event) => showTip(event, `${cell.count} contributions · ${cell.date}`)}
											onmousemove={(event) => showTip(event, `${cell.count} contributions · ${cell.date}`)}
											onmouseleave={() => (pointer = null)}
											aria-label="{cell.count} contributions on {cell.date}"
										></button>
									{:else}
										<div class="aspect-square w-full rounded-[3px] bg-zinc-950"></div>
									{/if}
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{:else if mode === 'signal'}
		<div class="flex h-56 items-end gap-1 border-b border-zinc-800/80 px-1 pt-6" role="img" aria-label="Weekly contribution signal bars">
			{#each weeklySignal as week (week.index)}
				<button
					type="button"
					class="group flex min-w-1 flex-1 cursor-pointer items-end justify-center rounded-t border border-zinc-900 bg-zinc-900/80 transition hover:border-zinc-500"
					style="height: {Math.max(4, (week.count / Math.max(1, ...weeklySignal.map((item) => item.count))) * 100)}%;"
					onmouseenter={(event) => showTip(event, `Week ${week.index + 1}: ${week.count} contributions across ${week.active} days`)}
					onmousemove={(event) => showTip(event, `Week ${week.index + 1}: ${week.count} contributions across ${week.active} days`)}
					onmouseleave={() => (pointer = null)}
					aria-label="Week {week.index + 1}: {week.count} contributions"
				>
					<span class="h-full w-full rounded-t opacity-70 transition group-hover:opacity-100" style="background-color: {color(Math.round(week.count / Math.max(1, week.active)))}"></span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="overflow-x-auto pb-1">
			<div class="min-w-max space-y-1">
				<div class="flex items-center gap-1 pb-1 pl-9">
					{#each monthWeekdayGrid.monthShort as label, mi (mi)}
						<span class="w-10 text-center text-[10px] text-zinc-600">{label}</span>
					{/each}
				</div>
				{#each monthWeekdayGrid.grid as row, dayIdx (dayIdx)}
					<div class="flex items-center gap-1">
						<span class="w-8 shrink-0 text-right text-[10px] text-zinc-500">{DAYS[dayIdx]}</span>
						{#each row as avg, mi (mi)}
							<button
								type="button"
								class="h-8 w-10 rounded-[3px] transition duration-100 hover:ring-1 hover:ring-zinc-400"
								style="background-color: {color(avg)}; opacity: {avg === 0 ? 0.38 : 1};"
								onmouseenter={(e) => showTip(e, `${DAYS[dayIdx]} · ${monthWeekdayGrid.months[mi]}: avg ${avg} contributions`)}
								onmousemove={(e) => showTip(e, `${DAYS[dayIdx]} · ${monthWeekdayGrid.months[mi]}: avg ${avg} contributions`)}
								onmouseleave={() => (pointer = null)}
								aria-label="{DAYS[dayIdx]} in {monthWeekdayGrid.months[mi]}: avg {avg} contributions"
							></button>
						{/each}
						<span class="w-8 shrink-0 text-right text-[10px] tabular-nums text-zinc-600">{weekdayTotals[dayIdx].count}</span>
					</div>
				{/each}
			</div>
			<p class="mt-3 text-[10px] text-zinc-700">Average contributions per weekday per month</p>
		</div>
	{/if}

	<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
		<div class="flex items-center gap-2">
			<span>less</span>
			{#each ['#14181f', '#223028', '#31503c', '#4b7c59', '#87a96b', '#c8d08a'] as swatch (swatch)}
				<span class="h-3 w-3 rounded-[3px] border border-black/20" style="background-color: {swatch}"></span>
			{/each}
			<span>more</span>
		</div>
		<p class="text-zinc-600">
			{#if selectedCell}
				{selectedCell.date}: {selectedCell.count} contributions
			{:else if bestCell}
				Peak day: {bestCell.date} with {bestCell.count} contributions
			{/if}
		</p>
	</div>

	{#if pointer}
		<div
			class="pointer-events-none fixed z-50 rounded-md border border-zinc-700 bg-zinc-950/95 px-2.5 py-1.5 text-xs text-zinc-200 shadow-xl shadow-black/40"
			style="left: {pointer.x + 12}px; top: {pointer.y + 12}px;"
		>
			{pointer.text}
		</div>
	{/if}
</div>
