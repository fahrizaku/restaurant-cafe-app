<script lang="ts">
	let { sidebarToggle = false, onToggleSidebar }: {
		sidebarToggle: boolean;
		onToggleSidebar: () => void;
	} = $props();

	let notifOpen = $state(false);
	let userOpen = $state(false);
</script>

<header class="sticky top-0 z-[99999] flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
	<div class="flex grow items-center justify-between px-4 py-3 lg:px-6">
		<!-- Left: Hamburger -->
		<button
			onclick={onToggleSidebar}
			class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 lg:hidden"
			aria-label="Toggle sidebar"
		>
			<svg class="fill-current" width="16" height="12" viewBox="0 0 16 12" fill="none">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill=""/>
			</svg>
		</button>

		<!-- Right: Actions -->
		<div class="ml-auto flex items-center gap-3">
			<!-- Notifications -->
			<div class="relative">
				<button
					onclick={() => { notifOpen = !notifOpen; userOpen = false; }}
					class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
					aria-label="Notifications"
				>
					<svg class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill=""/>
					</svg>
				</button>
			</div>

			<!-- User Dropdown -->
			<div class="relative">
				<button
					onclick={() => { userOpen = !userOpen; notifOpen = false; }}
					class="flex items-center gap-2 text-gray-700 dark:text-gray-400"
					aria-label="User menu"
				>
					<div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-semibold text-sm">
						A
					</div>
					<span class="hidden text-sm font-medium lg:block">Admin</span>
					<svg class="stroke-gray-500 dark:stroke-gray-400" class:rotate-180={userOpen} width="16" height="16" viewBox="0 0 18 20" fill="none">
						<path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>

				{#if userOpen}
					<div class="shadow-theme-lg absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
						<ul class="flex flex-col gap-1 border-b border-gray-200 pb-3 dark:border-gray-800">
							<li>
								<a href="/" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
									View Restaurant Site
								</a>
							</li>
						</ul>
						<button class="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
							Sign out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

{#if userOpen || notifOpen}
	<div class="fixed inset-0 z-[9999]" onclick={() => { userOpen = false; notifOpen = false; }} role="presentation"></div>
{/if}
