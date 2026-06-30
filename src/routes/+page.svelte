<script lang="ts">
	import type { PageData } from './$types';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Projects from '$lib/components/sections/Projects.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Gaming from '$lib/components/sections/Gaming.svelte';
	import ContributionHeatmap from '$lib/components/charts/ContributionHeatmap.svelte';
	import LanguageDonut from '$lib/components/charts/LanguageDonut.svelte';
	import { toHeatmapCells, toLanguageSlices } from '$lib/transforms/github';

	let { data }: { data: PageData } = $props();

	const heatmapCells = $derived(toHeatmapCells(data.github.contributionCalendar));
	const languageSlices = $derived(toLanguageSlices(data.github.languageBytes));
</script>

<main class="min-h-screen bg-gray-950 text-gray-100">
	<Hero />

	<!-- GitHub -->
	<section class="mx-auto max-w-5xl px-6 py-16">
		<h2 class="text-2xl font-semibold">GitHub Activity</h2>

		{#if heatmapCells.length > 0}
			<div class="mt-6">
				<h3 class="mb-3 text-base font-medium text-gray-300">Contribution calendar</h3>
				<ContributionHeatmap cells={heatmapCells} />
			</div>
		{/if}

		{#if languageSlices.length > 0}
			<div class="mt-10">
				<h3 class="mb-3 text-base font-medium text-gray-300">Languages</h3>
				<LanguageDonut slices={languageSlices} />
			</div>
		{/if}
	</section>

	<Projects github={data.github} />

	<Skills skills={data.skills} timeline={data.timeline} />

	<Gaming steam={data.steam} discord={data.discord} />
</main>
