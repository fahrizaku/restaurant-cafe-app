<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Pizza App — Fresh & Delicious Pizzas</title>
</svelte:head>

<Navbar />

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
	activeSessionId={data.activeSessionId} 
	tableId={data.tableId} 
/>

<footer class="footer pb-mobile">
	<div class="footer__container container">
		<span class="footer__copy">&#169; All Rights Reserved By Pizza App</span>
	</div>
</footer>

<style>
	.pb-mobile { padding-bottom: 2rem; }

	@media screen and (max-width: 1150px) {
		.pb-mobile { padding-bottom: 6rem; }
		.main { padding-bottom: 4rem; }
	}

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
