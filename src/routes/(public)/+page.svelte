<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();
	let cartOpen = $state(false);
</script>

<svelte:head>
	<title>Pizza App — Fresh & Delicious Pizzas</title>
</svelte:head>

<Navbar onCartClick={() => (cartOpen = true)} />

<main class="main">
	<!--==================== HOME ====================-->
	<section class="home section" id="home">
		<div class="home__container container grid">
			<div class="home__data">
				<h1 class="home__title">Crispy And <br /> Delicious Pizzas</h1>
				<p class="home__description">
					Order the best pizzas to end your hunger and make your family moments more memorable.
					Scan the QR code at your table to start ordering.
				</p>
				<div class="home__cta">
					<i class="ri-qr-code-line home__cta-icon"></i>
					<span>Scan QR code at your table to order</span>
				</div>
				<img src="/img/sticker-pizza.svg" alt="" class="home__sticker-1" />
				<img src="/img/sticker-leaf.svg" alt="" class="home__sticker-2" />
			</div>

			<div class="home__images">
				<img src="/img/home-pizza.png" alt="" class="home__pizza" />
				<img src="/img/home-board.png" alt="" class="home__board" />
				<img src="/img/home-leaf-1.png" alt="" class="home__ingredient home__leaf-1" />
				<img src="/img/home-leaf-2.png" alt="" class="home__ingredient home__leaf-2" />
				<img src="/img/home-pepperoni.png" alt="" class="home__ingredient home__pepperoni" />
				<img src="/img/home-mushroom.png" alt="" class="home__ingredient home__mushroom" />
				<img src="/img/home-olive.png" alt="" class="home__ingredient home__olive" />
				<img src="/img/home-tomato.png" alt="" class="home__ingredient home__tomato" />
			</div>
		</div>
	</section>

	<!--==================== HOW TO ORDER ====================-->
	<section class="steps section">
		<div class="container">
			<h2 class="section__title">How to Order</h2>
			<div class="steps__container grid">
				<div class="steps__card">
					<div class="steps__icon">
						<i class="ri-qr-code-line"></i>
					</div>
					<h3 class="steps__title">Scan QR Code</h3>
					<p class="steps__description">Scan the QR code on your table to open the menu for your table.</p>
				</div>
				<div class="steps__card">
					<div class="steps__icon">
						<i class="ri-restaurant-2-line"></i>
					</div>
					<h3 class="steps__title">Choose Your Food</h3>
					<p class="steps__description">Browse the menu, add your favorite items to the cart, and place your order.</p>
				</div>
				<div class="steps__card">
					<div class="steps__icon">
						<i class="ri-bill-line"></i>
					</div>
					<h3 class="steps__title">Pay When Ready</h3>
					<p class="steps__description">Order as many times as you like. Pay the full bill at the end of your visit.</p>
				</div>
			</div>
		</div>
	</section>
</main>

<MobileNav 
	onCartClick={() => (cartOpen = true)} 
	activeSessionId={data.activeSessionId} 
	tableId={data.tableId} 
/>

<footer class="footer pb-mobile">
	<div class="footer__container container">
		<span class="footer__copy">&#169; All Rights Reserved By Pizza App</span>
	</div>
</footer>

<!-- Minimal Cart Drawer for Home -->
{#if cartOpen}
	<div class="cart-drawer-overlay" role="presentation">
		<div class="cart-drawer-backdrop" onclick={() => (cartOpen = false)} role="presentation"></div>
		<div class="cart-drawer-content">
			<div class="cart-drawer-header">
				<h2 class="cart-drawer-title">Keranjang</h2>
				<button onclick={() => (cartOpen = false)} aria-label="Tutup" class="cart-drawer-close">
					<i class="ri-close-large-line"></i>
				</button>
			</div>

			<div class="cart-drawer-items">
				{#if cart.items.length === 0}
					<p class="cart-empty-text">Keranjang kosong</p>
					<a href="/menu" class="button" onclick={() => (cartOpen = false)} style="margin-top: 2rem;">Lihat Menu</a>
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
						<span class="total-label">Total</span>
						<span class="total-value">{formatRupiah(cart.total)}</span>
					</div>
					<a href="/menu" class="button w-full" onclick={() => (cartOpen = false)}>
						Lanjutkan ke Menu & Pesan
					</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@media screen and (max-width: 1150px) {
		.pb-mobile { padding-bottom: 6rem; }
		.main { padding-bottom: 4rem; }
	}

	/* Reuse Cart Styles */
	.cart-drawer-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: flex-end; }
	.cart-drawer-backdrop { background-color: hsla(353, 100%, 8%, 0.4); backdrop-filter: blur(2px); width: 100%; height: 100%; position: absolute; }
	.cart-drawer-content { position: relative; z-index: 10; display: flex; flex-direction: column; width: 100%; max-width: 400px; background-color: var(--body-color); box-shadow: -4px 0 24px hsla(353, 100%, 8%, 0.1); }
	.cart-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--container-color); }
	.cart-drawer-title { font-size: var(--h2-font-size); font-family: var(--second-font); }
	.cart-drawer-close { font-size: 1.5rem; color: var(--title-color); cursor: pointer; }
	.cart-drawer-items { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; row-gap: 1.5rem; align-items: center; }
	.cart-empty-text { text-align: center; color: var(--text-color-light); margin-top: 3rem; }
	.cart-item { display: flex; align-items: center; column-gap: 1rem; width: 100%; }
	.cart-item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 1rem; filter: var(--shadow-small-img); }
	.cart-item-info { flex: 1; }
	.cart-item-name { font-weight: var(--font-semi-bold); color: var(--title-color); font-size: var(--normal-font-size); }
	.cart-item-price { color: var(--first-color); font-family: var(--second-font); }
	.cart-item-controls { display: flex; align-items: center; column-gap: 0.75rem; }
	.qty-btn { display: inline-flex; padding: 4px; background-color: var(--container-color); border-radius: 0.5rem; color: var(--title-color); cursor: pointer; transition: all 0.4s; }
	.qty-btn.active { background-color: var(--first-color); color: var(--white-color); }
	.qty-val { font-weight: var(--font-semi-bold); min-width: 20px; text-align: center; }
	.cart-drawer-footer { padding: 1.5rem; border-top: 1px solid var(--container-color); display: flex; flex-direction: column; row-gap: 1rem; }
	.cart-total { display: flex; justify-content: space-between; align-items: center; }
	.total-label { color: var(--text-color-light); }
	.total-value { font-size: var(--h1-font-size); font-family: var(--second-font); color: var(--first-color); }
	.w-full { width: 100%; }

	.home__cta {
		display: inline-flex;
		align-items: center;
		column-gap: .75rem;
		background-color: var(--container-color);
		padding: .75rem 1.25rem;
		border-radius: 4rem;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		color: var(--text-color);
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, .08);
	}

	.home__cta-icon {
		font-size: 1.5rem;
		color: var(--first-color);
	}

	.steps__container {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.steps__card {
		background-color: var(--container-color);
		padding: 2rem 1.5rem;
		border-radius: 1.5rem;
		text-align: center;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, .08);
	}

	.steps__icon {
		width: 64px;
		height: 64px;
		background-color: var(--first-color);
		color: var(--white-color);
		font-size: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 auto 1.25rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 40%, .3);
	}

	.steps__title {
		font-size: var(--h3-font-size);
		margin-bottom: .5rem;
	}

	.steps__description {
		font-size: var(--small-font-size);
		color: var(--text-color-light);
		line-height: 1.6;
	}
</style>
