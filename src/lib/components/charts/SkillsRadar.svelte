<script lang="ts">
	import type { Skill } from '$lib/types';

	interface Props {
		skills: Skill[];
	}

	let { skills }: Props = $props();
</script>

<!-- TODO: replace with LayerChart Radar chart -->
<ul class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
	{#each skills as skill (skill.name)}
		<li class="flex flex-col gap-1">
			<span>{skill.name}</span>
			<div class="h-1.5 w-full rounded bg-gray-700">
				<div
					class="h-full rounded bg-emerald-500 transition-all"
					style="width: {(skill.level / 5) * 100}%"
				></div>
			</div>
		</li>
	{/each}
</ul>
