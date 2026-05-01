<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { page } from '$app/state';

	interface Props {
		onCartClick?: () => void;
		activeSessionId?: string | null;
		tableId?: string | null;
	}

	let { onCartClick, activeSessionId, tableId }: Props = $props();

	const isMenuPage = $derived(page.url.pathname === '/menu');
	const isStatusPage = $derived(page.url.pathname.startsWith('/order/status') || page.url.pathname.startsWith('/table/'));
</script>

<div class="mobile-nav">
	<a href="/menu{tableId ? '?table=' + tableId : ''}" class="mobile-nav__item" class:active={isMenuPage}>
		<i class="ri-restaurant-line"></i>
		<span>Menu</span>
	</a>

	<button class="mobile-nav__item" onclick={onCartClick}>
		<div class="mobile-nav__icon-wrapper">
			<i class="ri-shopping-cart-2-line"></i>
			{#if cart.count > 0}
				<span class="mobile-nav__badge">{cart.count}</span>
			{#else}
				<span class="mobile-nav__badge" style="display:none">0</span>
			{/if}
		</div>
		<span>Keranjang</span>
	</button>

	{#if activeSessionId || tableId}
		<a 
			href={tableId ? `/table/${tableId}` : `/order/status/${activeSessionId}`} 
			class="mobile-nav__item" 
			class:active={isStatusPage}
		>
			<i class="ri-receipt-line"></i>
			<span>Tagihan</span>
		</a>
	{:else}
		<a href="/#contact" class="mobile-nav__item">
			<i class="ri-information-line"></i>
			<span>Info</span>
		</a>
	{/if}
</div>

<style>
	.mobile-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 4rem;
		background-color: var(--body-color);
		display: flex;
		justify-content: space-around;
		align-items: center;
		z-index: 1000; /* Higher than var(--z-fixed) which is 100 */
		box-shadow: 0 -4px 16px hsla(353, 100%, 8%, .1);
		border-top: 1px solid var(--container-color);
	}

	.mobile-nav__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: .25rem;
		color: var(--text-color-light);
		background: none;
		cursor: pointer;
		flex: 1;
		padding: .5rem 0;
		transition: color .3s;
	}

	.mobile-nav__item i {
		font-size: 1.25rem;
	}

	.mobile-nav__item span {
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
	}

	.mobile-nav__item.active {
		color: var(--first-color);
	}

	.mobile-nav__icon-wrapper {
		position: relative;
		display: flex;
	}

	.mobile-nav__badge {
		position: absolute;
		top: -5px;
		right: -10px;
		background-color: var(--first-color);
		color: var(--white-color);
		font-size: .65rem;
		padding: 1px 5px;
		border-radius: 1rem;
		font-weight: var(--font-semi-bold);
	}

	@media screen and (min-width: 1150px) {
		.mobile-nav {
			display: none;
		}
	}
</style>