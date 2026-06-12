<script lang="ts">
	import '../../lib/styles/template.css';
	let { children } = $props();
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.css"
	/>
</svelte:head>

{@render children()}
