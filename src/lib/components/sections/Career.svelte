<script lang="ts">
	import type { TimelineEntry } from '$lib/types';
	import CareerTimeline from '$lib/components/charts/CareerTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	interface Props {
		timeline: TimelineEntry[];
	}

	let { timeline }: Props = $props();
</script>

<section class="mx-auto max-w-7xl px-6 py-16">
	<SectionHeading
		title="Career"
		subtitle="Education, shipped projects, articles, internships, and product milestones"
		accent="emerald"
	/>
	<CareerTimeline entries={timeline} />
</section>
