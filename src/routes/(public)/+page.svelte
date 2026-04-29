<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/Navbar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();

	let cartOpen = $state(false);
	let ordering = $state(false);
</script>

<Navbar onCartClick={() => (cartOpen = true)} />

<main class="main">
	<Hero />

	<!--==================== PRODUCTS ====================-->
	<section class="products section" id="products">
		<h2 class="section__title">The Most <br /> Devoured Pizzas</h2>

		<div class="products__container container grid">
			{#if data.menus.length > 0}
				{#each data.menus as item (item.id ?? item.name)}
					<ProductCard 
						name={item.name} 
						price={item.price} 
						image={item.image ?? undefined}
						description={item.description ?? undefined}
						onAdd={() => cart.add({ menuId: item.id, name: item.name, price: item.price, image: item.image })}
					/>
				{/each}
			{:else}
				<p class="container" style="text-align: center;">No products found. Please seed your D1 database.</p>
			{/if}
		</div>
	</section>

	<!-- Floating Cart Button -->
	{#if cart.count > 0}
		<button class="button floating-cart" onclick={() => (cartOpen = true)}>
			<i class="ri-shopping-cart-2-line"></i>
			<span>{cart.count}</span>
		</button>
	{/if}
</main>

<footer class="footer">
	<div class="footer__container container">
		<span class="footer__copy">
			&#169; All Rights Reserved By Pizza App
		</span>
	</div>
</footer>

<!-- Cart Drawer Overlay -->
{#if cartOpen}
	<div class="cart-drawer-overlay" role="presentation">
		<div class="cart-drawer-backdrop" onclick={() => (cartOpen = false)} role="presentation"></div>
		<div class="cart-drawer-content">
			<!-- Cart Header -->
			<div class="cart-drawer-header">
				<h2 class="cart-drawer-title">Your Order</h2>
				<button onclick={() => (cartOpen = false)} aria-label="Close cart" class="cart-drawer-close">
					<i class="ri-close-large-line"></i>
				</button>
			</div>

			<!-- Cart Items -->
			<div class="cart-drawer-items">
				{#if cart.items.length === 0}
					<p class="cart-empty-text">Your cart is empty</p>
				{:else}
					{#each cart.items as item}
						<div class="cart-item">
							<img src={item.image ?? '/img/product-1.png'} alt={item.name} class="cart-item-img" />
							<div class="cart-item-info">
								<p class="cart-item-name">{item.name}</p>
								<p class="cart-item-price">${item.price.toFixed(2)}</p>
							</div>
							<div class="cart-item-controls">
								<button onclick={() => cart.updateQty(item.menuId, item.quantity - 1)} class="qty-btn" aria-label="Decrease">
									<i class="ri-subtract-line"></i>
								</button>
								<span class="qty-val">{item.quantity}</span>
								<button onclick={() => cart.updateQty(item.menuId, item.quantity + 1)} class="qty-btn active" aria-label="Increase">
									<i class="ri-add-line"></i>
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Cart Footer -->
			{#if cart.items.length > 0}
				<div class="cart-drawer-footer">
					<div class="cart-total">
						<span class="total-label">Total ({cart.count} items)</span>
						<span class="total-value">${cart.total.toFixed(2)}</span>
					</div>

					<form
						method="POST"
						action="/menu?/order"
						use:enhance={() => {
							ordering = true;
							return async ({ update }) => {
								await update();
								ordering = false;
								cart.clear();
							};
						}}
					>
						<!-- Use T-01 as fallback for demo/testing if no table is scanned -->
						<input type="hidden" name="tableId" value={data.table?.id || 'T-01'} />
						<input
							type="hidden"
							name="items"
							value={JSON.stringify(
								cart.items.map((i) => ({ menuId: i.menuId, name: i.name, price: i.price, quantity: i.quantity }))
							)}
						/>
						
						{#if !data.table}
							<p style="font-size: 10px; color: var(--first-color); margin-bottom: 8px; text-align: center;">
								No table detected. Ordering for <strong>Table 1 (Demo)</strong>.
							</p>
						{/if}

						<button
							type="submit"
							disabled={ordering}
							class="button w-full"
						>
							{ordering ? 'Placing order...' : `Place Order · $${cart.total.toFixed(2)}`}
						</button>
					</form>

					<button
						onclick={() => {
							cart.clear();
						}}
						class="clear-cart-btn"
					>
						Clear cart
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Shared styles with menu for consistency */
	.floating-cart {
		position: fixed;
		bottom: 2rem;
		right: 1.5rem;
		z-index: var(--z-fixed);
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-radius: 4rem;
		box-shadow: 0 8px 32px hsla(353, 100%, 40%, 0.4);
	}

	.floating-cart i {
		font-size: 1.25rem;
	}

	.floating-cart span {
		background-color: var(--white-color);
		color: var(--first-color);
		padding: 2px 8px;
		border-radius: 1rem;
		font-size: var(--smaller-font-size);
		font-weight: var(--font-semi-bold);
	}

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

	.cart-drawer-title {
		font-size: var(--h2-font-size);
		font-family: var(--second-font);
	}

	.cart-drawer-close {
		font-size: 1.5rem;
		color: var(--title-color);
		cursor: pointer;
	}

	.cart-drawer-items {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		row-gap: 1.5rem;
	}

	.cart-empty-text {
		text-align: center;
		color: var(--text-color-light);
		margin-top: 3rem;
	}

	.cart-item {
		display: flex;
		align-items: center;
		column-gap: 1rem;
	}

	.cart-item-img {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 1rem;
		filter: var(--shadow-small-img);
	}

	.cart-item-info {
		flex: 1;
	}

	.cart-item-name {
		font-weight: var(--font-semi-bold);
		color: var(--title-color);
		font-size: var(--normal-font-size);
	}

	.cart-item-price {
		color: var(--first-color);
		font-family: var(--second-font);
	}

	.cart-item-controls {
		display: flex;
		align-items: center;
		column-gap: 0.75rem;
	}

	.qty-btn {
		display: inline-flex;
		padding: 4px;
		background-color: var(--container-color);
		border-radius: 0.5rem;
		color: var(--title-color);
		cursor: pointer;
		transition: all 0.4s;
	}

	.qty-btn.active {
		background-color: var(--first-color);
		color: var(--white-color);
	}

	.qty-val {
		font-weight: var(--font-semi-bold);
		min-width: 20px;
		text-align: center;
	}

	.cart-drawer-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--container-color);
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	.cart-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.total-label {
		color: var(--text-color-light);
	}

	.total-value {
		font-size: var(--h1-font-size);
		font-family: var(--second-font);
		color: var(--first-color);
	}

	.clear-cart-btn {
		text-align: center;
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		background: none;
		cursor: pointer;
	}

	.w-full {
		width: 100%;
	}
</style>
