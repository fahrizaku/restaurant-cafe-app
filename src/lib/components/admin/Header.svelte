<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { subscribeRealtime, type RealtimeConfig } from '$lib/realtime';
	import { initNotificationSound, playNotificationSound } from '$lib/notification-sound';

	let {
		sidebarToggle = false,
		onToggleSidebar,
		pusher = null
	}: {
		sidebarToggle: boolean;
		onToggleSidebar: () => void;
		pusher?: RealtimeConfig | null;
	} = $props();

	type Notif = {
		id: string;
		sessionId: string;
		type: 'order' | 'payment';
		time: Date;
		read: boolean;
	};

	let notifOpen = $state(false);
	let userOpen = $state(false);
	let notifications = $state<Notif[]>([]);

	const unreadCount = $derived(notifications.filter((n) => !n.read).length);

	function addNotif(sessionId: string, type: Notif['type']) {
		notifications.unshift({
			id: crypto.randomUUID(),
			sessionId,
			type,
			time: new Date(),
			read: false
		});
		// Simpan maksimal 20 notif
		if (notifications.length > 20) notifications = notifications.slice(0, 20);
	}

	function openNotif() {
		notifOpen = !notifOpen;
		userOpen = false;
		if (notifOpen) {
			// Tandai semua sudah dibaca
			notifications = notifications.map((n) => ({ ...n, read: true }));
		}
	}

	function goToSession(sessionId: string) {
		notifOpen = false;
		goto(`/admin/orders/${sessionId}`);
	}

	function formatRelativeTime(date: Date): string {
		const diff = Math.floor((Date.now() - date.getTime()) / 1000);
		if (diff < 60) return 'Baru saja';
		if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
		return `${Math.floor(diff / 3600)} jam lalu`;
	}

	onMount(() => {
		const cleanupSound = initNotificationSound();
		const cleanupRealtime = subscribeRealtime(pusher, 'admin-orders', (event, data) => {
			if (event === 'new-batch' || event === 'payment-requested') {
				const d = data as { sessionId: string };
				addNotif(d.sessionId, event === 'new-batch' ? 'order' : 'payment');
				playNotificationSound();
			}
		});
		return () => {
			cleanupSound();
			cleanupRealtime();
		};
	});
</script>

<header
	class="sticky top-0 z-[99999] flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
>
	<div class="flex grow items-center justify-between px-4 py-3 lg:px-6">
		<!-- Left: Hamburger -->
		<button
			onclick={onToggleSidebar}
			class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:hidden dark:border-gray-800 dark:text-gray-400"
			aria-label="Toggle sidebar"
		>
			<svg class="fill-current" width="16" height="12" viewBox="0 0 16 12" fill="none">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
					fill=""
				/>
			</svg>
		</button>

		<!-- Right: Actions -->
		<div class="ml-auto flex items-center gap-3">
			<!-- Notifications -->
			<div class="relative">
				<button
					onclick={openNotif}
					class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
					aria-label="Notifications"
				>
					<svg class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
							fill=""
						/>
					</svg>
					{#if unreadCount > 0}
						<span
							class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
						>
							{unreadCount > 9 ? '9+' : unreadCount}
						</span>
					{/if}
				</button>

				{#if notifOpen}
					<div
						class="shadow-theme-lg absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
					>
						<div
							class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800"
						>
							<h3 class="text-sm font-semibold text-gray-800 dark:text-white">Notifikasi</h3>
							{#if notifications.length > 0}
								<button
									onclick={() => (notifications = [])}
									class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								>
									Hapus semua
								</button>
							{/if}
						</div>

						<ul class="max-h-80 overflow-y-auto">
							{#if notifications.length === 0}
								<li class="px-4 py-8 text-center text-sm text-gray-400">
									Belum ada notifikasi
								</li>
							{:else}
								{#each notifications as notif (notif.id)}
									<li>
										<button
											onclick={() => goToSession(notif.sessionId)}
											class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5
											{!notif.read ? 'bg-blue-50 dark:bg-blue-500/5' : ''}"
										>
											{#if notif.type === 'payment'}
												<span
													class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10"
												>
													<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
														<path
															d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
														/>
														<path
															fill-rule="evenodd"
															d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
															clip-rule="evenodd"
														/>
													</svg>
												</span>
											{:else}
												<span
													class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/10"
												>
													<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
														<path
															d="M3 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 13.846 4.632 16 6.414 16H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z"
														/>
													</svg>
												</span>
											{/if}
											<div class="flex-1 min-w-0">
												<p class="text-sm font-medium text-gray-800 dark:text-white">
													{notif.type === 'payment'
														? 'Klaim transfer masuk'
														: 'Order baru masuk'}
												</p>
												<p class="truncate text-xs text-gray-500">
													Sesi #{notif.sessionId.slice(0, 8)}
												</p>
												<p class="text-xs text-gray-400 mt-0.5">
													{formatRelativeTime(notif.time)}
												</p>
											</div>
											{#if !notif.read}
												<span class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
											{/if}
										</button>
									</li>
								{/each}
							{/if}
						</ul>

						<div class="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
							<a
								href="/admin/orders"
								onclick={() => (notifOpen = false)}
								class="block text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								Lihat semua order →
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- User Dropdown -->
			<div class="relative">
				<button
					onclick={() => {
						userOpen = !userOpen;
						notifOpen = false;
					}}
					class="flex items-center gap-2 text-gray-700 dark:text-gray-400"
					aria-label="User menu"
				>
					<div
						class="bg-brand-500 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
					>
						A
					</div>
					<span class="hidden text-sm font-medium lg:block">Admin</span>
					<svg
						class="stroke-gray-500 dark:stroke-gray-400"
						class:rotate-180={userOpen}
						width="16"
						height="16"
						viewBox="0 0 18 20"
						fill="none"
					>
						<path
							d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
							stroke=""
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				{#if userOpen}
					<div
						class="shadow-theme-lg absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
					>
						<ul class="flex flex-col gap-1 border-b border-gray-200 pb-3 dark:border-gray-800">
							<li>
								<a
									href="/"
									class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
								>
									View Restaurant Site
								</a>
							</li>
						</ul>
						<button
							class="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
						>
							Sign out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

{#if userOpen || notifOpen}
	<div
		class="fixed inset-0 z-[9999]"
		onclick={() => {
			userOpen = false;
			notifOpen = false;
		}}
		role="presentation"
	></div>
{/if}
