<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import PaymentOptions from '$lib/components/PaymentOptions.svelte';
	import { formatRupiah } from '$lib/utils';
	import { subscribeRealtime } from '$lib/realtime';
	import { initNotificationSound, playNotificationSound } from '$lib/notification-sound';

	let { data, form } = $props();
	const table = $derived(data.table);
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

	let toastText = $state<string | null>(null);
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	function showToast(text: string) {
		toastText = text;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toastText = null), 4000);
		playNotificationSound();
		try {
			navigator.vibrate?.(200);
		} catch {
			// abaikan — vibrate tidak tersedia
		}
	}

	// Realtime via Pusher; fallback polling 10 detik jika belum dikonfigurasi
	onMount(() => {
		if (data.pusher) {
			const cleanupSound = initNotificationSound();
			const unsubscribe = subscribeRealtime(
				data.pusher,
				`table-${data.table.id}`,
				(event, evData) => {
					if (event === 'order-confirmed') {
						const payload = evData as { estimatedMinutes?: number | null };
						showToast(
							payload?.estimatedMinutes
								? `Pesanan diterima! Siap dalam ±${payload.estimatedMinutes} menit.`
								: 'Pesanan diterima! Dapur sedang menyiapkan.'
						);
					} else if (event === 'session-updated') {
						const payload = evData as { batchStatus?: string };
						if (payload?.batchStatus === 'done') showToast('Pesanan Anda siap!');
						else if (payload?.batchStatus === 'cancelled') showToast('Satu pesanan dibatalkan.');
					}
					invalidateAll();
				}
			);
			return () => {
				cleanupSound();
				unsubscribe();
				if (toastTimer) clearTimeout(toastTimer);
			};
		}
		const interval = setInterval(() => invalidateAll(), 10000);
		return () => {
			clearInterval(interval);
			if (toastTimer) clearTimeout(toastTimer);
		};
	});

	function formatTime(date: Date | null) {
		if (!date) return '';
		return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	const activeBatches = $derived(session?.batches.filter((b) => b.status !== 'cancelled') ?? []);
</script>

<svelte:head>
	<title>Bill — {table.name}</title>
</svelte:head>

<Navbar />

{#if toastText}
	<div class="order-toast" role="status" aria-live="polite">
		<i class="ri-restaurant-2-line"></i>
		<span>{toastText}</span>
	</div>
{/if}

<main class="main has-mobile-nav">
	<section class="section">
		<div class="container">
			{#if !session}
				<!-- Belum ada pesanan -->
				<div class="empty-state">
					<div class="empty-state__icon">
						<i class="ri-restaurant-2-line"></i>
					</div>
					<h1 class="section__title">Belum Ada Pesanan</h1>
					<p class="empty-state__description">Anda belum memesan untuk {table.name}.</p>
					<a href="/menu?table={table.id}" class="button">Lihat Menu</a>
				</div>
			{:else}
				<!-- Header bill -->
				<div class="bill-header">
					<div class="bill-header__info">
						<p class="bill-header__table">
							<i class="ri-map-pin-2-fill"></i>
							{table.name}
						</p>
						<div class="bill-header__badges">
							{#if session.status === 'processing'}
								<span class="badge badge--processing">
									<i class="ri-restaurant-line"></i> Sedang Disiapkan
								</span>
							{:else}
								<span class="badge badge--open">
									<i class="ri-record-circle-fill"></i> Sesi Aktif
								</span>
							{/if}
							{#if session.paymentStatus === 'paid'}
								<span class="badge badge--paid">
									<i class="ri-checkbox-circle-fill"></i> Lunas
								</span>
							{:else if session.paymentStatus === 'pending'}
								<span class="badge badge--pending-pay">
									<i class="ri-time-line"></i> Menunggu Konfirmasi
								</span>
							{/if}
						</div>
					</div>
					<div class="bill-header__total">
						<span class="bill-header__total-label">Total Sementara</span>
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
					{#each [['Item', activeBatches.reduce((s, b) => s + b.items.reduce((si, i) => si + i.quantity, 0), 0) + ' pcs'], ['Subtotal', formatRupiah(session.totalPrice)]] as [label, value]}
						<div class="bill-summary__row">
							<span>{label}</span>
							<span>{value}</span>
						</div>
					{/each}
					<div class="bill-summary__total">
						<span>Total</span>
						<span>{formatRupiah(session.totalPrice)}</span>
					</div>

					{#if session.paymentStatus === 'paid'}
						<div class="bill-paid-badge">
							<i class="ri-checkbox-circle-fill"></i>
							<span>Pembayaran diterima. Terima kasih!</span>
						</div>
					{/if}
				</div>

				<!-- Pilihan pembayaran -->
				<PaymentOptions
					paymentStatus={session.paymentStatus}
					totalPrice={session.totalPrice}
					bank={data.bank}
					errorMessage={form?.message}
				/>

				<!-- Actions -->
				<div class="bill-actions">
					{#if session.status === 'open'}
						<a href="/menu?table={table.id}" class="button">
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
			{/if}
		</div>
	</section>
</main>

<MobileNav activeSessionId={session?.id} tableId={table.id} />

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
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, 0.1);
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

	.badge--pending-pay {
		background-color: hsla(45, 93%, 47%, 0.85);
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

	/* Bill summary */
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

	.bill-processing-hint i {
		font-size: 1.1rem;
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

	.order-toast {
		position: fixed;
		top: 5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		padding: 0.875rem 1.25rem;
		border-radius: 1rem;
		background-color: hsl(220, 70%, 50%);
		color: white;
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		box-shadow: 0 8px 24px hsla(220, 70%, 30%, 0.35);
		animation: toast-in 0.3s ease;
		white-space: nowrap;
	}

	.order-toast i {
		font-size: 1.1rem;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
