<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let deletingId = $state<string | null>(null);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Tables</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">{data.tables.length} tables</p>
		</div>
		<a href="/admin/tables/new" class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
			<svg class="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4V11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H12.75V20C12.75 20.4142 12.4142 20.75 12 20.75C11.5858 20.75 11.25 20.4142 11.25 20V12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H11.25V4C11.25 3.58579 11.5858 3.25 12 3.25Z" fill=""/>
			</svg>
			Add Table
		</a>
	</div>

	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-100 dark:border-gray-800">
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">ID</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Name</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Sessions</th>
						<th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if data.tables.length === 0}
						<tr>
							<td colspan="4" class="px-5 py-10 text-center text-sm text-gray-400">No tables yet</td>
						</tr>
					{:else}
						{#each data.tables as table}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<td class="px-5 py-3 font-mono text-sm text-gray-500">{table.id}</td>
								<td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">{table.name}</td>
								<td class="px-5 py-3 text-sm text-gray-500">{table.sessions.length}</td>
								<td class="px-5 py-3">
									<div class="flex items-center justify-end gap-2">
										<a
											href="/admin/tables/{table.id}"
											class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
											aria-label="Edit {table.name}"
										>
											<svg class="fill-current" width="14" height="14" viewBox="0 0 24 24" fill="none">
												<path fill-rule="evenodd" clip-rule="evenodd" d="M17.2929 2.29289C17.6834 1.90237 18.3166 1.90237 18.7071 2.29289L21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L9.70711 18.7071C9.51957 18.8946 9.26522 19 9 19H6C5.44772 19 5 18.5523 5 18V15C5 14.7348 5.10536 14.4804 5.29289 14.2929L14.2927 5.2931L17.2929 2.29289ZM15 7.41421L7 15.4142V17H8.58579L16.5858 9L15 7.41421ZM18 7.58579L16.4142 6L18 4.41421L19.5858 6L18 7.58579Z" fill=""/>
											</svg>
										</a>
										<form method="POST" action="?/delete" use:enhance={() => {
											deletingId = table.id;
											return async ({ update }) => { await update(); deletingId = null; };
										}}>
											<input type="hidden" name="id" value={table.id} />
											<button
												type="submit"
												disabled={deletingId === table.id}
												aria-label="Delete {table.name}"
												onclick={(e) => { if (!confirm(`Delete "${table.name}"?`)) e.preventDefault(); }}
												class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-error-500 hover:bg-error-50 dark:border-gray-800 dark:hover:bg-error-500/10"
											>
												<svg class="fill-current" width="14" height="14" viewBox="0 0 24 24" fill="none">
													<path fill-rule="evenodd" clip-rule="evenodd" d="M9 3.25C8.58579 3.25 8.25 3.58579 8.25 4V4.75H4C3.58579 4.75 3.25 5.08579 3.25 5.5C3.25 5.91421 3.58579 6.25 4 6.25H5.25V19C5.25 20.2426 6.25736 21.25 7.5 21.25H16.5C17.7426 21.25 18.75 20.2426 18.75 19V6.25H20C20.4142 6.25 20.75 5.91421 20.75 5.5C20.75 5.08579 20.4142 4.75 20 4.75H15.75V4C15.75 3.58579 15.4142 3.25 15 3.25H9ZM7.5 6.25H16.5V19C16.5 19.4142 16.1642 19.75 15.75 19.75H8.25C7.83579 19.75 7.5 19.4142 7.5 19V6.25ZM10 9.25C10.4142 9.25 10.75 9.58579 10.75 10V16C10.75 16.4142 10.4142 16.75 10 16.75C9.58579 16.75 9.25 16.4142 9.25 16V10C9.25 9.58579 9.58579 9.25 10 9.25ZM14.75 10C14.75 9.58579 14.4142 9.25 14 9.25C13.5858 9.25 13.25 9.58579 13.25 10V16C13.25 16.4142 13.5858 16.75 14 16.75C14.4142 16.75 14.75 16.4142 14.75 16V10Z" fill=""/>
												</svg>
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
