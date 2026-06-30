<script lang="ts">
	import type { Skill, TimelineEntry } from '$lib/types';
	import SkillsRadar from '$lib/components/charts/SkillsRadar.svelte';
	import CareerTimeline from '$lib/components/charts/CareerTimeline.svelte';

	interface Props {
		skills: Skill[];
		timeline: TimelineEntry[];
	}

	let { skills, timeline }: Props = $props();
</script>

<section class="mx-auto max-w-5xl px-6 py-16">
	<h2 class="text-2xl font-semibold">Skills</h2>
	<div class="mt-6">
		<SkillsRadar {skills} />
	</div>
</section>

<section class="mx-auto max-w-5xl px-6 py-16">
	<h2 class="text-2xl font-semibold">Career</h2>
	<div class="mt-6">
		<CareerTimeline entries={timeline} />
	</div>
</section>
