<script lang="ts">
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	const maxRevenue = $derived(
		data.dailyRevenue.length > 0 ? Math.max(...data.dailyRevenue.map((r) => r.revenue)) : 1
	);

	function formatDay(dateStr: string) {
		const [y, m, d] = dateStr.split('-').map(Number);
		return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}

	const periodOptions = [
		{ days: 7, label: '7 Hari' },
		{ days: 30, label: '30 Hari' },
		{ days: 90, label: '90 Hari' }
	];
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Laporan</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Rekap pendapatan {data.days} hari terakhir
			</p>
		</div>
		<div class="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
			{#each periodOptions as opt}
				<a
					href="/admin/reports?days={opt.days}"
					class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
						{data.days === opt.days
						? 'bg-brand-500 text-white'
						: 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}"
				>
					{opt.label}
				</a>
			{/each}
		</div>
	</div>

	<!-- Summary cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pendapatan</p>
			<p class="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
				{formatRupiah(data.summary.revenue)}
			</p>
			<p class="mt-1 text-xs text-gray-400">{data.days} hari terakhir</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah Transaksi</p>
			<p class="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
				{data.summary.sessions}
			</p>
			<p class="mt-1 text-xs text-gray-400">Sesi selesai & lunas</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata / Transaksi</p>
			<p class="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
				{formatRupiah(data.summary.avgPerSession)}
			</p>
			<p class="mt-1 text-xs text-gray-400">Per sesi</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
		<!-- Daily revenue table -->
		<div class="rounded-2xl border border-gray-200 bg-white xl:col-span-3 dark:border-gray-800 dark:bg-gray-900">
			<div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
				<h2 class="text-base font-semibold text-gray-800 dark:text-white">Pendapatan Harian</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-100 dark:border-gray-800">
							<th class="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tanggal</th>
							<th class="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Transaksi</th>
							<th class="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Pendapatan</th>
						</tr>
					</thead>
					<tbody>
						{#if data.dailyRevenue.length === 0}
							<tr>
								<td colspan="3" class="px-5 py-10 text-center text-sm text-gray-400">
									Belum ada data pendapatan
								</td>
							</tr>
						{:else}
							{#each data.dailyRevenue as row}
								<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
									<td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
										{formatDay(row.day)}
									</td>
									<td class="px-5 py-3 text-right text-sm text-gray-500">{row.sessionCount}</td>
									<td class="px-5 py-3">
										<div class="flex flex-col items-end gap-1">
											<span class="text-sm font-medium text-gray-800 dark:text-white">
												{formatRupiah(row.revenue)}
											</span>
											<div class="h-1 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
												<div
													class="bg-brand-500 h-full rounded-full"
													style="width: {Math.round((row.revenue / maxRevenue) * 100)}%"
												></div>
											</div>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Top items -->
		<div class="rounded-2xl border border-gray-200 bg-white xl:col-span-2 dark:border-gray-800 dark:bg-gray-900">
			<div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
				<h2 class="text-base font-semibold text-gray-800 dark:text-white">Item Terlaris</h2>
			</div>
			{#if data.topItems.length === 0}
				<p class="px-5 py-10 text-center text-sm text-gray-400">Belum ada data</p>
			{:else}
				<ul class="divide-y divide-gray-100 dark:divide-gray-800">
					{#each data.topItems as item, i}
						<li class="flex items-center gap-3 px-5 py-3">
							<span class="w-5 shrink-0 text-center text-xs font-semibold text-gray-400">
								{i + 1}
							</span>
							<img
								src={item.image ?? '/placeholder.svg'}
								alt={item.name}
								class="h-9 w-9 shrink-0 rounded-lg object-cover"
							/>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-gray-800 dark:text-white">{item.name}</p>
								<p class="text-xs text-gray-400">{item.totalQty} terjual</p>
							</div>
							<span class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
								{formatRupiah(item.totalRevenue)}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
