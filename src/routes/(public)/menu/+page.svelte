<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	let activeCategory = $state<string>('');
	$effect(() => {
		if (!activeCategory && data.categories[0]) activeCategory = data.categories[0].id;
	});
</script>

<svelte:head>
	<title>Menu — {data.table?.name || 'Restoran'}</title>
</svelte:head>

<Navbar />

<main class="main has-mobile-nav">
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
	activeSessionId={data.activeSession?.id} 
	tableId={data.table?.id} 
/>

<footer class="footer pb-mobile">
	<div class="footer__container container">
		<span class="footer__copy">&#169; Semua Hak Dilindungi</span>
	</div>
</footer>

<style>
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
