<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		accent?: 'emerald' | 'violet' | 'amber';
	}

	let { title, subtitle, accent = 'emerald' }: Props = $props();

	const accentClasses: Record<string, string> = {
		emerald: 'from-emerald-500 to-teal-400',
		violet: 'from-violet-500 to-purple-400',
		amber: 'from-amber-500 to-yellow-400',
	};
</script>

<div class="mb-10">
	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
		<div class="h-1.5 w-1.5 rotate-45 bg-slate-600"></div>
	</div>
	<div class="mt-4">
		<h2 class="text-3xl font-bold tracking-tight text-white">{title}</h2>
		<div class="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r {accentClasses[accent]}"></div>
		{#if subtitle}
			<p class="mt-3 text-sm text-slate-400">{subtitle}</p>
		{/if}
	</div>
</div>
