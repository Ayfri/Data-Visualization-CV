<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		accent?: 'emerald' | 'violet' | 'amber';
	}

	let { title, subtitle, accent = 'emerald' }: Props = $props();

	const accentClasses: Record<string, string> = {
		emerald: 'from-lime-200 to-stone-500',
		violet: 'from-zinc-300 to-zinc-600',
		amber: 'from-stone-200 to-amber-700',
	};
</script>

<div class="mb-10">
	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-linear-to-r from-transparent to-zinc-800"></div>
		<div class="h-1.5 w-1.5 rotate-45 bg-zinc-600"></div>
	</div>
	<div class="mt-4">
		<h2 class="text-3xl font-semibold tracking-tight text-zinc-100">{title}</h2>
		<div class="mt-2 h-0.5 w-12 rounded-full bg-linear-to-r {accentClasses[accent]}"></div>
		{#if subtitle}
			<p class="mt-3 text-sm text-zinc-500">{subtitle}</p>
		{/if}
	</div>
</div>
