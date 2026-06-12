<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { cart } from '$lib/stores/cart.svelte';

	let isMenuOpen = $state(false);
	let isShadowHeader = $state(false);

	const cafeName = $derived((page.data.cafeName as string | undefined) ?? 'Cafe');
	const isCartPage = $derived(page.url.pathname === '/cart');
	const isBillPage = $derived(
		page.url.pathname.startsWith('/order/status') || page.url.pathname === '/bill'
	);


	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	onMount(() => {
		const handleScroll = () => {
			isShadowHeader = window.scrollY >= 50;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header class="header" id="header" class:shadow-header={isShadowHeader}>
	<nav class="nav container">
		<a href="/" class="nav__logo">
			<img src="/img/logo-pizza.svg" alt="logo" />
			{cafeName}
		</a>

		<div class="nav__menu" id="nav-menu" class:show-menu={isMenuOpen}>
			<ul class="nav__list">
				<li>
					<a href="/#home" class="nav__link active-link" onclick={closeMenu}>Home</a>
				</li>
				<li>
					<a href="/#about" class="nav__link" onclick={closeMenu}>About Us</a>
				</li>
				<li>
					<a href="/#popular" class="nav__link" onclick={closeMenu}>Popular</a>
				</li>
				<li>
					<a href="/menu" class="nav__link" onclick={closeMenu}
						>Menu</a
					>
				</li>
				<li>
					<a href="/#contact" class="nav__link" onclick={closeMenu}>Contact</a>
				</li>
			</ul>

			<!-- Close button -->
			<div class="nav__close" id="nav-close" onclick={toggleMenu} aria-hidden="true">
				<i class="ri-close-large-line"></i>
			</div>
		</div>

		<div class="nav__buttons">
			<!-- Aksi desktop: keranjang & tagihan (mobile pakai MobileNav) -->
			<a href="/cart" class="nav__action" class:nav__action--active={isCartPage} aria-label="Keranjang">
				<i class="ri-shopping-cart-2-line"></i>
				{#if cart.count > 0}
					<span class="nav__action-badge">{cart.count}</span>
				{/if}
			</a>
			<a href="/bill" class="nav__action" class:nav__action--active={isBillPage} aria-label="Tagihan">
				<i class="ri-receipt-line"></i>
			</a>

			<!-- Toggle button -->
			<div class="nav__toggle" id="nav-toggle" onclick={toggleMenu} aria-hidden="true">
				<i class="ri-apps-2-fill"></i>
			</div>
		</div>
	</nav>
</header>

<style>
	.nav__buttons {
		display: flex;
		align-items: center;
		column-gap: 1rem;
	}

	.nav__action {
		position: relative;
		display: none;
		font-size: 1.5rem;
		color: var(--title-color);
		transition: color 0.3s;
	}

	.nav__action:hover,
	.nav__action--active {
		color: var(--first-color);
	}

	.nav__action-badge {
		position: absolute;
		top: -4px;
		right: -8px;
		background-color: var(--first-color);
		color: var(--white-color);
		font-size: 0.65rem;
		line-height: 1;
		padding: 3px 5px;
		border-radius: 1rem;
		font-weight: var(--font-semi-bold);
	}

	/* Di bawah 1150px keranjang & tagihan sudah ada di MobileNav */
	@media screen and (min-width: 1150px) {
		.nav__action {
			display: inline-flex;
		}
	}
</style>
