<script lang="ts">
	import type { Skill, TimelineEntry } from '$lib/types';
	import SkillsRadar from '$lib/components/charts/SkillsRadar.svelte';
	import CareerTimeline from '$lib/components/charts/CareerTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	interface Props {
		skills: Skill[];
		timeline: TimelineEntry[];
	}

	let { skills, timeline }: Props = $props();

	const LEVEL_LABEL = ['', 'Familiar', 'Competent', 'Proficient', 'Advanced', 'Expert'];
	const CATEGORY_ORDER = ['language', 'framework', 'tool', 'soft-skill'] as const;

	const byCategory = $derived(() => {
		return CATEGORY_ORDER.map((cat) => ({
			category: cat,
			skills: skills.filter((s) => s.category === cat).sort((a, b) => b.level - a.level),
		})).filter((g) => g.skills.length > 0);
	});

	const CATEGORY_COLOR: Record<string, string> = {
		language: 'emerald',
		framework: 'violet',
		tool: 'amber',
		'soft-skill': 'blue',
	};

	const LEVEL_COLOR = ['', 'bg-slate-600', 'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-emerald-400'];
</script>

<section class="mx-auto max-w-5xl px-6 py-16">
	<SectionHeading
		title="Skills"
		subtitle="Technical proficiency across languages, frameworks, and tools"
		accent="violet"
	/>

	<!-- Skill bars by category -->
	<div class="mb-12 grid gap-8 sm:grid-cols-2">
		{#each byCategory() as group (group.category)}
			<div>
				<h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
					{group.category.replace('-', ' ')}
				</h3>
				<div class="space-y-3">
					{#each group.skills as skill (skill.name)}
						<div>
							<div class="mb-1.5 flex items-center justify-between">
								<span class="text-sm font-medium text-slate-300">{skill.name}</span>
								<span class="text-xs text-slate-500">{LEVEL_LABEL[skill.level]}</span>
							</div>
							<div class="flex gap-1">
								{#each Array(5) as _, i (i)}
									<div
										class="h-1.5 flex-1 rounded-full transition-all {i < skill.level ? LEVEL_COLOR[skill.level] : 'bg-slate-800'}"
									></div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Radar chart -->
	<div class="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
		<h3 class="mb-6 text-sm font-medium text-slate-400">Proficiency radar</h3>
		<SkillsRadar {skills} />
	</div>
</section>

<section class="mx-auto max-w-5xl px-6 py-16">
	<SectionHeading
		title="Career"
		subtitle="Education, work experience, and key milestones"
		accent="emerald"
	/>
	<CareerTimeline entries={timeline} />
</section>
