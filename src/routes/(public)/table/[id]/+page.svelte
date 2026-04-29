<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();
	const table = $derived(data.table);
	const session = $derived(data.session);

	const batchStatusLabel: Record<string, string> = {
		pending: 'Waiting for kitchen',
		processing: 'Being prepared',
		done: 'Ready',
		cancelled: 'Cancelled'
	};

	const batchStatusIcon: Record<string, string> = {
		pending: 'ri-time-line',
		processing: 'ri-restaurant-line',
		done: 'ri-checkbox-circle-line',
		cancelled: 'ri-close-circle-line'
	};

	const batchStatusColor: Record<string, string> = {
		pending: 'status--pending',
		processing: 'status--processing',
		done: 'status--done',
		cancelled: 'status--cancelled'
	};

	// Polling setiap 10 detik untuk update status real-time
	onMount(() => {
		const interval = setInterval(() => invalidateAll(), 10000);
		return () => clearInterval(interval);
	});

	function formatTime(date: Date | null) {
		if (!date) return '';
		return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	const activeBatches = $derived(session?.batches.filter(b => b.status !== 'cancelled') ?? []);
</script>

<svelte:head>
	<title>Bill — {table.name}</title>
</svelte:head>

<Navbar />

<main class="main">
	<section class="section">
		<div class="container">

			{#if !session}
				<!-- Belum ada pesanan -->
				<div class="empty-state">
					<div class="empty-state__icon">
						<i class="ri-restaurant-2-line"></i>
					</div>
					<h1 class="section__title">No Active Orders</h1>
					<p class="empty-state__description">You haven't placed any orders yet for {table.name}.</p>
					<a href="/menu?table={table.id}" class="button">Browse Menu</a>
				</div>
			{:else}
				<!-- Header bill -->
				<div class="bill-header">
					<div class="bill-header__info">
						<p class="bill-header__table">
							<i class="ri-map-pin-2-fill"></i> {table.name}
						</p>
						<div class="bill-header__badges">
							<span class="badge badge--open">
								<i class="ri-record-circle-fill"></i> Session Open
							</span>
							{#if session.paymentStatus === 'paid'}
								<span class="badge badge--paid">
									<i class="ri-checkbox-circle-fill"></i> Paid
								</span>
							{/if}
						</div>
					</div>
					<div class="bill-header__total">
						<span class="bill-header__total-label">Running Total</span>
						<span class="bill-header__total-value">${session.totalPrice.toFixed(2)}</span>
					</div>
				</div>

				<!-- Daftar batch -->
				<div class="batches">
					{#each session.batches as batch, i}
						<div class="batch {batch.status === 'cancelled' ? 'batch--cancelled' : ''}">
							<div class="batch__header">
								<div class="batch__meta">
									<span class="batch__number">Order #{session.batches.length - i}</span>
									<span class="batch__time">{formatTime(batch.createdAt)}</span>
								</div>
								<span class="batch__status {batchStatusColor[batch.status]}">
									<i class={batchStatusIcon[batch.status]}></i>
									{batchStatusLabel[batch.status]}
								</span>
							</div>

							<div class="batch__items">
								{#each batch.items as item}
									<div class="batch__item">
										<img
											src={item.menu?.image ?? '/img/product-1.png'}
											alt={item.menu?.name}
											class="batch__item-img"
										/>
										<div class="batch__item-info">
											<p class="batch__item-name">{item.menu?.name ?? 'Unknown'}</p>
											<p class="batch__item-qty">{item.quantity} × ${item.priceAtTime.toFixed(2)}</p>
										</div>
										<span class="batch__item-total">
											${(item.priceAtTime * item.quantity).toFixed(2)}
										</span>
									</div>
								{/each}
							</div>

							<div class="batch__footer">
								<span class="batch__subtotal">Subtotal</span>
								<span class="batch__subtotal-value">${batch.totalPrice.toFixed(2)}</span>
							</div>
						</div>
					{/each}
				</div>

				<!-- Total & aksi -->
				<div class="bill-summary">
					{#each [['Items', activeBatches.reduce((s, b) => s + b.items.reduce((si, i) => si + i.quantity, 0), 0) + ' pcs'],
						['Subtotal', '$' + session.totalPrice.toFixed(2)]] as [label, value]}
						<div class="bill-summary__row">
							<span>{label}</span>
							<span>{value}</span>
						</div>
					{/each}
					<div class="bill-summary__total">
						<span>Total</span>
						<span>${session.totalPrice.toFixed(2)}</span>
					</div>

					{#if session.paymentStatus === 'unpaid'}
						<div class="bill-pay-hint">
							<i class="ri-information-line"></i>
							<span>When you're ready, let the cashier know to process your payment.</span>
						</div>
					{:else}
						<div class="bill-paid-badge">
							<i class="ri-checkbox-circle-fill"></i>
							<span>Payment received. Thank you!</span>
						</div>
					{/if}
				</div>

				<!-- Actions -->
				<div class="bill-actions">
					<a href="/menu?table={table.id}" class="button">
						<i class="ri-add-line"></i> Order More
					</a>
					<p class="bill-refresh-hint">
						<i class="ri-refresh-line"></i> Updates automatically every 10 seconds
					</p>
				</div>
			{/if}
		</div>
	</section>
</main>

<footer class="footer">
	<div class="footer__container container">
		<span class="footer__copy">&#169; All Rights Reserved By Pizza App</span>
	</div>
</footer>

<style>
	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 0;
	}

	.empty-state__icon {
		width: 80px;
		height: 80px;
		background-color: var(--container-color);
		color: var(--first-color);
		font-size: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin-bottom: 1.5rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, .1);
	}

	.empty-state__description {
		color: var(--text-color-light);
		margin-bottom: 2rem;
	}

	/* Bill header */
	.bill-header {
		background-color: var(--first-color);
		padding: 1.5rem;
		border-radius: 1.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 8px 24px hsla(353, 100%, 40%, .3);
	}

	.bill-header__table {
		color: hsla(24, 86%, 90%, .9);
		font-size: var(--small-font-size);
		display: flex;
		align-items: center;
		column-gap: .25rem;
		margin-bottom: .5rem;
	}

	.bill-header__badges {
		display: flex;
		gap: .5rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		column-gap: .25rem;
		padding: .25rem .75rem;
		border-radius: 4rem;
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
	}

	.badge--open {
		background-color: hsla(24, 86%, 90%, .2);
		color: var(--white-color);
	}

	.badge--paid {
		background-color: hsla(142, 71%, 45%, .8);
		color: white;
	}

	.bill-header__total {
		text-align: right;
	}

	.bill-header__total-label {
		display: block;
		font-size: var(--smaller-font-size);
		color: hsla(24, 86%, 90%, .8);
		margin-bottom: .25rem;
	}

	.bill-header__total-value {
		font-family: var(--second-font);
		font-size: var(--bigger-font-size);
		color: var(--white-color);
	}

	/* Batches */
	.batches {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.batch {
		background-color: var(--container-color);
		border-radius: 1.25rem;
		overflow: hidden;
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, .06);
	}

	.batch--cancelled {
		opacity: .5;
	}

	.batch__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid hsla(353, 16%, 32%, .08);
	}

	.batch__meta {
		display: flex;
		align-items: center;
		column-gap: .75rem;
	}

	.batch__number {
		font-weight: var(--font-semi-bold);
		font-size: var(--small-font-size);
		color: var(--title-color);
	}

	.batch__time {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
	}

	.batch__status {
		display: inline-flex;
		align-items: center;
		column-gap: .25rem;
		padding: .25rem .75rem;
		border-radius: 4rem;
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
	}

	.status--pending { background-color: hsla(38, 95%, 55%, .12); color: hsl(38, 85%, 40%); }
	.status--processing { background-color: hsla(220, 90%, 60%, .12); color: hsl(220, 70%, 50%); }
	.status--done { background-color: hsla(142, 71%, 45%, .12); color: hsl(142, 60%, 35%); }
	.status--cancelled { background-color: hsla(0, 80%, 55%, .1); color: hsl(0, 65%, 50%); }

	.batch__items {
		padding: .75rem 1.25rem;
		display: flex;
		flex-direction: column;
		row-gap: .75rem;
	}

	.batch__item {
		display: flex;
		align-items: center;
		column-gap: .75rem;
	}

	.batch__item-img {
		width: 44px;
		height: 44px;
		border-radius: .75rem;
		object-fit: cover;
		filter: var(--shadow-small-img);
	}

	.batch__item-info { flex: 1; }

	.batch__item-name {
		font-size: var(--small-font-size);
		font-weight: var(--font-semi-bold);
		color: var(--title-color);
	}

	.batch__item-qty {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
	}

	.batch__item-total {
		font-family: var(--second-font);
		font-size: var(--small-font-size);
		color: var(--title-color);
	}

	.batch__footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: .75rem 1.25rem;
		border-top: 1px solid hsla(353, 16%, 32%, .08);
	}

	.batch__subtotal {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
	}

	.batch__subtotal-value {
		font-family: var(--second-font);
		font-size: var(--normal-font-size);
		color: var(--title-color);
	}

	/* Bill summary */
	.bill-summary {
		background-color: var(--container-color);
		border-radius: 1.25rem;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, .06);
	}

	.bill-summary__row {
		display: flex;
		justify-content: space-between;
		font-size: var(--small-font-size);
		color: var(--text-color-light);
		margin-bottom: .5rem;
	}

	.bill-summary__total {
		display: flex;
		justify-content: space-between;
		font-family: var(--second-font);
		font-size: var(--h2-font-size);
		color: var(--title-color);
		padding-top: .75rem;
		margin-top: .5rem;
		border-top: 1px solid hsla(353, 16%, 32%, .1);
		margin-bottom: 1rem;
	}

	.bill-pay-hint {
		display: flex;
		align-items: flex-start;
		column-gap: .5rem;
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		background-color: hsla(353, 16%, 32%, .06);
		padding: .75rem 1rem;
		border-radius: .75rem;
	}

	.bill-pay-hint i { color: var(--first-color); font-size: 1rem; flex-shrink: 0; margin-top: .1rem; }

	.bill-paid-badge {
		display: flex;
		align-items: center;
		column-gap: .5rem;
		justify-content: center;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		color: #16a34a;
		background-color: hsla(142, 71%, 45%, .1);
		padding: .75rem 1rem;
		border-radius: .75rem;
	}

	.bill-paid-badge i { font-size: 1.1rem; }

	/* Actions */
	.bill-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 1rem;
	}

	.bill-actions .button {
		display: inline-flex;
		align-items: center;
		column-gap: .5rem;
	}

	.bill-refresh-hint {
		display: flex;
		align-items: center;
		column-gap: .25rem;
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
	}

	@media screen and (min-width: 576px) {
		.container {
			max-width: 480px;
			margin-inline: auto;
		}
	}
</style>
