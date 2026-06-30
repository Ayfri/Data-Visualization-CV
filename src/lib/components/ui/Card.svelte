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
	class="rounded-md border border-zinc-800 bg-zinc-950/70 p-5 {hover ? 'transition duration-200 hover:border-zinc-600 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/30' : ''} {cls}"
>
	{@render children()}
</div>
