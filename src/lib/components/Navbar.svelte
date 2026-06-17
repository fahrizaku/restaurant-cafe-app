<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { cart } from '$lib/stores/cart.svelte';

	let isShadowHeader = $state(false);

	const cafeName = $derived((page.data.cafeName as string | undefined) ?? 'Cafe');
	const isCartPage = $derived(page.url.pathname === '/cart');
	const isBillPage = $derived(
		page.url.pathname.startsWith('/order/status') || page.url.pathname === '/bill'
	);

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
		<a href="/menu" class="nav__logo">
			<span class="nav__logo__mark" aria-hidden="true">
				<i class="ri-cup-line"></i>
			</span>
			{cafeName}
		</a>

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
