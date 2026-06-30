<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: cls = '' }: Props = $props();
</script>

<div class="rounded-lg border border-gray-800 bg-gray-900 p-5 {cls}">
	{@render children()}
</div>
