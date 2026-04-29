<script lang="ts">
	import '$lib/styles/admin.css';
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import Header from '$lib/components/admin/Header.svelte';

	let { children } = $props();
	let sidebarToggle = $state(false);
</script>

<div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-outfit">
	<Sidebar {sidebarToggle} />

	<div class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
		<Header {sidebarToggle} onToggleSidebar={() => sidebarToggle = !sidebarToggle} />

		<main class="p-4 md:p-6">
			{@render children()}
		</main>
	</div>
</div>
