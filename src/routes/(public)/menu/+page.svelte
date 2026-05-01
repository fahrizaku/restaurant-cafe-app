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
		<div class="container flex gap-4 overflow-x-auto py-3 no-scrollbar">
			{#each data.categories as cat}
				<button
					onclick={() => {
						activeCategory = cat.id;
						const el = document.getElementById(`cat-${cat.id}`);
						if (el) {
							const offset = 120; // header height + tabs height approx
							const bodyRect = document.body.getBoundingClientRect().top;
							const elementRect = el.getBoundingClientRect().top;
							const elementPosition = elementRect - bodyRect;
							const offsetPosition = elementPosition - offset;

							window.scrollTo({
								top: offsetPosition,
								behavior: 'smooth'
							});
						}
					}}
					class="category-btn {activeCategory === cat.id ? 'active' : ''}"
				>
					{cat.name}
					{#if activeCategory === cat.id}
						<div class="active-indicator"></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!--==================== PRODUCTS ====================-->
	<div class="products-wrapper">
		{#each data.categories as cat}
			<section class="products section" id="cat-{cat.id}">
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
	</div>
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
		z-index: 80; /* Lower than navbar but higher than content */
		background-color: hsla(24, 86%, 88%, .95); /* Semi-transparent body color */
		backdrop-filter: blur(8px);
		border-bottom: 1px solid hsla(353, 100%, 8%, 0.05);
	}

	.category-btn {
		position: relative;
		white-space: nowrap;
		background: none;
		padding: 0.5rem 0.25rem;
		font-size: var(--normal-font-size);
		font-weight: var(--font-medium);
		color: var(--text-color-light);
		transition: color 0.3s;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.category-btn.active {
		color: var(--first-color);
		font-weight: var(--font-semi-bold);
	}

	.active-indicator {
		position: absolute;
		bottom: -2px;
		width: 20px;
		height: 3px;
		background-color: var(--first-color);
		border-radius: 4rem;
	}

	.products-wrapper {
		padding-top: 1rem;
	}

	.products.section {
		padding-top: 2rem; /* Adjusted for better spacing */
		scroll-margin-top: 120px; /* Crucial: handles sticky offset */
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
