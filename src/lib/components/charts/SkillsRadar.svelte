<script lang="ts">
	import type { Skill } from '$lib/types';

	interface Props {
		skills: Skill[];
	}

	let { skills }: Props = $props();

	const CATEGORY_COLOR: Record<string, string> = {
		language: '#c8d08a',
		framework: '#a8a29e',
		tool: '#b8926a',
		'soft-skill': '#8aa1a8',
	};

	const SIZE = 300;
	const CX = SIZE / 2;
	const CY = SIZE / 2;
	const R = 110;
	const LEVELS = 5;

	// Separate by category for grouped display
	const categories = $derived.by(() => {
		const map = new Map<string, Skill[]>();
		for (const s of skills) {
			const arr = map.get(s.category) ?? [];
			arr.push(s);
			map.set(s.category, arr);
		}
		return map;
	});

	function polarToCart(angle: number, r: number): [number, number] {
		const rad = (angle - 90) * (Math.PI / 180);
		return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
	}

	// Radar per category, side by side
	const catEntries = $derived(Array.from(categories.entries()));

	function radarPoints(catSkills: Skill[], radiusScale: number = 1): string {
		const n = catSkills.length;
		return catSkills
			.map((s, i) => {
				const angle = (360 / n) * i;
				const r = (s.level / 5) * R * radiusScale;
				const [x, y] = polarToCart(angle, r);
				return `${x},${y}`;
			})
			.join(' ');
	}

	function gridPoints(catSkills: Skill[], level: number): string {
		const n = catSkills.length;
		const r = (level / LEVELS) * R;
		return catSkills
			.map((_, i) => {
				const angle = (360 / n) * i;
				const [x, y] = polarToCart(angle, r);
				return `${x},${y}`;
			})
			.join(' ');
	}
</script>

<div class="flex flex-wrap justify-center gap-8">
	{#each catEntries as [category, catSkills] (category)}
		{@const color = CATEGORY_COLOR[category] ?? '#64748b'}
		<div class="flex flex-col items-center gap-3">
			<!-- Category label -->
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-full" style="background-color: {color}"></div>
				<span class="text-xs font-medium capitalize text-zinc-500">{category.replace('-', ' ')}</span>
			</div>

			<svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" class="overflow-visible">
				<!-- Grid rings -->
				{#each Array(LEVELS) as _, l (l)}
					<polygon
						points={gridPoints(catSkills, l + 1)}
						fill="none"
						stroke="#27272a"
						stroke-width="1"
					/>
				{/each}

				<!-- Spokes -->
				{#each catSkills as _, i (i)}
					{@const angle = (360 / catSkills.length) * i}
					{@const [x, y] = polarToCart(angle, R)}
					<line x1={CX} y1={CY} x2={x} y2={y} stroke="#27272a" stroke-width="1" />
				{/each}

				<!-- Data polygon -->
				<polygon
					points={radarPoints(catSkills)}
					fill={color}
					fill-opacity="0.15"
					stroke={color}
					stroke-width="2"
				/>

				<!-- Data points -->
				{#each catSkills as skill, i (skill.name)}
					{@const angle = (360 / catSkills.length) * i}
					{@const [x, y] = polarToCart(angle, (skill.level / 5) * R)}
					<circle cx={x} cy={y} r="4" fill={color} stroke="#09090b" stroke-width="2" />
				{/each}

				<!-- Labels -->
				{#each catSkills as skill, i (skill.name)}
					{@const angle = (360 / catSkills.length) * i}
					{@const [x, y] = polarToCart(angle, R + 22)}
					<text
						x={x}
						y={y}
						text-anchor="middle"
						dominant-baseline="middle"
						font-size="11"
						fill="#a1a1aa"
						font-family="system-ui, sans-serif"
					>
						{skill.name}
					</text>
				{/each}
			</svg>
		</div>
	{/each}
</div>

<!-- Level indicator -->
<div class="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-600">
	{#each [1, 2, 3, 4, 5] as level (level)}
		<div class="flex items-center gap-1.5">
			<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
			<span>{level}/5</span>
		</div>
	{/each}
</div>
