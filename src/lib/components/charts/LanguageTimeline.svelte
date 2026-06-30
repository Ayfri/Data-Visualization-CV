<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { langColor } from '$lib/data/github-colors';

	interface Props {
		items: { semester: string; languages: Record<string, number> }[];
	}

	let { items }: Props = $props();

	const NOISE_LANGUAGES = new Set([
		'TOML', 'CSS', 'YAML', 'JSON', 'Markdown', 'Dockerfile',
		'Shell', 'Makefile', 'XML', 'HTML', 'Text', 'EditorConfig',
	]);


	const PAD = { top: 20, right: 16, bottom: 48, left: 36 };
	const W = 900;
	const H = 320;
	const innerW = W - PAD.left - PAD.right;
	const innerH = H - PAD.top - PAD.bottom;

	let hoveredLanguage = $state<string | null>(null);
	let tooltip = $state<{ x: number; y: number; label: string; value: number; semester: string } | null>(null);
	let svgEl = $state<SVGSVGElement | undefined>(undefined);

	const languages = $derived.by(() => {
		const totals = new SvelteMap<string, number>();
		for (const item of items) {
			for (const [lang, count] of Object.entries(item.languages)) {
				if (NOISE_LANGUAGES.has(lang)) continue;
				totals.set(lang, (totals.get(lang) ?? 0) + count);
			}
		}
		return [...totals.entries()]
			.sort(([, a], [, b]) => b - a)
			.slice(0, 6)
			.map(([name]) => name);
	});

	const maxValue = $derived(
		Math.max(
			1,
			...items.flatMap((item) =>
				languages.map((lang) => item.languages[lang] ?? 0),
			),
		),
	);

	function xFor(index: number): number {
		if (items.length <= 1) return PAD.left + innerW / 2;
		return PAD.left + (index / (items.length - 1)) * innerW;
	}

	function yFor(value: number): number {
		return PAD.top + innerH - (value / maxValue) * innerH;
	}

	function smoothPath(points: [number, number][]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
		let d = `M ${points[0][0]} ${points[0][1]}`;
		for (let i = 1; i < points.length; i++) {
			const [x0, y0] = points[i - 1];
			const [x1, y1] = points[i];
			const cpx = (x0 + x1) / 2;
			d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
		}
		return d;
	}

	function pointsFor(lang: string): [number, number][] {
		return items.map((item, i) => [xFor(i), yFor(item.languages[lang] ?? 0)]);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const svgX = ((e.clientX - rect.left) / rect.width) * W;
		const svgY = ((e.clientY - rect.top) / rect.height) * H;

		// find nearest semester
		let nearestIdx = 0;
		let nearestDist = Infinity;
		for (let i = 0; i < items.length; i++) {
			const dist = Math.abs(xFor(i) - svgX);
			if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
		}

		if (nearestDist > innerW / items.length) {
			tooltip = null;
			return;
		}

		// find nearest language line
		const lang = hoveredLanguage ?? languages[0];
		if (!lang) return;

		const value = items[nearestIdx].languages[lang] ?? 0;
		tooltip = {
			x: xFor(nearestIdx),
			y: yFor(value),
			label: lang,
			value,
			semester: items[nearestIdx].semester,
		};
	}

	const yTicks = $derived.by(() => {
		const step = Math.ceil(maxValue / 4);
		const ticks: number[] = [];
		for (let v = 0; v <= maxValue; v += step) ticks.push(v);
		return ticks;
	});

	const yearTicks = $derived.by(() => {
		const seen = new SvelteSet<string>();
		return items
			.map((item, i) => ({ year: item.semester.slice(0, 4), i }))
			.filter(({ year }) => {
				if (seen.has(year)) return false;
				seen.add(year);
				return true;
			});
	});
</script>

<div class="space-y-4">
	<!-- Legend -->
	<div class="flex flex-wrap gap-2">
		{#each languages as lang, i (lang)}
			<button
				type="button"
				class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition
					{hoveredLanguage === lang
						? 'border-zinc-500 bg-zinc-900 text-zinc-100'
						: 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600'}"
				onclick={() => (hoveredLanguage = hoveredLanguage === lang ? null : lang)}
			>
				<span class="h-2 w-2 rounded-full" style="background-color: {langColor(lang, i)}"></span>
				{lang}
			</button>
		{/each}
	</div>

	<!-- Chart -->
	<div class="relative w-full overflow-x-auto">
		<svg
			bind:this={svgEl}
			viewBox="0 0 {W} {H}"
			class="w-full"
			style="min-width: 480px; height: auto;"
			onmousemove={handleMouseMove}
			onmouseleave={() => { tooltip = null; }}
			role="img"
			aria-label="Language usage over semesters"
		>
			<!-- Y axis ticks only (no horizontal grid) -->
			{#each yTicks as tick (tick)}
				<text
					x={PAD.left - 6}
					y={yFor(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					fill="#52525b"
					font-size="10"
				>{tick}</text>
			{/each}

			<!-- Baseline -->
			<line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="#3f3f46" stroke-width="1" />

			<!-- Language lines -->
			{#each languages as lang, i (lang)}
				{@const pts = pointsFor(lang)}
				{@const active = !hoveredLanguage || hoveredLanguage === lang}
				<path
					d={smoothPath(pts)}
					fill="none"
					stroke={langColor(lang, i)}
					stroke-width={active ? 2 : 1}
					opacity={active ? 0.9 : 0.12}
					stroke-linejoin="round"
					stroke-linecap="round"
				/>
				<!-- Dots at each data point -->
				{#each pts as [px, py], j (j)}
					{@const val = items[j].languages[lang] ?? 0}
					{#if val > 0}
						<circle
							cx={px}
							cy={py}
							r={active ? 3 : 2}
							fill={langColor(lang, i)}
							opacity={active ? 0.9 : 0.12}
						/>
					{/if}
				{/each}
			{/each}

			<!-- Tooltip crosshair -->
			{#if tooltip}
				<line
					x1={tooltip.x}
					y1={PAD.top}
					x2={tooltip.x}
					y2={PAD.top + innerH}
					stroke="#52525b"
					stroke-width="1"
					stroke-dasharray="3 3"
				/>
				<circle cx={tooltip.x} cy={tooltip.y} r="5" fill="#09090b" stroke="#a1a1aa" stroke-width="1.5" />
			{/if}

			<!-- X axis: year labels only -->
			{#each yearTicks as { year, i } (year)}
				<line x1={xFor(i)} y1={PAD.top + innerH} x2={xFor(i)} y2={PAD.top + innerH + 4} stroke="#3f3f46" stroke-width="1" />
				<text
					x={xFor(i)}
					y={PAD.top + innerH + 14}
					text-anchor="middle"
					fill="#71717a"
					font-size="10"
				>{year}</text>
			{/each}
		</svg>

		<!-- Tooltip box -->
		{#if tooltip && svgEl}
			{@const rect = svgEl.getBoundingClientRect()}
			{@const relX = (tooltip.x / W) * 100}
			<div
				class="pointer-events-none absolute rounded border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs shadow-lg"
				style="left: {relX}%; top: 8px; transform: translateX({relX > 70 ? '-110%' : '8px'}); min-width: 120px;"
			>
				<p class="mb-1 font-medium text-zinc-300">{tooltip.semester}</p>
				<p class="text-zinc-400">{tooltip.label}: <span class="text-zinc-200">{tooltip.value} repo{tooltip.value !== 1 ? 's' : ''}</span></p>
			</div>
		{/if}
	</div>
</div>
