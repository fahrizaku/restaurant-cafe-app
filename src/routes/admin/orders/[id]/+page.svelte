<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	const order = $derived(data.order);

	const statusStyle: Record<string, string> = {
		pending: 'bg-warning-50 text-warning-600',
		processing: 'bg-brand-50 text-brand-500',
		completed: 'bg-success-50 text-success-600',
		cancelled: 'bg-error-50 text-error-500'
	};

	const allStatuses = ['pending', 'processing', 'completed', 'cancelled'] as const;

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/admin/orders" aria-label="Back to orders" class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
			<svg class="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z" fill=""/>
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
				Order <span class="font-mono">#{order.id.slice(0, 8)}</span>
			</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
		</div>
		<span class="ml-2 inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize {statusStyle[order.status]}">
			{order.status}
		</span>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Order Items -->
		<div class="lg:col-span-2 space-y-4">
			<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
				<div class="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
					<h2 class="text-base font-semibold text-gray-800 dark:text-white">Order Items</h2>
				</div>
				<div class="divide-y divide-gray-100 dark:divide-gray-800">
					{#each order.items as item}
						<div class="flex items-center gap-4 px-5 py-4">
							<img
								src={item.menu?.image ?? '/img/product-1.png'}
								alt={item.menu?.name}
								class="h-12 w-12 rounded-lg object-cover"
							/>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-800 dark:text-white">{item.menu?.name ?? 'Unknown'}</p>
								{#if item.notes}
									<p class="text-xs text-gray-400 mt-0.5">Note: {item.notes}</p>
								{/if}
							</div>
							<div class="text-right">
								<p class="text-sm font-medium text-gray-800 dark:text-white">${(item.priceAtTime * item.quantity).toFixed(2)}</p>
								<p class="text-xs text-gray-400">{item.quantity} × ${item.priceAtTime.toFixed(2)}</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
					<span class="text-sm font-medium text-gray-500">Total</span>
					<span class="text-lg font-semibold text-gray-800 dark:text-white">${order.totalPrice.toFixed(2)}</span>
				</div>
			</div>
		</div>

		<!-- Info & Status Update -->
		<div class="space-y-4">
			<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<h2 class="mb-4 text-base font-semibold text-gray-800 dark:text-white">Info</h2>
				<dl class="space-y-3">
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Table</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{order.table?.name ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Items</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium uppercase text-gray-400">Order Time</dt>
						<dd class="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</dd>
					</div>
				</dl>
			</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<h2 class="mb-4 text-base font-semibold text-gray-800 dark:text-white">Update Status</h2>
				<form method="POST" action="?/updateStatus" use:enhance class="space-y-3">
					<div class="flex flex-col gap-2">
						{#each allStatuses as s}
							<label class="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors
								{order.status === s
									? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10'
									: 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5'}">
								<input
									type="radio"
									name="status"
									value={s}
									checked={order.status === s}
									class="accent-brand-500"
								/>
								<span class="text-sm font-medium capitalize
									{order.status === s ? 'text-brand-500' : 'text-gray-700 dark:text-gray-300'}">
									{s}
								</span>
							</label>
						{/each}
					</div>
					<button
						type="submit"
						class="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
					>
						Update Status
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
