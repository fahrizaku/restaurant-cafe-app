<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatRupiah } from '$lib/utils';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { Circle, UtensilsCrossed, CheckCircle2, Banknote, QrCode, Landmark, Eye } from 'lucide-svelte';

	const paymentOptions = [
		{ val: 'cash', label: 'Tunai', Icon: Banknote },
		{ val: 'qris', label: 'QRIS', Icon: QrCode },
		{ val: 'transfer', label: 'Transfer Bank', Icon: Landmark }
	];

	let { data } = $props();
	let confirmDialog = $state<{ title: string; message?: string; confirmLabel?: string; confirmClass?: string; onConfirm: () => void } | null>(null);

	const statusTabs = [
		{ value: null, label: 'Semua' },
		{ value: 'open', label: 'Aktif' },
		{ value: 'processing', label: 'Diproses' },
		{ value: 'closed', label: 'Selesai' },
		{ value: 'cancelled', label: 'Dibatalkan' }
	];

	const paymentMethodLabel: Record<string, string> = {
		cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer'
	};

	let payDialogSessionId = $state<string | null>(null);

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
	}

	function sessionItemCount(session: typeof data.sessions[0]) {
		return session.batches.reduce((s, b) => s + b.items.length, 0);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Sesi Order</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">{data.sessions.length} sesi</p>
	</div>

	<!-- Status Tabs -->
	<div class="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 w-fit">
		{#each statusTabs as tab}
			<a
				href={tab.value ? `?status=${tab.value}` : '/admin/orders'}
				class="rounded-lg px-4 py-2 text-sm font-medium transition-colors
					{data.currentStatus === tab.value
						? 'bg-white text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				{tab.label}
			</a>
		{/each}
	</div>

	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-100 dark:border-gray-800">
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Sesi</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Meja</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Pesanan</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Total</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Dibuka</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Pembayaran</th>
						<th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-400">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#if data.sessions.length === 0}
						<tr>
							<td colspan="8" class="px-5 py-10 text-center text-sm text-gray-400">Belum ada sesi</td>
						</tr>
					{:else}
						{#each data.sessions as session}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<td class="px-5 py-3">
									<a href="/admin/orders/{session.id}" class="font-mono text-sm text-brand-500 hover:text-brand-600">
										#{session.id.slice(0, 8)}
									</a>
								</td>
								<td class="px-5 py-3">
									<div class="flex flex-col">
										<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
											{session.table?.name ?? session.customerName ?? '-'}
										</span>
										{#if session.table && session.customerName}
											<span class="text-xs text-gray-500">{session.customerName}</span>
										{/if}
									</div>
								</td>
								<td class="px-5 py-3 text-sm text-gray-500">
									{session.batches.length} batch · {sessionItemCount(session)} item
								</td>
								<td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">
									{formatRupiah(session.totalPrice)}
								</td>
								<td class="px-5 py-3 text-sm text-gray-500">
									{formatDate(session.openedAt)}
								</td>
								<td class="px-5 py-3">
									{#if session.status === 'open'}
										<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
											<Circle size={8} class="fill-current" /> Aktif
										</span>
									{:else if session.status === 'processing'}
										<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-500 dark:bg-brand-500/10">
											<UtensilsCrossed size={10} /> Diproses
										</span>
									{:else if session.status === 'cancelled'}
										<span class="inline-flex rounded-full bg-error-50 px-2.5 py-1 text-xs font-medium text-error-500 dark:bg-error-500/10">
											Dibatalkan
										</span>
									{:else}
										<span class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
											Selesai
										</span>
									{/if}
								</td>
								<td class="px-5 py-3">
									{#if session.paymentStatus === 'paid'}
										<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
											<CheckCircle2 size={12} />
											Lunas · {paymentMethodLabel[session.paymentMethod ?? ''] ?? '-'}
										</span>
									{:else}
										<span class="inline-flex rounded-full bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-600">
											Belum Bayar
										</span>
									{/if}
								</td>
								<td class="px-5 py-3">
									<div class="flex items-center justify-end gap-2">
										{#if session.status === 'open' && session.paymentStatus === 'unpaid'}
											<button
												onclick={() => (payDialogSessionId = session.id)}
												class="rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white hover:bg-success-600"
											>
												Tandai Lunas
											</button>
										{/if}

										{#if session.status === 'processing'}
											<form method="POST" action="?/completeSession" use:enhance={() => () => invalidateAll()}>
												<input type="hidden" name="id" value={session.id} />
												<button type="submit"
													class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">
													Sudah Diantar
												</button>
											</form>
										{/if}

										{#if session.status === 'open' || session.status === 'processing'}
											<form method="POST" action="?/cancelSession" use:enhance={() => () => invalidateAll()}>
												<input type="hidden" name="id" value={session.id} />
												<button
													type="submit"
													class="rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600"
													onclick={(e) => { e.preventDefault(); const form = (e.currentTarget as HTMLButtonElement).closest('form') as HTMLFormElement; confirmDialog = { title: 'Batalkan sesi?', message: 'Sesi akan ditandai dibatalkan.', confirmLabel: 'Batalkan', confirmClass: 'bg-error-500 hover:bg-error-600', onConfirm: () => form.requestSubmit() }; }}
												>
													Batalkan
												</button>
											</form>
										{/if}

										<a
											href="/admin/orders/{session.id}"
											class="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 dark:border-blue-500/30 dark:hover:bg-blue-500/10"
											aria-label="Lihat detail sesi"
										>
											<Eye size={15} />
										</a>
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

{#if confirmDialog}
	<ConfirmDialog
		title={confirmDialog.title}
		message={confirmDialog.message}
		confirmLabel={confirmDialog.confirmLabel}
		confirmClass={confirmDialog.confirmClass}
		onConfirm={() => { confirmDialog!.onConfirm(); confirmDialog = null; }}
		onCancel={() => (confirmDialog = null)}
	/>
{/if}

<!-- Dialog Tandai Lunas -->
{#if payDialogSessionId}
	{@const target = data.sessions.find(s => s.id === payDialogSessionId)}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" role="presentation" onclick={() => (payDialogSessionId = null)}></div>
		<div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
			<h2 class="mb-1 text-lg font-semibold text-gray-800 dark:text-white">Tandai Lunas</h2>
			<p class="mb-1 text-sm text-gray-500">
				{target?.table?.name} — Total
				<span class="font-semibold text-gray-800 dark:text-white">{formatRupiah(target?.totalPrice ?? 0)}</span>
			</p>
			<p class="mb-5 text-xs text-gray-400">Sesi akan otomatis ditutup setelah pembayaran dikonfirmasi.</p>

			<form
				method="POST"
				action="?/markPaid"
				use:enhance={() => () => { invalidateAll(); payDialogSessionId = null; }}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={payDialogSessionId} />
				<fieldset class="space-y-2">
					<legend class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Metode Pembayaran</legend>
					{#each paymentOptions as { val, label, Icon }}
						<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:checked]:border-success-400 has-[:checked]:bg-success-50 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
							<input type="radio" name="paymentMethod" value={val} class="accent-success-600" required />
							<Icon size={18} class="text-gray-500" />
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
						</label>
					{/each}
				</fieldset>
				<div class="flex gap-3 pt-1">
					<button type="button" onclick={() => (payDialogSessionId = null)}
						class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">
						Batal
					</button>
					<button type="submit"
						class="flex-1 rounded-xl bg-success-500 py-2.5 text-sm font-medium text-white hover:bg-success-600">
						Konfirmasi Pembayaran
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
