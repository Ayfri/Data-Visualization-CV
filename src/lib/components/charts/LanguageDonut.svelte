<script lang="ts">
	import type { LanguageSlice } from '$lib/types';
	import { langColor } from '$lib/data/github-colors';
	import { Braces, Code2 } from '@lucide/svelte';

	interface Props {
		slices: LanguageSlice[];
		topN?: number;
	}

	let { slices, topN = 10 }: Props = $props();

	type Metric = 'repos' | 'files' | 'bytes';

	let metric = $state<Metric>('repos');
	let activeName = $state<string | null>(null);

	const totalRepos = $derived(slices.reduce((sum, slice) => sum + slice.repoCount, 0));
	const totalFiles = $derived(slices.reduce((sum, slice) => sum + slice.fileCount, 0));
	const totalBytes = $derived(slices.reduce((sum, slice) => sum + slice.bytes, 0));
	const sortedSlices = $derived.by(() => {
		return [...slices].sort((a, b) => valueFor(b) - valueFor(a));
	});
	const metricTotal = $derived(Math.max(1, sortedSlices.reduce((sum, slice) => sum + valueFor(slice), 0)));
	const visible = $derived.by(() => {
		const main = sortedSlices.slice(0, topN);
		const rest = sortedSlices.slice(topN);
		if (rest.length === 0) return main;
		const otherRepoCount = rest.reduce((sum, slice) => sum + slice.repoCount, 0);
		const otherFileCount = rest.reduce((sum, slice) => sum + slice.fileCount, 0);
		const otherBytes = rest.reduce((sum, slice) => sum + slice.bytes, 0);
		return [
			...main,
			{
				name: 'Other',
				repoCount: otherRepoCount,
				fileCount: otherFileCount,
				bytes: otherBytes,
				percentage: percentageForValues(otherRepoCount, otherFileCount, otherBytes),
				repoPercentage: totalRepos === 0 ? 0 : (otherRepoCount / totalRepos) * 100,
				filePercentage: totalFiles === 0 ? 0 : (otherFileCount / totalFiles) * 100,
				bytePercentage: totalBytes === 0 ? 0 : (otherBytes / totalBytes) * 100,
			},
		];
	});

	const chartData = $derived.by(() => {
		let angle = -90;
		return visible.map((slice, index) => {
			const percentage = percentageFor(slice);
			const arcPercentage = (valueFor(slice) / metricTotal) * 100;
			const sweep = Math.max(0.75, (arcPercentage / 100) * 360);
			const segment = {
				...slice,
				percentage,
				arcPercentage,
				value: valueFor(slice),
				start: angle,
				end: angle + sweep,
				color: langColor(slice.name, index),
			};
			angle += sweep;
			return segment;
		});
	});

	const activeSlice = $derived(
		chartData.find((slice) => slice.name === activeName) ?? chartData[0] ?? null,
	);

	function point(angle: number, radius: number) {
		const radians = (angle * Math.PI) / 180;
		return {
			x: 150 + radius * Math.cos(radians),
			y: 150 + radius * Math.sin(radians),
		};
	}

	function arcPath(start: number, end: number, outer: number, inner: number) {
		const gap = 1.2;
		const startAngle = start + gap;
		const endAngle = end - gap;
		const largeArc = endAngle - startAngle > 180 ? 1 : 0;
		const outerStart = point(startAngle, outer);
		const outerEnd = point(endAngle, outer);
		const innerStart = point(startAngle, inner);
		const innerEnd = point(endAngle, inner);

		return [
			`M ${outerStart.x} ${outerStart.y}`,
			`A ${outer} ${outer} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${inner} ${inner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
			'Z',
		].join(' ');
	}

	function valueFor(slice: LanguageSlice) {
		if (metric === 'repos') return slice.repoCount;
		if (metric === 'files') return slice.fileCount;
		return slice.bytes;
	}

	function percentageFor(slice: LanguageSlice) {
		if (metric === 'repos') return slice.repoPercentage;
		if (metric === 'files') return slice.filePercentage;
		return slice.bytePercentage;
	}

	function percentageForValues(repoCount: number, fileCount: number, bytes: number) {
		if (metric === 'repos') return totalRepos === 0 ? 0 : (repoCount / totalRepos) * 100;
		if (metric === 'files') return totalFiles === 0 ? 0 : (fileCount / totalFiles) * 100;
		return totalBytes === 0 ? 0 : (bytes / totalBytes) * 100;
	}

	function formatBytes(bytes: number) {
		if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
		if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
		return `${bytes} B`;
	}

	function formatMetricValue(slice: LanguageSlice) {
		if (metric === 'repos') return `${slice.repoCount} repos`;
		if (metric === 'files') return `${slice.fileCount} files`;
		return formatBytes(slice.bytes);
	}

	function toggleLanguage(name: string) {
		activeName = activeName === name ? null : name;
	}

	function handleSegmentKeydown(event: KeyboardEvent, name: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleLanguage(name);
		}
	}
</script>

<div class="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-center">
	<div class="relative mx-auto h-80 w-80">
		<svg viewBox="0 0 300 300" class="h-full w-full overflow-visible" role="img" aria-label="Language byte distribution">
			<defs>
				<filter id="language-glow" x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur stdDeviation="3" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<circle cx="150" cy="150" r="112" fill="none" stroke="#18181b" stroke-width="28" />
			<circle cx="150" cy="150" r="72" fill="#09090b" stroke="#27272a" stroke-width="1" />
			{#each chartData as slice (slice.name)}
				<path
					d={arcPath(slice.start, slice.end, activeName === slice.name ? 136 : 128, 92)}
					fill={slice.color}
					fill-opacity={activeName && activeName !== slice.name ? 0.28 : 0.88}
					filter={activeName === slice.name ? 'url(#language-glow)' : undefined}
					class="cursor-pointer transition duration-200"
					onmouseenter={() => (activeName = slice.name)}
					onfocus={() => (activeName = slice.name)}
					onclick={() => toggleLanguage(slice.name)}
					onkeydown={(event) => handleSegmentKeydown(event, slice.name)}
					role="button"
					tabindex="0"
					aria-label="{slice.name}: {slice.percentage.toFixed(1)} percent"
				/>
			{/each}

			{#each chartData as slice, index (slice.name)}
				{@const middle = (slice.start + slice.end) / 2}
				{@const start = point(middle, 148)}
				{@const end = point(middle, 158 + (index % 2) * 10)}
				<line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#3f3f46" stroke-width="1" opacity={slice.percentage > 3 ? 1 : 0.25} />
			{/each}
		</svg>

		<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
			<Braces size={24} class="mb-2 text-zinc-500" />
			<p class="max-w-40 truncate text-2xl font-semibold text-zinc-100">{activeSlice?.name ?? 'Languages'}</p>
			<p class="text-sm text-zinc-500">{activeSlice ? `${activeSlice.percentage.toFixed(1)}%` : formatBytes(totalBytes)}</p>
			{#if activeSlice}
				<p class="mt-1 text-xs text-zinc-600">{formatMetricValue(activeSlice)}</p>
			{/if}
		</div>
	</div>

	<div class="space-y-3">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-600">
				<Code2 size={14} />
				language presence
			</div>
			<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
				{#each [{ id: 'repos', label: 'Repos' }, { id: 'files', label: 'Files' }, { id: 'bytes', label: 'Bytes' }] as option (option.id)}
					<button
						type="button"
						class="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition {metric === option.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
						onclick={() => (metric = option.id as Metric)}
						aria-pressed={metric === option.id}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		{#each chartData as lang (lang.name)}
			<button
				type="button"
				class="group grid w-full cursor-pointer grid-cols-[1rem_minmax(0,1fr)_6.5rem] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-left transition hover:border-zinc-600 hover:bg-zinc-900/70 {activeName === lang.name ? 'border-zinc-500 bg-zinc-900' : ''}"
				onclick={() => toggleLanguage(lang.name)}
			>
				<span class="h-3 w-3 rounded-sm" style="background-color: {lang.color}"></span>
				<span class="min-w-0">
					<span class="block truncate text-sm font-medium text-zinc-200">{lang.name}</span>
					<span class="mt-1 block h-1 overflow-hidden rounded-full bg-zinc-800">
						<span class="block h-full rounded-full" style="width: {lang.percentage}%; background-color: {lang.color}"></span>
					</span>
				</span>
				<span class="text-right text-xs tabular-nums text-zinc-500 group-hover:text-zinc-300">{lang.percentage.toFixed(1)}%</span>
			</button>
		{/each}

		<div class="grid grid-cols-3 gap-2 pt-2">
			<div class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">repos</p>
				<p class="text-lg font-semibold text-zinc-100">{chartData.length}</p>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">files</p>
				<p class="text-lg font-semibold text-zinc-100">{totalFiles.toLocaleString()}</p>
			</div>
			<div class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
				<p class="text-[10px] uppercase tracking-[0.18em] text-zinc-600">leader</p>
				<p class="truncate text-lg font-semibold text-zinc-100">{chartData[0]?.name ?? '-'}</p>
			</div>
		</div>
	</div>
</div>
