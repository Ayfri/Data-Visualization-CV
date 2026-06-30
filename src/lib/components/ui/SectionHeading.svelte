<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
	}

	let { title, subtitle }: Props = $props();
</script>

<div class="mb-6">
	<h2 class="text-2xl font-semibold">{title}</h2>
	{#if subtitle}
		<p class="mt-1 text-sm text-gray-400">{subtitle}</p>
	{/if}
</div>
