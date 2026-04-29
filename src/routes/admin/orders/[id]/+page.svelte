<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	const session = $derived(data.session);

	const batchStatusNext: Record<string, string> = {
		pending: 'processing',
		processing: 'done'
	};

	const batchStatusNextLabel: Record<string, string> = {
		pending: 'Mark Processing',
		processing: 'Mark Done'
	};

	const batchStatusStyle: Record<string, string> = {
		pending: 'bg-warning-50 text-warning-600',
		processing: 'bg-brand-50 text-brand-500',
		done: 'bg-success-50 text-success-600',
		cancelled: 'bg-error-50 text-error-500'
	};

	const paymentMethodLabel: Record<string, string> = {
		cash: 'Cash', qris: 'QRIS', transfer: 'Bank Transfer'
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
		<a href="/admin/orders" aria-label="Back"
			class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
			<svg class="fill-current" width="16" height="16" viewBox="0 0 24 24">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"/>
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
				Session <span class="font-mono">#{session.id.slice(0, 8)}</span>
			</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{session.table?.name} · Opened {formatDate(session.openedAt)}
			</p>
		</div>
		<div class="ml-2 flex gap-2">
			{#if session.status === 'open'}
				<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-600">
					<i class="ri-record-circle-fill text-[8px]"></i> Open
				</span>
			{:else}
				<span class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500 dark:bg-gray-800">
					Closed
				</span>
			{/if}
			{#if session.paymentStatus === 'paid'}
				<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-600">
					<i class="ri-checkbox-circle-fill"></i> Paid
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
						<div class="flex items-center gap-2">
							<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize {batchStatusStyle[batch.status]}">
								{batch.status}
							</span>
							<span class="text-sm font-semibold text-gray-800 dark:text-white">
								${batch.totalPrice.toFixed(2)}
							</span>
						</div>
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
										<p class="text-xs text-gray-400">Note: {item.notes}</p>
									{/if}
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-gray-800 dark:text-white">${(item.priceAtTime * item.quantity).toFixed(2)}</p>
									<p class="text-xs text-gray-400">{item.quantity} × ${item.priceAtTime.toFixed(2)}</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Batch Actions -->
					{#if batch.status !== 'done' && batch.status !== 'cancelled'}
						<div class="flex items-center gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
							{#if batchStatusNext[batch.status]}
								<form method="POST" action="?/updateBatchStatus" use:enhance={() => () => invalidateAll()}>
									<input type="hidden" name="batchId" value={batch.id} />
									<input type="hidden" name="status" value={batchStatusNext[batch.status]} />
									<button type="submit"
										class="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-100 dark:bg-brand-500/10">
										{batchStatusNextLabel[batch.status]}
									</button>
								</form>
							{/if}

							<form method="POST" action="?/updateBatchStatus" use:enhance={() => () => invalidateAll()}>
								<input type="hidden" name="batchId" value={batch.id} />
								<input type="hidden" name="status" value="cancelled" />
								<button type="submit"
									class="rounded-lg bg-error-50 px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-100"
									onclick={(e) => { if (!confirm('Cancel this order batch?')) e.preventDefault(); }}>
									Cancel Batch
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Sidebar -->
		<div class="space-y-4">
			<!-- Session Info -->
			<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<h2 class="mb-4 text-base font-semibold text-gray-800 dark:text-white">Session Info</h2>
				<dl class="space-y-3">
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Table</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{session.table?.name ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Batches</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">
							{session.batches.length} orders · {session.batches.reduce((s, b) => s + b.items.length, 0)} items
						</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Total Bill</dt>
						<dd class="mt-1 text-lg font-semibold text-gray-800 dark:text-white">${session.totalPrice.toFixed(2)}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Payment</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">
							{#if session.paymentStatus === 'paid'}
								<span class="font-medium text-success-600">Paid</span>
								{#if session.paymentMethod}· {paymentMethodLabel[session.paymentMethod]}{/if}
							{:else}
								<span class="text-gray-400">Unpaid</span>
							{/if}
						</dd>
					</div>
					{#if session.closedAt}
						<div>
							<dt class="text-xs font-medium uppercase text-gray-400">Closed At</dt>
							<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatDate(session.closedAt)}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Payment -->
			{#if session.paymentStatus === 'unpaid' && session.status === 'open'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-4 text-base font-semibold text-gray-800 dark:text-white">Payment</h2>
					<form method="POST" action="?/markPaid" use:enhance class="space-y-3">
						<fieldset class="space-y-2">
							<legend class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Select Method</legend>
							{#each [['cash', 'Cash', 'ri-money-dollar-circle-line'], ['qris', 'QRIS', 'ri-qr-code-line'], ['transfer', 'Bank Transfer', 'ri-bank-line']] as [val, label, icon]}
								<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors has-[:checked]:border-success-400 has-[:checked]:bg-success-50 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
									<input type="radio" name="paymentMethod" value={val} class="accent-success-600" required />
									<i class="{icon} text-base text-gray-500"></i>
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
								</label>
							{/each}
						</fieldset>
						<button type="submit"
							class="w-full rounded-xl bg-success-500 py-2.5 text-sm font-medium text-white hover:bg-success-600">
							Confirm Payment
						</button>
					</form>
				</div>
			{/if}

			<!-- Close Session -->
			{#if session.status === 'open'}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<h2 class="mb-2 text-base font-semibold text-gray-800 dark:text-white">Close Session</h2>
					<p class="mb-4 text-sm text-gray-500">Finalize this session. No more orders can be added after closing.</p>
					<form method="POST" action="?/closeSession" use:enhance>
						<button type="submit"
							class="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
							onclick={(e) => { if (!confirm('Close this session? Customers won\'t be able to add more orders.')) e.preventDefault(); }}>
							Close Session
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
