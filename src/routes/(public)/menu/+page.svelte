<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	let activeCategory = $state<string>('all');
	let categoryDropdownOpen = $state(false);

	$effect(() => {
		if (activeCategory === '' && data.categories[0]) activeCategory = 'all';
	});

	function selectCategory(id: string) {
		activeCategory = id;
		categoryDropdownOpen = false;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	$effect(() => {
		function handleClickOutside(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (!target.closest('.category-dropdown-wrapper')) {
				categoryDropdownOpen = false;
			}
		}
		if (categoryDropdownOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
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
				<a
					href={data.table ? `/table/${data.table.id}` : `/order/status/${data.activeSession.id}`}
					class="bill-banner"
				>
					<i class="ri-receipt-line"></i>
					<span
						>Tagihan saat ini: <strong>{formatRupiah(data.activeSession.totalPrice)}</strong></span
					>
					<i class="ri-arrow-right-s-line"></i>
				</a>
			{/if}
		</div>
	</section>

	<!-- Category Dropdown -->
	<div class="sticky-tabs">
		<div class="container category-dropdown-bar">
			<div class="category-dropdown-wrapper">
				<button
					class="category-dropdown-trigger"
					onclick={() => (categoryDropdownOpen = !categoryDropdownOpen)}
				>
					<i class="ri-menu-2-line"></i>
					<span>
						{activeCategory === 'all'
							? 'Semua'
							: (data.categories.find((c) => c.id === activeCategory)?.name ?? 'Kategori')}
					</span>
					<i class="ri-arrow-down-s-line dropdown-arrow {categoryDropdownOpen ? 'open' : ''}"></i>
				</button>

				{#if categoryDropdownOpen}
					<div class="category-dropdown-list">
						<button
							class="category-dropdown-item {activeCategory === 'all' ? 'active' : ''}"
							onclick={() => selectCategory('all')}
						>
							Semua
							{#if activeCategory === 'all'}<i class="ri-check-line"></i>{/if}
						</button>
						{#each data.categories as cat}
							<button
								class="category-dropdown-item {activeCategory === cat.id ? 'active' : ''}"
								onclick={() => selectCategory(cat.id)}
							>
								{cat.name}
								{#if activeCategory === cat.id}<i class="ri-check-line"></i>{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!--==================== PRODUCTS ====================-->
	<div class="products-wrapper">
		{#each data.categories as cat}
			{#if activeCategory === 'all' || activeCategory === cat.id}
				<section
					class="products section"
					id="cat-{cat.id}"
					style={activeCategory !== 'all' ? 'padding-top: 1rem;' : ''}
				>
					{#if activeCategory === 'all'}
						<h2 class="section__title">{cat.name}</h2>
					{/if}
					<div class="products__container container grid">
						{#each cat.menus as menu}
							<ProductCard
								name={menu.name}
								price={menu.price}
								image={menu.image ?? undefined}
								description={menu.description ?? undefined}
								onAdd={() =>
									cart.add({
										menuId: menu.id,
										name: menu.name,
										price: menu.price,
										image: menu.image
									})}
							/>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	</div>
</main>

<MobileNav activeSessionId={data.activeSession?.id} tableId={data.table?.id} />

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
		column-gap: 0.5rem;
		background-color: var(--container-color);
		padding: 0.75rem 1.25rem;
		border-radius: 4rem;
		font-size: var(--small-font-size);
		color: var(--text-color);
		box-shadow: 0 4px 12px hsla(353, 100%, 8%, 0.08);
		width: fit-content;
		margin: 0 auto 1rem;
		transition: background-color 0.3s;
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
		background-color: hsla(24, 86%, 88%, 0.95); /* Semi-transparent body color */
		backdrop-filter: blur(8px);
		border-bottom: 1px solid hsla(353, 100%, 8%, 0.05);
	}

	.category-dropdown-bar {
		display: flex;
		align-items: center;
		padding-block: 0.75rem;
	}

	.category-dropdown-wrapper {
		position: relative;
	}

	.category-dropdown-trigger {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		background-color: var(--container-color);
		color: var(--title-color);
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		padding: 0.5rem 1.25rem;
		border-radius: 4rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.category-dropdown-trigger:hover {
		background-color: var(--first-color);
		color: var(--white-color);
	}

	.dropdown-arrow {
		transition: transform 0.3s;
		font-size: 1.1rem;
	}

	.dropdown-arrow.open {
		transform: rotate(180deg);
	}

	.category-dropdown-list {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		min-width: 180px;
		background-color: var(--container-color);
		border-radius: 1rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, 0.12);
		overflow: hidden;
		z-index: 100;
	}

	.category-dropdown-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 1.25rem;
		font-size: var(--small-font-size);
		color: var(--text-color);
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
	}

	.category-dropdown-item:hover {
		background-color: hsla(353, 100%, 8%, 0.05);
	}

	.category-dropdown-item.active {
		color: var(--first-color);
		font-weight: var(--font-semi-bold);
	}

	.products-wrapper {
		padding-top: 1rem;
	}

	.products.section {
		padding-top: 2rem;
		scroll-margin-top: 120px;
	}

	@media screen and (max-width: 1150px) {
		.pb-mobile {
			padding-bottom: 6rem;
		}
		.main {
			padding-bottom: 4rem;
		}
	}
</style>
