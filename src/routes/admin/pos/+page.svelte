<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { formatRupiah } from '$lib/utils';
	import { Info, ShoppingCart } from 'lucide-svelte';

	let { data } = $props();

	type CartItem = { menuId: string; name: string; price: number; quantity: number; notes: string };

	let selectedTableId = $state(untrack(() => data.tables[0]?.id ?? ''));
	let customerName = $state('');
	let selectedCategoryId = $state(untrack(() => data.categories[0]?.id ?? ''));
	let cart = $state<CartItem[]>([]);
	let notesOpenId = $state<string | null>(null);

	let activeSession = $derived(
		selectedTableId ? (data.tables.find((t) => t.id === selectedTableId)?.sessions[0] ?? null) : null
	);
	let selectedCategory = $derived(
		data.categories.find((c) => c.id === selectedCategoryId) ?? data.categories[0] ?? null
	);
	let cartTotal = $derived(cart.reduce((s, i) => s + i.price * i.quantity, 0));
	let cartCount = $derived(cart.reduce((s, i) => s + i.quantity, 0));

	function addToCart(menu: { id: string; name: string; price: number }) {
		const existing = cart.find((i) => i.menuId === menu.id);
		if (existing) {
			existing.quantity++;
		} else {
			cart.push({ menuId: menu.id, name: menu.name, price: menu.price, quantity: 1, notes: '' });
		}
	}

	function decrement(menuId: string) {
		const idx = cart.findIndex((i) => i.menuId === menuId);
		if (idx === -1) return;
		if (cart[idx].quantity > 1) {
			cart[idx].quantity--;
		} else {
			cart.splice(idx, 1);
			if (notesOpenId === menuId) notesOpenId = null;
		}
	}

	function removeItem(menuId: string) {
		const idx = cart.findIndex((i) => i.menuId === menuId);
		if (idx !== -1) {
			cart.splice(idx, 1);
			if (notesOpenId === menuId) notesOpenId = null;
		}
	}

	function cartQty(menuId: string) {
		return cart.find((i) => i.menuId === menuId)?.quantity ?? 0;
	}

