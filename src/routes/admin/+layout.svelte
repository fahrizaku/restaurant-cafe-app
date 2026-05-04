<script lang="ts">
	import '$lib/styles/admin.css';
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import Header from '$lib/components/admin/Header.svelte';

	let { children } = $props();
	let sidebarToggle = $state(false);
</script>

<div class="font-outfit flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
	<Sidebar {sidebarToggle} onClose={() => (sidebarToggle = false)} />

	{#if sidebarToggle}
		<div
			class="fixed inset-0 z-[99998] bg-black/50 lg:hidden"
			role="presentation"
			onclick={() => (sidebarToggle = false)}
		></div>
	{/if}

	<div class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
		<Header {sidebarToggle} onToggleSidebar={() => (sidebarToggle = !sidebarToggle)} />

		<main class="p-4 md:p-6">
			{@render children()}
		</main>
	</div>
</div>
