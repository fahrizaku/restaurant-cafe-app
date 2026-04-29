<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const statusTabs = [
		{ value: null, label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	const statusStyle: Record<string, string> = {
		pending: 'bg-warning-50 text-warning-600',
		processing: 'bg-brand-50 text-brand-500',
		completed: 'bg-success-50 text-success-600',
		cancelled: 'bg-error-50 text-error-500'
	};

	const nextStatus: Record<string, string> = {
		pending: 'processing',
		processing: 'completed'
	};

	const nextStatusLabel: Record<string, string> = {
		pending: 'Mark Processing',
		processing: 'Mark Completed'
	};

	const paymentMethodLabel: Record<string, string> = {
		cash: 'Cash',
		qris: 'QRIS',
		transfer: 'Transfer'
	};

	// Track which order's pay dialog is open
	let payDialogOrderId = $state<string | null>(null);

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Orders</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">{data.orders.length} orders</p>
	</div>

	<!-- Status Filter Tabs -->
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
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Order ID</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Table</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Items</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Total</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Time</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
						<th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Payment</th>
						<th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if data.orders.length === 0}
						<tr>
							<td colspan="8" class="px-5 py-10 text-center text-sm text-gray-400">No orders found</td>
						</tr>
					{:else}
						{#each data.orders as order}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<td class="px-5 py-3">
									<a href="/admin/orders/{order.id}" class="font-mono text-sm text-brand-500 hover:text-brand-600">
										#{order.id.slice(0, 8)}
									</a>
								</td>
								<td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
									{order.table?.name ?? '-'}
								</td>
								<td class="px-5 py-3 text-sm text-gray-500">
									{order.items.length} item{order.items.length !== 1 ? 's' : ''}
								</td>
								<td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">
									${order.totalPrice.toFixed(2)}
								</td>
								<td class="px-5 py-3 text-sm text-gray-500">
									{formatDate(order.createdAt)}
								</td>
								<td class="px-5 py-3">
									<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize {statusStyle[order.status]}">
										{order.status}
									</span>
								</td>
								<td class="px-5 py-3">
									{#if order.paymentStatus === 'paid'}
										<span class="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
											<i class="ri-checkbox-circle-fill"></i>
											Paid · {paymentMethodLabel[order.paymentMethod ?? ''] ?? order.paymentMethod}
										</span>
									{:else}
										<span class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
											Unpaid
										</span>
									{/if}
								</td>
								<td class="px-5 py-3">
									<div class="flex items-center justify-end gap-2">
										{#if nextStatus[order.status]}
											<form method="POST" action="?/updateStatus" use:enhance={() => () => invalidateAll()}>
												<input type="hidden" name="id" value={order.id} />
												<input type="hidden" name="status" value={nextStatus[order.status]} />
												<button
													type="submit"
													class="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20"
												>
													{nextStatusLabel[order.status]}
												</button>
											</form>
										{/if}

										{#if order.paymentStatus === 'unpaid' && order.status !== 'cancelled'}
											<button
												onclick={() => (payDialogOrderId = order.id)}
												class="rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-600 hover:bg-success-100"
											>
												Mark Paid
											</button>
										{/if}

										{#if order.status === 'pending' || order.status === 'processing'}
											<form method="POST" action="?/updateStatus" use:enhance={() => () => invalidateAll()}>
												<input type="hidden" name="id" value={order.id} />
												<input type="hidden" name="status" value="cancelled" />
												<button
													type="submit"
													class="rounded-lg bg-error-50 px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-100 dark:bg-error-500/10 dark:hover:bg-error-500/20"
													onclick={(e) => { if (!confirm('Cancel this order?')) e.preventDefault(); }}
												>
													Cancel
												</button>
											</form>
										{/if}

										<a
											href="/admin/orders/{order.id}"
											class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
											aria-label="View order details"
										>
											<svg class="fill-current" width="14" height="14" viewBox="0 0 24 24">
												<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4.25C7.16751 4.25 3.25 8.16751 3.25 12C3.25 15.8325 7.16751 19.75 12 19.75C16.8325 19.75 20.75 15.8325 20.75 12C20.75 8.16751 16.8325 4.25 12 4.25ZM1.75 12C1.75 7.33908 6.33908 2.75 12 2.75C17.6609 2.75 22.25 7.33908 22.25 12C22.25 16.6609 17.6609 21.25 12 21.25C6.33908 21.25 1.75 16.6609 1.75 12ZM11.0001 8.5C11.0001 8.08579 11.3359 7.75 11.7501 7.75H12.0001C12.4143 7.75 12.7501 8.08579 12.7501 8.5C12.7501 8.91421 12.4143 9.25 12.0001 9.25H11.7501C11.3359 9.25 11.0001 8.91421 11.0001 8.5ZM12 10.75C12.4142 10.75 12.75 11.0858 12.75 11.5V15.5C12.75 15.9142 12.4142 16.25 12 16.25C11.5858 16.25 11.25 15.9142 11.25 15.5V11.5C11.25 11.0858 11.5858 10.75 12 10.75Z"/>
											</svg>
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

<!-- Mark as Paid Dialog -->
{#if payDialogOrderId}
	{@const targetOrder = data.orders.find(o => o.id === payDialogOrderId)}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" role="presentation" onclick={() => (payDialogOrderId = null)}></div>
		<div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
			<h2 class="mb-1 text-lg font-semibold text-gray-800 dark:text-white">Mark as Paid</h2>
			<p class="mb-5 text-sm text-gray-500">
				Order <span class="font-mono font-medium text-brand-500">#{payDialogOrderId?.slice(0, 8)}</span>
				— Total <span class="font-semibold text-gray-800 dark:text-white">${targetOrder?.totalPrice.toFixed(2)}</span>
			</p>

			<form
				method="POST"
				action="?/markPaid"
				use:enhance={() => () => { invalidateAll(); payDialogOrderId = null; }}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={payDialogOrderId} />

				<fieldset class="space-y-2">
					<legend class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</legend>
					{#each [['cash', 'Cash', 'ri-money-dollar-circle-line'], ['qris', 'QRIS', 'ri-qr-code-line'], ['transfer', 'Bank Transfer', 'ri-bank-line']] as [val, label, icon]}
						<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:checked]:border-success-400 has-[:checked]:bg-success-50 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
							<input type="radio" name="paymentMethod" value={val} class="accent-success-600" required />
							<i class="{icon} text-lg text-gray-500"></i>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
						</label>
					{/each}
				</fieldset>

				<div class="flex gap-3 pt-1">
					<button
						type="button"
						onclick={() => (payDialogOrderId = null)}
						class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 rounded-xl bg-success-500 py-2.5 text-sm font-medium text-white hover:bg-success-600"
					>
						Confirm Payment
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