</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">POS Kasir</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">Input order manual</p>
		</div>

		<!-- Table Selector -->
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<label for="table-select" class="text-sm font-medium text-gray-600 dark:text-gray-400">Tipe:</label>
				<select
					id="table-select"
					bind:value={selectedTableId}
					class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
				>
					<option value="">Bawa Pulang (Takeaway)</option>
					{#each data.tables as table}
						<option value={table.id}>{table.name}</option>
					{/each}
				</select>
			</div>

			{#if !selectedTableId}
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={customerName}
						placeholder="Nama Pelanggan..."
						class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>
			{/if}
		</div>
	</div>

	<!-- Session Info Banner -->
	{#if activeSession}
		<div class="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
			<Info size={16} class="text-brand-500 shrink-0" />
			<p class="text-sm text-brand-700 dark:text-brand-400">
				Sesi aktif — total sejauh ini:
				<span class="font-semibold">{formatRupiah(activeSession.totalPrice)}</span>.
				Order baru akan ditambahkan ke sesi ini.
			</p>
			<a href="/admin/orders/{activeSession.id}" class="ml-auto text-xs font-medium text-brand-500 hover:underline">
				Lihat sesi
			</a>
		</div>
	{/if}

	<!-- Main Layout -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">

		<!-- Menu Browser -->
		<div class="space-y-3">
			<!-- Category Tabs -->
			<div class="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
				{#each data.categories as cat}
					<button
						onclick={() => (selectedCategoryId = cat.id)}
						class="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors
							{selectedCategoryId === cat.id
								? 'bg-white text-gray-800 shadow-sm dark:bg-gray-900 dark:text-white'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					>
						{cat.name}
					</button>
				{/each}
			</div>

			<!-- Menu Grid -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
				{#each selectedCategory?.menus ?? [] as menu}
					{@const qty = cartQty(menu.id)}
					<button
						onclick={() => addToCart(menu)}
						class="group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all hover:shadow-md dark:bg-gray-900
							{qty > 0
								? 'border-brand-300 dark:border-brand-500/50'
								: 'border-gray-200 dark:border-gray-800'}"
					>
						<img
							src={menu.image ?? '/img/product-1.png'}
							alt={menu.name}
							class="h-28 w-full object-cover"
						/>
						{#if qty > 0}
							<span class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
								{qty}
							</span>
						{/if}
						<div class="p-3">
							<p class="text-sm font-medium text-gray-800 dark:text-white leading-tight">{menu.name}</p>
							<p class="mt-1 text-sm font-semibold text-brand-500">{formatRupiah(menu.price)}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Cart -->
		<div class="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
			<div class="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
				<h2 class="text-base font-semibold text-gray-800 dark:text-white">
					Pesanan
					{#if cartCount > 0}
						<span class="ml-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-500">
							{cartCount} item
						</span>
					{/if}
				</h2>
			</div>

			{#if cart.length === 0}
				<div class="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
					<ShoppingCart size={36} class="mb-2 text-gray-300" />
					<p class="text-sm text-gray-400">Belum ada item</p>
					<p class="text-xs text-gray-300">Klik menu di sebelah kiri untuk menambahkan</p>
				</div>
			{:else}
				<div class="flex-1 divide-y divide-gray-50 overflow-y-auto dark:divide-gray-800">
					{#each cart as item}
						<div class="px-5 py-3">
							<div class="flex items-start gap-3">
								<div class="flex-1 min-w-0">
									<p class="truncate text-sm font-medium text-gray-800 dark:text-white">{item.name}</p>
									<p class="text-xs text-gray-400">{formatRupiah(item.price)} / item</p>
								</div>
								<div class="flex items-center gap-1">
									<button
										aria-label="Kurangi"
										onclick={() => decrement(item.menuId)}
										class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
									>
										<svg class="fill-current" width="12" height="12" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12Z"/></svg>
									</button>
									<span class="w-6 text-center text-sm font-semibold text-gray-800 dark:text-white">{item.quantity}</span>
									<button
										aria-label="Tambah"
										onclick={() => addToCart({ id: item.menuId, name: item.name, price: item.price })}
										class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
									>
										<svg class="fill-current" width="12" height="12" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4V11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H12.75V20C12.75 20.4142 12.4142 20.75 12 20.75C11.5858 20.75 11.25 20.4142 11.25 20V12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H11.25V4C11.25 3.58579 11.5858 3.25 12 3.25Z"/></svg>
									</button>
								</div>
								<p class="w-16 text-right text-sm font-semibold text-gray-800 dark:text-white">
									{formatRupiah(item.price * item.quantity)}
								</p>
							</div>

							<!-- Notes toggle -->
							<div class="mt-2">
								{#if notesOpenId === item.menuId}
									<input
										type="text"
										bind:value={item.notes}
										placeholder="Catatan (opsional)..."
										class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
									/>
								{:else}
									<button
										onclick={() => (notesOpenId = item.menuId)}
										class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									>
										{item.notes ? `📝 ${item.notes}` : '+ Tambah catatan dapur'}
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Cart Footer -->
				<div class="border-t border-gray-100 px-5 py-4 space-y-3 dark:border-gray-800">
					<div class="flex justify-between">
						<span class="text-sm text-gray-500">Total</span>
						<span class="text-lg font-bold text-gray-800 dark:text-white">{formatRupiah(cartTotal)}</span>
					</div>

					{#if !selectedTableId && !customerName}
						<p class="text-xs text-error-500 text-center">Isi nama pelanggan untuk Takeaway</p>
					{/if}
					
					<form
						method="POST"
						action="?/order"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
								cart = [];
								customerName = '';
							};
						}}
					>
						<input type="hidden" name="tableId" value={selectedTableId} />
						<input type="hidden" name="customerName" value={customerName} />
						<input type="hidden" name="items" value={JSON.stringify(cart.map(i => ({
							menuId: i.menuId,
							quantity: i.quantity,
							price: i.price,
							notes: i.notes || undefined
						})))} />
						<button
							type="submit"
							disabled={cart.length === 0 || (!selectedTableId && !customerName)}
							class="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
						>
							Place Order — {formatRupiah(cartTotal)}
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
