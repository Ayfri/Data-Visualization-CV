<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		hover?: boolean;
	}

	let { children, class: cls = '', hover = false }: Props = $props();
</script>

<div
	class="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm {hover ? 'transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/20' : ''} {cls}"
>
	{@render children()}
</div>
