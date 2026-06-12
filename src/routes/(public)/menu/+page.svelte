<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();

	let activeCategory = $state<string>('all');
	let inputValue = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	const searchQuery = $derived(inputValue.trim().toLowerCase());

	const visibleCategories = $derived(
		data.categories
			.map((cat) => ({
				...cat,
				menus: searchQuery
					? cat.menus.filter(
							(m) =>
								m.name.toLowerCase().includes(searchQuery) ||
								(m.description ?? '').toLowerCase().includes(searchQuery)
						)
					: cat.menus
			}))
			.filter(
				(cat) =>
					cat.menus.length > 0 &&
					(searchQuery || activeCategory === 'all' || cat.id === activeCategory)
			)
	);

	const totalResults = $derived(visibleCategories.reduce((sum, c) => sum + c.menus.length, 0));

	function selectCategory(id: string) {
		activeCategory = id;
		inputValue = '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		// Pencarian sudah live; submit hanya untuk menutup keyboard di mobile
		searchInput?.blur();
	}
</script>

<svelte:head>
	<title>Menu — {data.cafeName}</title>
</svelte:head>

<Navbar />

<main class="main has-mobile-nav">
	<!--==================== MENU TITLE ====================-->
	<section class="section" id="menu-top" style="padding-bottom: 0;">
		<div class="container">
			{#if data.activeSession?.customerName}
				<p style="text-align: center; margin-bottom: 1rem;">
					Pesanan: {data.activeSession.customerName}
				</p>
			{/if}

			{#if data.activeSession}
				<a href={`/order/status/${data.activeSession.id}`} class="bill-banner">
					<i class="ri-error-warning-line"></i>
					<span
						>Tagihan belum dibayar: <strong>{formatRupiah(data.activeSession.totalPrice)}</strong>
						— bayar sekarang</span
					>
					<i class="ri-arrow-right-s-line"></i>
				</a>
			{/if}
		</div>
	</section>

	<!-- Search (sticky) -->
	<div class="search-sticky-wrapper">
		<form class="search-box container" onsubmit={handleSearchSubmit}>
			<div class="search-icon-wrapper">
				<i class="ri-search-line"></i>
			</div>
			<input
				bind:this={searchInput}
				type="search"
				inputmode="search"
				enterkeyhint="search"
				placeholder="Cari menu..."
				class="search-input"
				bind:value={inputValue}
			/>
			<button type="submit" class="search-submit-btn">Cari</button>
		</form>
	</div>

	<!-- Category Filter -->
	<div class="search-filter container">
		<div class="filter-buttons">
			<button
				class="filter-btn {!searchQuery && activeCategory === 'all' ? 'active' : ''}"
				onclick={() => selectCategory('all')}
			>
				<i class="ri-apps-line"></i>
				<span>Semua</span>
			</button>
			{#each data.categories as category}
				<button
					class="filter-btn {!searchQuery && activeCategory === category.id ? 'active' : ''}"
					onclick={() => selectCategory(category.id)}
				>
					<i class="ri-price-tag-3-line"></i>
					<span>{category.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!--==================== PRODUCTS ====================-->
	{#if searchQuery && totalResults === 0}
		<div class="empty-state container">
			<i class="ri-search-eye-line empty-icon"></i>
			<p>"{inputValue.trim()}" tidak ditemukan</p>
			<span class="empty-description">Coba kata kunci lain atau pilih kategori di atas.</span>
		</div>
	{:else}
		{#if searchQuery}
			<div class="search-results-info container">
				<p>Menemukan <strong>{totalResults}</strong> menu untuk "<strong>{inputValue.trim()}</strong>"</p>
			</div>
		{/if}
		<div class="products-wrapper">
			{#each visibleCategories as cat (cat.id)}
				<section
					class="products section"
					id="cat-{cat.id}"
					style={!searchQuery && activeCategory !== 'all' ? 'padding-top: 1rem;' : ''}
				>
					{#if searchQuery || activeCategory === 'all'}
						<h2 class="section__title">{cat.name}</h2>
					{/if}
					<div class="products__container container grid">
						{#each cat.menus as menu (menu.id)}
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
			{/each}
		</div>
	{/if}
</main>

<MobileNav activeSessionId={data.activeSession?.id} />

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

	/* Search (sticky) */
	.search-sticky-wrapper {
		position: sticky;
		top: var(--header-height);
		z-index: 80; /* Lower than navbar but higher than content */
		background-color: hsla(24, 86%, 88%, 0.95); /* Semi-transparent body color */
		backdrop-filter: blur(8px);
		padding-block: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.search-box {
		display: flex;
		align-items: center;
		background-color: var(--container-color);
		border-radius: 4rem;
		box-shadow: 0 4px 12px hsla(353, 100%, 8%, 0.08);
		overflow: hidden;
		border: 2px solid transparent;
		transition: border-color 0.4s, box-shadow 0.4s;
	}

	.search-box:focus-within {
		border-color: var(--first-color);
		box-shadow: 0 4px 12px hsla(353, 93%, 50%, 0.2);
	}

	.search-icon-wrapper {
		padding-left: 1rem;
		font-size: 1.25rem;
		color: var(--text-color-light);
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	.search-input {
		flex: 1;
		min-width: 0;
		padding: 0.75rem 1rem 0.75rem 0.75rem;
		background: none;
		border: none;
		color: var(--title-color);
		font-size: var(--normal-font-size);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--text-color-light);
	}

	.search-submit-btn {
		background-color: var(--first-color);
		color: var(--white-color);
		border: none;
		padding: 0.75rem 1.5rem;
		font-weight: var(--font-semi-bold);
		cursor: pointer;
		transition: background-color 0.3s, transform 0.3s;
		font-size: var(--small-font-size);
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: max-content;
	}

	.search-submit-btn:active {
		transform: scale(0.95);
		background-color: var(--first-color-alt);
	}

	/* Sembunyikan tombol Cari di layar sempit agar input lebih lega */
	@media screen and (max-width: 400px) {
		.search-submit-btn {
			display: none;
		}
		.search-input {
			padding-right: 1.25rem;
		}
	}

	/* Category Filter */
	.search-filter {
		margin-bottom: 0.5rem;
	}

	.filter-buttons {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		-webkit-overflow-scrolling: touch;
	}

	.filter-buttons::-webkit-scrollbar {
		height: 4px;
	}

	.filter-buttons::-webkit-scrollbar-thumb {
		background-color: var(--first-color);
		border-radius: 4px;
	}

	.filter-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.25rem;
		background-color: var(--container-color);
		border: 2px solid transparent;
		border-radius: 4rem;
		color: var(--text-color);
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 12px hsla(353, 100%, 8%, 0.08);
	}

	.filter-btn i {
		font-size: 1.125rem;
	}

	.filter-btn:hover {
		border-color: var(--first-color);
	}

	.filter-btn.active {
		background-color: var(--first-color);
		color: var(--white-color);
		border-color: var(--first-color);
	}

	/* Search Results Info */
	.search-results-info {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: var(--container-color);
		border-radius: 0.75rem;
		text-align: center;
		font-size: var(--small-font-size);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		margin-top: 1.5rem;
		background-color: var(--container-color);
		border-radius: 1.5rem;
		box-shadow: 0 4px 12px hsla(353, 100%, 8%, 0.08);
	}

	.empty-icon {
		font-size: 3rem;
		color: var(--first-color);
		display: block;
		margin-bottom: 1rem;
	}

	.empty-state p {
		font-size: var(--h3-font-size);
		color: var(--title-color);
		font-weight: var(--font-semi-bold);
		margin-bottom: 0.5rem;
	}

	.empty-description {
		font-size: var(--small-font-size);
		color: var(--text-color);
	}

	.products-wrapper {
		padding-top: 0;
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
