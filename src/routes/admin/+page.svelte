<script lang="ts">
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	const paymentStatusStyle: Record<string, string> = {
		unpaid: 'bg-warning-50 text-warning-600',
		paid: 'bg-success-50 text-success-600'
	};

	const paymentStatusLabel: Record<string, string> = {
		unpaid: 'Belum Bayar',
		paid: 'Lunas'
	};

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
	}
</script>

<div class="space-y-6">
	<!-- Page Title -->
	<div>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</p>
	</div>

	<!-- Stat Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Menu</span>
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
					<svg class="fill-brand-500" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.5858 2 11.25 2.33579 11.25 2.75V12C11.25 12.4142 11.5858 12.75 12 12.75H21.25C21.6642 12.75 22 12.4142 22 12C22 6.47715 17.5228 2 12 2ZM12.75 11.25V3.53263C13.2645 3.57761 13.7659 3.66843 14.25 3.80098C15.6929 4.19606 16.9827 4.96184 18.0104 5.98959C19.0382 7.01734 19.8039 8.30707 20.199 9.75C20.3316 10.2341 20.4224 10.7355 20.4674 11.25H12.75ZM2 12C2 7.25083 5.31065 3.27489 9.75 2.25415V3.80099C6.14748 4.78734 3.5 8.0845 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C15.9155 20.5 19.2127 17.8525 20.199 14.25H21.7459C20.7251 18.6894 16.7492 22 12 22C6.47715 22 2 17.5229 2 12Z" fill=""/></svg>
				</span>
			</div>
			<p class="mt-4 text-3xl font-semibold text-gray-800 dark:text-white">{data.stats.menus}</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</span>
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
					<svg class="fill-success-500" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5001C19.7427 20.75 20.7501 19.7426 20.7501 18.5V5.5C20.7501 4.25736 19.7427 3.25 18.5001 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5001C18.9143 4.75 19.2501 5.08579 19.2501 5.5V18.5C19.2501 18.9142 18.9143 19.25 18.5001 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM6.25005 9.7143C6.25005 9.30008 6.58583 8.9643 7.00005 8.9643L17 8.96429C17.4143 8.96429 17.75 9.30008 17.75 9.71429C17.75 10.1285 17.4143 10.4643 17 10.4643L7.00005 10.4643C6.58583 10.4643 6.25005 10.1285 6.25005 9.7143ZM6.25005 14.2857C6.25005 13.8715 6.58583 13.5357 7.00005 13.5357H17C17.4143 13.5357 17.75 13.8715 17.75 14.2857C17.75 14.6999 17.4143 15.0357 17 15.0357H7.00005C6.58583 15.0357 6.25005 14.6999 6.25005 14.2857Z" fill=""/></svg>
				</span>
			</div>
			<p class="mt-4 text-3xl font-semibold text-gray-800 dark:text-white">{data.stats.categories}</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Open Sessions</span>
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
					<svg class="fill-orange-500" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill=""/></svg>
				</span>
			</div>
			<p class="mt-4 text-3xl font-semibold text-gray-800 dark:text-white">{data.stats.openSessions}</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Tables</span>
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
					<svg class="fill-error-500" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z" fill=""/></svg>
				</span>
			</div>
			<p class="mt-4 text-3xl font-semibold text-gray-800 dark:text-white">{data.stats.tables}</p>
		</div>
	</div>

	<!-- Recent Sessions -->
	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
			<h2 class="text-base font-semibold text-gray-800 dark:text-white">Recent Sessions</h2>
			<a href="/admin/orders" class="text-sm text-brand-500 hover:text-brand-600">Lihat semua</a>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-100 dark:border-gray-800">
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Sesi</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Meja</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Pesanan</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Total</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Dibuka</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Pembayaran</th>
					</tr>
				</thead>
				<tbody>
					{#if data.recentSessions.length === 0}
						<tr>
							<td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">Belum ada sesi</td>
						</tr>
					{:else}
						{#each data.recentSessions as session}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<td class="px-5 py-3 font-mono text-sm text-brand-500">
									<a href="/admin/orders/{session.id}" class="hover:text-brand-600">#{session.id.slice(0, 8)}</a>
								</td>
								<td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{session.table?.name ?? '-'}</td>
								<td class="px-5 py-3 text-sm text-gray-500">{session.batches.length} batch · {session.batches.reduce((s, b) => s + b.items.length, 0)} items</td>
								<td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">{formatRupiah(session.totalPrice)}</td>
								<td class="px-5 py-3 text-sm text-gray-500">{formatDate(session.openedAt)}</td>
								<td class="px-5 py-3">
									<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium {paymentStatusStyle[session.paymentStatus] ?? ''}">
										{paymentStatusLabel[session.paymentStatus] ?? session.paymentStatus}
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
