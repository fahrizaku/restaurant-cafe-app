<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	let cartOpen = $state(false);
	let ordering = $state(false);
	let activeCategory = $state<string>('');
	$effect(() => {
		if (!activeCategory && data.categories[0]) activeCategory = data.categories[0].id;
	});
</script>

<svelte:head>
	<title>Menu — {data.table?.name || 'Restoran'}</title>
</svelte:head>

<Navbar onCartClick={() => (cartOpen = true)} />

<main class="main">
	<!--==================== MENU TITLE ====================-->
	<section class="section" id="menu-top" style="padding-bottom: 0;">
		<div class="container">
			<h1 class="section__title">Menu Kami</h1>
			<p style="text-align: center; margin-bottom: 1rem;">
				{#if data.table}
					Meja: {data.table.name}
				{:else if data.activeSession?.customerName}
					Pesanan: {data.activeSession.customerName}
				{:else}
					Selamat Datang!
				{/if}
			</p>

			{#if data.activeSession}
				<a href={data.table ? `/table/${data.table.id}` : `/order/status/${data.activeSession.id}`} class="bill-banner">
					<i class="ri-receipt-line"></i>
					<span>Tagihan saat ini: <strong>{formatRupiah(data.activeSession.totalPrice)}</strong></span>
					<i class="ri-arrow-right-s-line"></i>
				</a>
			{/if}
		</div>
	</section>

	<!-- Category Tabs -->
	<div class="category-tabs sticky-tabs">
		<div class="container flex gap-2 overflow-x-auto py-4 no-scrollbar">
			{#each data.categories as cat}
				<button
					onclick={() => {
						activeCategory = cat.id;
						document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}}
					class="category-btn {activeCategory === cat.id ? 'active' : ''}"
				>
					{cat.name}
				</button>
			{/each}
		</div>
	</div>

	<!--==================== PRODUCTS ====================-->
	{#each data.categories as cat}
		<section class="products section" id="cat-{cat.id}" style="padding-top: 4rem;">
			<h2 class="section__title">{cat.name}</h2>
			<div class="products__container container grid">
				{#each cat.menus as menu}
					<ProductCard
						name={menu.name}
						price={menu.price}
						image={menu.image ?? undefined}
						description={menu.description ?? undefined}
						onAdd={() => cart.add({ menuId: menu.id, name: menu.name, price: menu.price, image: menu.image })}
					/>
				{/each}
			</div>
		</section>
	{/each}
</main>

<MobileNav 
	onCartClick={() => (cartOpen = true)} 
	activeSessionId={data.activeSession?.id} 
	tableId={data.table?.id} 
/>

<footer class="footer pb-mobile">
	<div class="footer__container container">
		<span class="footer__copy">&#169; Semua Hak Dilindungi</span>
	</div>
</footer>

<!-- Cart Drawer -->
{#if cartOpen}
	<div class="cart-drawer-overlay" role="presentation">
		<div class="cart-drawer-backdrop" onclick={() => (cartOpen = false)} role="presentation"></div>
		<div class="cart-drawer-content">
			<div class="cart-drawer-header">
				<h2 class="cart-drawer-title">Pesanan Anda</h2>
				<button onclick={() => (cartOpen = false)} aria-label="Tutup keranjang" class="cart-drawer-close">
					<i class="ri-close-large-line"></i>
				</button>
			</div>

			<div class="cart-drawer-items">
				{#if cart.items.length === 0}
					<p class="cart-empty-text">Keranjang masih kosong</p>
				{:else}
					{#each cart.items as item}
						<div class="cart-item">
							<img src={item.image ?? '/img/product-1.png'} alt={item.name} class="cart-item-img" />
							<div class="cart-item-info">
								<p class="cart-item-name">{item.name}</p>
								<p class="cart-item-price">{formatRupiah(item.price)}</p>
							</div>
							<div class="cart-item-controls">
								<button onclick={() => cart.updateQty(item.menuId, item.quantity - 1)} class="qty-btn" aria-label="Kurangi">
									<i class="ri-subtract-line"></i>
								</button>
								<span class="qty-val">{item.quantity}</span>
								<button onclick={() => cart.updateQty(item.menuId, item.quantity + 1)} class="qty-btn active" aria-label="Tambah">
									<i class="ri-add-line"></i>
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			{#if cart.items.length > 0}
				<div class="cart-drawer-footer">
					<div class="cart-total">
						<span class="total-label">Order ini ({cart.count} item)</span>
						<span class="total-value">{formatRupiah(cart.total)}</span>
					</div>

					{#if data.activeSession}
						<div class="session-total-hint">
							Total tagihan setelah ini: <strong>{formatRupiah(data.activeSession.totalPrice + cart.total)}</strong>
						</div>
					{/if}

					<form
						method="POST"
						action="?/order"
						use:enhance={() => {
							ordering = true;
							return async ({ update, result }) => {
								await update();
								ordering = false;
								if (result.type === 'success' || result.type === 'redirect') {
									cart.clear();
									cartOpen = false;
								}
							};
						}}
						class="space-y-4"
					>
						<input type="hidden" name="tableId" value={data.table?.id || ''} />
						
						{#if !data.table && !data.activeSession}
							<div class="input-group">
								<label for="customerName" class="input-label">Nama / Info Meja</label>
								<input 
									type="text" 
									name="customerName" 
									id="customerName"
									placeholder="Contoh: Budi atau Meja Pojok"
									required
									class="text-input"
								/>
							</div>
						{/if}

						<input
							type="hidden"
							name="items"
							value={JSON.stringify(
								cart.items.map((i) => ({ menuId: i.menuId, name: i.name, price: i.price, quantity: i.quantity }))
							)}
						/>
						<button type="submit" disabled={ordering} class="button w-full">
							{ordering ? 'Memproses...' : `Pesan Sekarang · ${formatRupiah(cart.total)}`}
						</button>
					</form>

					<button onclick={() => cart.clear()} class="clear-cart-btn">Hapus semua</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.space-y-4 > * + * { margin-top: 1rem; }
	.input-group { display: flex; flex-direction: column; row-gap: .5rem; }
	.input-label { font-size: var(--smaller-font-size); font-weight: var(--font-medium); color: var(--text-color); }
	.text-input {
		width: 100%;
		padding: .75rem 1rem;
		border-radius: .5rem;
		background-color: var(--container-color);
		border: 2px solid transparent;
		color: var(--title-color);
		font-family: var(--body-font);
		transition: border-color .3s;
	}
	.text-input:focus { border-color: var(--first-color); outline: none; }

	/* Bill banner */
	.bill-banner {
		display: flex;
		align-items: center;
		column-gap: .5rem;
		background-color: var(--container-color);
		padding: .75rem 1.25rem;
		border-radius: 4rem;
		font-size: var(--small-font-size);
		color: var(--text-color);
		box-shadow: 0 4px 12px hsla(353, 100%, 8%, .08);
		width: fit-content;
		margin: 0 auto 1rem;
		transition: background-color .3s;
	}

	.bill-banner:hover {
		background-color: var(--first-color);
		color: var(--white-color);
	}

	.bill-banner i:first-child {
		color: var(--first-color);
		font-size: 1.1rem;
	}

	.bill-banner:hover i {
		color: var(--white-color);
	}

	/* Session total hint in cart */
	.session-total-hint {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		text-align: center;
		margin-bottom: .5rem;
	}

	/* Sticky tabs */
	.sticky-tabs {
		position: sticky;
		top: var(--header-height);
		z-index: var(--z-fixed);
		background-color: var(--body-color);
		box-shadow: 0 2px 8px hsla(353, 100%, 8%, 0.05);
	}

	.category-btn {
		white-space: nowrap;
		border-radius: 4rem;
		padding: 0.5rem 1.5rem;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		background-color: var(--container-color);
		color: var(--text-color);
		transition: all 0.4s;
		cursor: pointer;
	}

	.category-btn.active {
		background-color: var(--first-color);
		color: var(--white-color);
		box-shadow: 0 4px 12px hsla(353, 100%, 40%, 0.3);
	}

	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

	/* Cart drawer */
	.cart-drawer-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
	}

	.cart-drawer-backdrop {
		background-color: hsla(353, 100%, 8%, 0.4);
		backdrop-filter: blur(2px);
		width: 100%;
		height: 100%;
		position: absolute;
	}

	.cart-drawer-content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 400px;
		background-color: var(--body-color);
		box-shadow: -4px 0 24px hsla(353, 100%, 8%, 0.1);
	}

	.cart-drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--container-color);
	}

	.cart-drawer-title { font-size: var(--h2-font-size); font-family: var(--second-font); }
	.cart-drawer-close { font-size: 1.5rem; color: var(--title-color); cursor: pointer; }

	.cart-drawer-items {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		row-gap: 1.5rem;
	}

	.cart-empty-text { text-align: center; color: var(--text-color-light); margin-top: 3rem; }

	.cart-item { display: flex; align-items: center; column-gap: 1rem; }

	.cart-item-img {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 1rem;
		filter: var(--shadow-small-img);
	}

	.cart-item-info { flex: 1; }
	.cart-item-name { font-weight: var(--font-semi-bold); color: var(--title-color); font-size: var(--normal-font-size); }
	.cart-item-price { color: var(--first-color); font-family: var(--second-font); }

	.cart-item-controls { display: flex; align-items: center; column-gap: 0.75rem; }

	.qty-btn {
		display: inline-flex;
		padding: 4px;
		background-color: var(--container-color);
		border-radius: 0.5rem;
		color: var(--title-color);
		cursor: pointer;
		transition: all 0.4s;
	}

	.qty-btn.active { background-color: var(--first-color); color: var(--white-color); }
	.qty-val { font-weight: var(--font-semi-bold); min-width: 20px; text-align: center; }

	.cart-drawer-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--container-color);
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	.cart-total { display: flex; justify-content: space-between; align-items: center; }
	.total-label { color: var(--text-color-light); }
	.total-value { font-size: var(--h1-font-size); font-family: var(--second-font); color: var(--first-color); }

	.clear-cart-btn {
		text-align: center;
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		background: none;
		cursor: pointer;
	}

	.w-full { width: 100%; }

	@media screen and (max-width: 1150px) {
		.pb-mobile {
			padding-bottom: 6rem;
		}
		.main {
			padding-bottom: 4rem;
		}
	}
</style>
