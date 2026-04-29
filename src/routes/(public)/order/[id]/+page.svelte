<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	let { data } = $props();
	const order = $derived(data.order);

	const statusLabel: Record<string, string> = {
		pending: 'Order received — waiting for kitchen',
		processing: 'Your order is being prepared',
		completed: 'Order completed. Enjoy!',
		cancelled: 'Order was cancelled'
	};

	const statusIcon: Record<string, string> = {
		pending: 'ri-time-line',
		processing: 'ri-restaurant-line',
		completed: 'ri-checkbox-circle-line',
		cancelled: 'ri-close-circle-line'
	};
</script>

<svelte:head>
	<title>Order Confirmed — #{order.id.slice(0, 8)}</title>
</svelte:head>

<Navbar />

<main class="main">
	<section class="section" id="order-status">
		<div class="container grid">
			<!-- Success/Status Card -->
			<div class="order__card">
				<div class="order__status-icon {order.status}">
					<i class={statusIcon[order.status] ?? 'ri-time-line'}></i>
				</div>
				
				<h1 class="section__title">Order Placed!</h1>
				<p class="order__description">{statusLabel[order.status]}</p>
				
				<div class="order__meta">
					<span class="order__table">
						<i class="ri-map-pin-2-fill"></i> {order.table?.name}
					</span>
					<span class="order__id">
						<i class="ri-hashtag"></i> {order.id.slice(0, 8)}
					</span>
				</div>

				<img src="/img/sticker-pizza.svg" alt="" class="order__sticker-1" />
			</div>

			<!-- Items List -->
			<div class="order__details">
				<h2 class="order__details-title">Order Details</h2>
				
				<div class="order__items">
					{#each order.items as item}
						<div class="order__item">
							<img src={item.menu?.image ?? '/img/product-1.png'} alt={item.menu?.name} class="order__item-img" />
							<div class="order__item-info">
								<p class="order__item-name">{item.menu?.name}</p>
								<p class="order__item-qty">Qty: {item.quantity} × ${item.priceAtTime.toFixed(2)}</p>
							</div>
							<span class="order__item-total">${(item.priceAtTime * item.quantity).toFixed(2)}</span>
						</div>
					{/each}
				</div>

				<div class="order__total">
					<span class="total-label">Total Amount</span>
					<span class="total-value">${order.totalPrice.toFixed(2)}</span>
				</div>
			</div>

			<!-- Actions -->
			<div class="order__actions">
				<a href="/menu?table={order.table?.id}" class="button">
					Order More Food
				</a>
				<a href="/" class="order__back-home">Back to Home</a>
			</div>
		</div>
	</section>
</main>

<footer class="footer">
	<div class="footer__container container">
		<span class="footer__copy"> &#169; All Rights Reserved By Pizza App </span>
	</div>
</footer>

<style>
	.order__card {
		position: relative;
		background-color: var(--container-color);
		padding: 3rem 1.5rem 2rem;
		border-radius: 2rem;
		text-align: center;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, 0.1);
		margin-bottom: 2rem;
	}

	.order__status-icon {
		width: 80px;
		height: 80px;
		background-color: var(--first-color);
		color: var(--white-color);
		font-size: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 auto 1.5rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 40%, 0.4);
	}

	.order__status-icon.completed {
		background-color: #22c55e;
		box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
	}

	.order__status-icon.cancelled {
		background-color: #ef4444;
		box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
	}

	.order__description {
		margin-bottom: 1.5rem;
		color: var(--text-color);
	}

	.order__meta {
		display: flex;
		justify-content: center;
		column-gap: 1.5rem;
		margin-top: 1rem;
	}

	.order__meta span {
		display: flex;
		align-items: center;
		column-gap: 0.25rem;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		color: var(--text-color-light);
	}

	.order__meta i {
		color: var(--first-color);
	}

	.order__sticker-1 {
		width: 40px;
		position: absolute;
		right: 1rem;
		bottom: 1.5rem;
		rotate: 20deg;
		opacity: 0.5;
	}

	.order__details {
		background-color: var(--container-color);
		padding: 1.5rem;
		border-radius: 2rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, 0.05);
	}

	.order__details-title {
		font-size: var(--h3-font-size);
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid hsla(353, 16%, 32%, 0.1);
	}

	.order__items {
		display: flex;
		flex-direction: column;
		row-gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.order__item {
		display: flex;
		align-items: center;
		column-gap: 1rem;
	}

	.order__item-img {
		width: 50px;
		height: 50px;
		border-radius: 0.75rem;
		object-fit: cover;
		filter: var(--shadow-small-img);
	}

	.order__item-info {
		flex: 1;
	}

	.order__item-name {
		font-weight: var(--font-semi-bold);
		font-size: var(--normal-font-size);
		color: var(--title-color);
	}

	.order__item-qty {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
	}

	.order__item-total {
		font-family: var(--second-font);
		color: var(--title-color);
	}

	.order__total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid hsla(353, 16%, 32%, 0.1);
	}

	.total-label {
		font-weight: var(--font-medium);
		color: var(--text-color-light);
	}

	.total-value {
		font-size: var(--h2-font-size);
		font-family: var(--second-font);
		color: var(--first-color);
	}

	.order__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 1rem;
		margin-top: 2.5rem;
	}

	.order__back-home {
		font-size: var(--small-font-size);
		color: var(--text-color-light);
		font-weight: var(--font-medium);
		transition: color 0.4s;
	}

	.order__back-home:hover {
		color: var(--first-color);
	}

	.button {
		width: 100%;
		max-width: 300px;
	}

	/* Responsive */
	@media screen and (min-width: 576px) {
		.container {
			max-width: 450px;
			margin-inline: auto;
		}
	}
</style>
