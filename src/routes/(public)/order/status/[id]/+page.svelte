<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import { formatRupiah } from '$lib/utils';
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();
	const session = $derived(data.session);

	const batchStatusLabel: Record<string, string> = {
		pending: 'Menunggu dapur',
		processing: 'Sedang diproses',
		done: 'Siap',
		cancelled: 'Dibatalkan'
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

	// Polling setiap 10 detik
	onMount(() => {
		const interval = setInterval(() => invalidateAll(), 10000);
		return () => clearInterval(interval);
	});

	function formatTime(date: Date | null) {
		if (!date) return '';
		return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	const activeBatches = $derived(session?.batches.filter((b) => b.status !== 'cancelled') ?? []);
</script>

<svelte:head>
	<title>Status Pesanan — {session.customerName || session.table?.name || 'Cafe'}</title>
</svelte:head>

<Navbar />

<main class="main has-mobile-nav">
	<section class="section">
		<div class="container">
			<!-- Header bill -->
			<div class="bill-header">
				<div class="bill-header__info">
					<p class="bill-header__table">
						<i class="ri-user-fill"></i>
						{session.customerName || (session.table ? `Meja: ${session.table.name}` : 'Pelanggan')}
					</p>
					<div class="bill-header__badges">
						{#if session.status === 'processing'}
							<span class="badge badge--processing">
								<i class="ri-restaurant-line"></i> Sedang Disiapkan
							</span>
						{:else if session.status === 'open'}
							<span class="badge badge--open">
								<i class="ri-record-circle-fill"></i> Sesi Aktif
							</span>
						{:else if session.status === 'closed'}
							<span class="badge badge--paid">
								<i class="ri-checkbox-circle-fill"></i> Selesai
							</span>
						{/if}

						{#if session.paymentStatus === 'paid'}
							<span class="badge badge--paid">
								<i class="ri-checkbox-circle-fill"></i> Lunas
							</span>
						{/if}
					</div>
				</div>
				<div class="bill-header__total">
					<span class="bill-header__total-label">Total Tagihan</span>
					<span class="bill-header__total-value">{formatRupiah(session.totalPrice)}</span>
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
										<p class="batch__item-qty">
											{item.quantity} × {formatRupiah(item.priceAtTime)}
										</p>
									</div>
									<span class="batch__item-total">
										{formatRupiah(item.priceAtTime * item.quantity)}
									</span>
								</div>
							{/each}
						</div>

						<div class="batch__footer">
							<span class="batch__subtotal">Subtotal</span>
							<span class="batch__subtotal-value">{formatRupiah(batch.totalPrice)}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Total & aksi -->
			<div class="bill-summary">
				<div class="bill-summary__row">
					<span>Total Items</span>
					<span
						>{activeBatches.reduce((s, b) => s + b.items.reduce((si, i) => si + i.quantity, 0), 0)} pcs</span
					>
				</div>
				<div class="bill-summary__total">
					<span>Total</span>
					<span>{formatRupiah(session.totalPrice)}</span>
				</div>

				{#if session.paymentStatus === 'unpaid'}
					<div class="bill-pay-hint">
						<i class="ri-information-line"></i>
						<span>Silakan ke kasir dan tunjukkan halaman ini untuk membayar.</span>
					</div>
				{:else}
					<div class="bill-paid-badge">
						<i class="ri-checkbox-circle-fill"></i>
						<span>Pembayaran diterima. Terima kasih!</span>
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="bill-actions">
				{#if session.status === 'open'}
					<a href="/menu{session.tableId ? '?table=' + session.tableId : ''}" class="button">
						<i class="ri-add-line"></i> Pesan Lagi
					</a>
				{:else if session.status === 'processing'}
					<div class="bill-processing-hint">
						<i class="ri-restaurant-2-line"></i>
						<span>Pesanan Anda sedang disiapkan. Mohon tunggu.</span>
					</div>
				{/if}
				<p class="bill-refresh-hint">
					<i class="ri-refresh-line"></i> Diperbarui otomatis setiap 10 detik
				</p>
			</div>
		</div>
	</section>
</main>

<MobileNav activeSessionId={session.id} tableId={session.tableId} />

<footer class="footer pb-mobile">
	<div class="footer__container container">
		<span class="footer__copy">&#169; Semua Hak Dilindungi</span>
	</div>
</footer>

<style>
	@media screen and (max-width: 1150px) {
		.pb-mobile {
			padding-bottom: 6rem;
		}
		.main {
			padding-bottom: 4rem;
		}
	}
	/* Reuse styles from table bill */
	.bill-header {
		background-color: var(--first-color);
		padding: 1.5rem;
		border-radius: 1.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 8px 24px hsla(353, 100%, 40%, 0.3);
	}
	.bill-header__table {
		color: hsla(24, 86%, 90%, 0.9);
		font-size: var(--small-font-size);
		display: flex;
		align-items: center;
		column-gap: 0.25rem;
		margin-bottom: 0.5rem;
	}
	.bill-header__badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		column-gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 4rem;
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
	}
	.badge--open {
		background-color: hsla(24, 86%, 90%, 0.2);
		color: var(--white-color);
	}
	.badge--processing {
		background-color: hsla(24, 86%, 90%, 0.2);
		color: var(--white-color);
	}
	.badge--paid {
		background-color: hsla(142, 71%, 45%, 0.8);
		color: white;
	}
	.bill-header__total {
		text-align: right;
	}
	.bill-header__total-label {
		display: block;
		font-size: var(--smaller-font-size);
		color: hsla(24, 86%, 90%, 0.8);
		margin-bottom: 0.25rem;
	}
	.bill-header__total-value {
		font-family: var(--second-font);
		font-size: var(--bigger-font-size);
		color: var(--white-color);
	}
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
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, 0.06);
	}
	.batch--cancelled {
		opacity: 0.5;
	}
	.batch__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid hsla(353, 16%, 32%, 0.08);
	}
	.batch__meta {
		display: flex;
		align-items: center;
		column-gap: 0.75rem;
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
		column-gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 4rem;
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
	}
	.status--pending {
		background-color: hsla(38, 95%, 55%, 0.12);
		color: hsl(38, 85%, 40%);
	}
	.status--processing {
		background-color: hsla(220, 90%, 60%, 0.12);
		color: hsl(220, 70%, 50%);
	}
	.status--done {
		background-color: hsla(142, 71%, 45%, 0.12);
		color: hsl(142, 60%, 35%);
	}
	.status--cancelled {
		background-color: hsla(0, 80%, 55%, 0.1);
		color: hsl(0, 65%, 50%);
	}
	.batch__items {
		padding: 0.75rem 1.25rem;
		display: flex;
		flex-direction: column;
		row-gap: 0.75rem;
	}
	.batch__item {
		display: flex;
		align-items: center;
		column-gap: 0.75rem;
	}
	.batch__item-img {
		width: 44px;
		height: 44px;
		border-radius: 0.75rem;
		object-fit: cover;
		filter: var(--shadow-small-img);
	}
	.batch__item-info {
		flex: 1;
	}
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
		padding: 0.75rem 1.25rem;
		border-top: 1px solid hsla(353, 16%, 32%, 0.08);
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
	.bill-summary {
		background-color: var(--container-color);
		border-radius: 1.25rem;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, 0.06);
	}
	.bill-summary__row {
		display: flex;
		justify-content: space-between;
		font-size: var(--small-font-size);
		color: var(--text-color-light);
		margin-bottom: 0.5rem;
	}
	.bill-summary__total {
		display: flex;
		justify-content: space-between;
		font-family: var(--second-font);
		font-size: var(--h2-font-size);
		color: var(--title-color);
		padding-top: 0.75rem;
		margin-top: 0.5rem;
		border-top: 1px solid hsla(353, 16%, 32%, 0.1);
		margin-bottom: 1rem;
	}
	.bill-pay-hint {
		display: flex;
		align-items: flex-start;
		column-gap: 0.5rem;
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		background-color: hsla(353, 16%, 32%, 0.06);
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
	}
	.bill-pay-hint i {
		color: var(--first-color);
		font-size: 1rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}
	.bill-paid-badge {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		justify-content: center;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		color: #16a34a;
		background-color: hsla(142, 71%, 45%, 0.1);
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
	}
	.bill-paid-badge i {
		font-size: 1.1rem;
	}
	.bill-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 1rem;
	}
	.bill-actions .button {
		display: inline-flex;
		align-items: center;
		column-gap: 0.5rem;
	}
	.bill-processing-hint {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		color: var(--first-color);
		background-color: hsla(353, 100%, 40%, 0.06);
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		width: 100%;
		justify-content: center;
	}
	.bill-refresh-hint {
		display: flex;
		align-items: center;
		column-gap: 0.25rem;
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
