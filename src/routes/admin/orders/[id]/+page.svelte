<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();
	const session = $derived(data.session);

	const paymentMethodLabel: Record<string, string> = {
		cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank'
	};

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
	}

	function formatTime(date: Date | null) {
		if (!date) return '';
		return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-3 flex-wrap">
		<a href="/admin/orders" aria-label="Kembali"
			class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
			<svg class="fill-current" width="16" height="16" viewBox="0 0 24 24">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"/>
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
				Sesi <span class="font-mono">#{session.id.slice(0, 8)}</span>
			</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{session.table?.name} · Dibuka {formatDate(session.openedAt)}
			</p>
		</div>
		<div class="ml-2 flex gap-2">
			{#if session.status === 'open'}
				<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-600">
					<i class="ri-record-circle-fill text-[8px]"></i> Aktif
				</span>
			{:else if session.status === 'processing'}
				<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-500">
					<i class="ri-restaurant-line"></i> Diproses
				</span>
			{:else if session.status === 'cancelled'}
				<span class="inline-flex rounded-full bg-error-50 px-3 py-1 text-sm font-medium text-error-500">
					Dibatalkan
				</span>
			{:else}
				<span class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500 dark:bg-gray-800">
					Selesai
				</span>
			{/if}
			{#if session.paymentStatus === 'paid'}
				<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-600">
					<i class="ri-checkbox-circle-fill"></i> Lunas
				</span>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Batches -->
		<div class="lg:col-span-2 space-y-4">
			{#each session.batches as batch, i}
				<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
					<div class="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
						<div class="flex items-center gap-3">
							<span class="text-sm font-semibold text-gray-800 dark:text-white">
								Order #{session.batches.length - i}
							</span>
							<span class="text-xs text-gray-400">{formatTime(batch.createdAt)}</span>
						</div>
						<span class="text-sm font-semibold text-gray-800 dark:text-white">
							{formatRupiah(batch.totalPrice)}
						</span>
					</div>

					<!-- Items -->
					<div class="divide-y divide-gray-50 dark:divide-gray-800">
						{#each batch.items as item}
							<div class="flex items-center gap-3 px-5 py-3">
								<img src={item.menu?.image ?? '/img/product-1.png'} alt={item.menu?.name}
									class="h-10 w-10 rounded-lg object-cover" />
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-800 dark:text-white">{item.menu?.name ?? 'Unknown'}</p>
									{#if item.notes}
										<p class="text-xs text-gray-400">Catatan: {item.notes}</p>
									{/if}
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-gray-800 dark:text-white">{formatRupiah(item.priceAtTime * item.quantity)}</p>
									<p class="text-xs text-gray-400">{item.quantity} × {formatRupiah(item.priceAtTime)}</p>
								</div>
							</div>
						{/each}
					</div>

				</div>
			{/each}
		</div>

		<!-- Sidebar -->
		<div class="space-y-4">
			<!-- Session Info -->
			<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<h2 class="mb-4 text-base font-semibold text-gray-800 dark:text-white">Info Sesi</h2>
				<dl class="space-y-3">
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Meja</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{session.table?.name ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Pesanan</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">
							{session.batches.length} batch · {session.batches.reduce((s, b) => s + b.items.length, 0)} item
						</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Total Tagihan</dt>
						<dd class="mt-1 text-lg font-semibold text-gray-800 dark:text-white">{formatRupiah(session.totalPrice)}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Pembayaran</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">
							{#if session.paymentStatus === 'paid'}
								<span class="font-medium text-success-600">Lunas</span>
								{#if session.paymentMethod}· {paymentMethodLabel[session.paymentMethod]}{/if}
							{:else}
								<span class="text-gray-400">Belum Bayar</span>
							{/if}
						</dd>
					</div>
					{#if session.closedAt}
						<div>
							<dt class="text-xs font-medium uppercase text-gray-400">Ditutup</dt>
							<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatDate(session.closedAt)}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Payment -->
			{#if session.paymentStatus === 'unpaid' && session.status === 'open'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-1 text-base font-semibold text-gray-800 dark:text-white">Pembayaran</h2>
					<p class="mb-4 text-xs text-gray-400">Sesi akan otomatis ditutup setelah konfirmasi.</p>
					<form method="POST" action="?/markPaid" use:enhance class="space-y-3">
						<fieldset class="space-y-2">
							<legend class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Pilih Metode</legend>
							{#each [['cash', 'Tunai', 'ri-money-dollar-circle-line'], ['qris', 'QRIS', 'ri-qr-code-line'], ['transfer', 'Transfer Bank', 'ri-bank-line']] as [val, label, icon]}
								<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors has-[:checked]:border-success-400 has-[:checked]:bg-success-50 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
									<input type="radio" name="paymentMethod" value={val} class="accent-success-600" required />
									<i class="{icon} text-base text-gray-500"></i>
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
								</label>
							{/each}
						</fieldset>
						<button type="submit"
							class="w-full rounded-xl bg-success-500 py-2.5 text-sm font-medium text-white hover:bg-success-600">
							Konfirmasi Pembayaran
						</button>
					</form>
				</div>
			{/if}

			<!-- Selesai / Sudah Diantar -->
			{#if session.status === 'processing'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-2 text-base font-semibold text-gray-800 dark:text-white">Sudah Diantar?</h2>
					<p class="mb-4 text-sm text-gray-500">Klik setelah semua pesanan diantarkan ke meja.</p>
					<form method="POST" action="?/completeSession" use:enhance={() => () => invalidateAll()}>
						<button type="submit"
							class="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
							Selesai — Sudah Diantar
						</button>
					</form>
				</div>
			{/if}

			<!-- Batalkan Sesi -->
			{#if session.status === 'open' || session.status === 'processing'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-2 text-base font-semibold text-gray-800 dark:text-white">Batalkan Sesi</h2>
					<p class="mb-4 text-sm text-gray-500">Batalkan sesi tanpa pembayaran (misal: customer pergi).</p>
					<form method="POST" action="?/cancelSession" use:enhance={() => () => invalidateAll()}>
						<button type="submit"
							class="w-full rounded-xl border border-error-300 py-2.5 text-sm font-medium text-error-500 hover:bg-error-50 dark:border-error-500/30"
							onclick={(e) => { if (!confirm('Batalkan sesi ini?')) e.preventDefault(); }}>
							Batalkan Sesi
						</button>
					</form>
				</div>
			{/if}

			<!-- Buka Ulang Sesi -->
			{#if session.status !== 'open'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-2 text-base font-semibold text-gray-800 dark:text-white">Buka Ulang Sesi</h2>
					<p class="mb-4 text-sm text-gray-500">Status kembali ke aktif & belum bayar.</p>
					<form method="POST" action="?/reopenSession" use:enhance={() => () => invalidateAll()}>
						<button type="submit"
							class="w-full rounded-xl border border-warning-300 py-2.5 text-sm font-medium text-warning-600 hover:bg-warning-50 dark:border-warning-500/30 dark:text-warning-400"
							onclick={(e) => { if (!confirm('Buka ulang sesi ini?')) e.preventDefault(); }}>
							Buka Ulang Sesi
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
