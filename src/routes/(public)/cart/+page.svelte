<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import PublicFooter from '$lib/components/PublicFooter.svelte';
	import { formatRupiah } from '$lib/utils';
	import { Trash2, ChevronLeft } from 'lucide-svelte';

	let { data, form } = $props();
	let ordering = $state(false);
</script>

<svelte:head>
	<title>Keranjang Pesanan — {data.cafeName}</title>
</svelte:head>

<Navbar />

<main class="main has-mobile-nav">
	<section class="section">
		<div class="container">
			<div class="cart-header">
				<a href="/menu" class="back-link">
					<ChevronLeft size={20} />
					<span>Kembali ke Menu</span>
				</a>
				<h1 class="section__title" style="text-align: left; margin-bottom: 0.5rem;">
					Keranjang Anda
				</h1>
				<p class="cart-subtitle">
					{#if data.activeSession?.customerName}
						Atas nama: <strong>{data.activeSession.customerName}</strong>
					{:else}
						Silakan periksa pesanan Anda sebelum dikirim.
					{/if}
				</p>
			</div>

			<div class="cart-content">
				{#if cart.items.length === 0}
					<div class="empty-cart">
						<div class="empty-cart__icon">
							<i class="ri-shopping-cart-2-line"></i>
						</div>
						<h2 class="empty-cart__title">Keranjang Kosong</h2>
						<p class="empty-cart__description">
							Anda belum menambahkan menu apapun ke dalam keranjang.
						</p>
						<a href="/menu" class="button">Lihat Menu</a>
					</div>
				{:else}
					<div class="cart-items">
						{#each cart.items as item}
							<div class="cart-item-card">
								{#if item.image}
									<img src={item.image} alt={item.name} class="item-img" loading="lazy" />
								{:else}
									<div class="item-img item-img--placeholder" aria-hidden="true">
										<i class="ri-restaurant-line"></i>
									</div>
								{/if}
								<div class="item-info">
									<h3 class="item-name">{item.name}</h3>
									<p class="item-price">{formatRupiah(item.price)}</p>
									<div class="item-controls">
										<button
											onclick={() => cart.updateQty(item.menuId, item.quantity - 1)}
											class="qty-btn"
											aria-label="Kurangi jumlah"
										>
											<i class="ri-subtract-line"></i>
										</button>
										<span class="qty-val">{item.quantity}</span>
										<button
											onclick={() => cart.updateQty(item.menuId, item.quantity + 1)}
											class="qty-btn active"
											aria-label="Tambah jumlah"
										>
											<i class="ri-add-line"></i>
										</button>
									</div>
									<input
										type="text"
										class="item-notes"
										placeholder="Catatan (opsional): mis. tanpa gula, pedas sedang"
										maxlength="200"
										value={item.notes ?? ''}
										oninput={(e) => cart.updateNotes(item.menuId, e.currentTarget.value)}
									/>
								</div>
								<button
									onclick={() => cart.remove(item.menuId)}
									class="remove-btn"
									aria-label="Hapus"
								>
									<Trash2 size={18} />
								</button>
							</div>
						{/each}
					</div>

					<div class="cart-summary">
						<div class="summary-row">
							<span>Subtotal ({cart.count} item)</span>
							<span>{formatRupiah(cart.total)}</span>
						</div>
						<div class="summary-total">
							<span>Total</span>
							<span>{formatRupiah(cart.total)}</span>
						</div>

						{#if data.activeSession}
							<!-- Bayar-dulu: order baru ditolak selama tagihan sebelumnya belum dibayar -->
							<div class="unpaid-notice" role="alert">
								<i class="ri-error-warning-line"></i>
								<p>
									Masih ada tagihan <strong>{formatRupiah(data.activeSession.totalPrice)}</strong>
									yang belum dibayar. Selesaikan pembayaran terlebih dahulu — keranjang Anda tetap
									tersimpan.
								</p>
							</div>
							<a
								href={`/order/status/${data.activeSession.id}`}
								class="button w-full unpaid-notice__cta"
							>
								Bayar Tagihan Sekarang
							</a>
						{:else}

						{#if form?.message}
							<p class="order-error" role="alert">{form.message}</p>
						{/if}

						<form
							method="POST"
							action="?/order"
							use:enhance={() => {
								ordering = true;
								return async ({ update, result }) => {
									await update();
									ordering = false;
									if (result.type === 'success' || result.type === 'redirect') {
										cart.clear();
									}
								};
							}}
							class="order-form"
						>
							<div class="input-group">
								<label for="customerName" class="input-label">Nama / No. Meja</label>
								<input
									type="text"
									name="customerName"
									id="customerName"
									placeholder="Contoh: Budi atau Meja 5"
									required
									class="text-input"
								/>
							</div>

							<input
								type="hidden"
								name="items"
								value={JSON.stringify(
									cart.items.map((i) => ({
										menuId: i.menuId,
										name: i.name,
										price: i.price,
										quantity: i.quantity,
										notes: i.notes?.trim() || undefined
									}))
								)}
							/>
							<button type="submit" disabled={ordering} class="button w-full">
								{ordering ? 'Mengirim Pesanan...' : `Pesan Sekarang · ${formatRupiah(cart.total)}`}
							</button>
						</form>
						{/if}

						<button onclick={() => cart.clear()} class="clear-cart-link">
							Kosongkan Keranjang
						</button>
					</div>
				{/if}
			</div>
		</div>
	</section>
</main>

<MobileNav activeSessionId={data.activeSession?.id} />

<PublicFooter />

<style>
	.cart-header {
		margin-bottom: 2rem;
	}
	.back-link {
		display: inline-flex;
		align-items: center;
		column-gap: 0.25rem;
		color: var(--first-color);
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		margin-bottom: 1rem;
	}
	.cart-subtitle {
		color: var(--text-color-light);
		font-size: var(--small-font-size);
	}

	.empty-cart {
		text-align: center;
		padding: 4rem 0;
	}
	.empty-cart__icon {
		width: 80px;
		height: 80px;
		background-color: var(--container-color);
		color: var(--first-color);
		font-size: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 auto 1.5rem;
	}
	.empty-cart__title {
		font-size: var(--h2-font-size);
		margin-bottom: 0.5rem;
	}
	.empty-cart__description {
		color: var(--text-color-light);
		margin-bottom: 2rem;
	}

	.cart-items {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		margin-bottom: 2rem;
	}
	.cart-item-card {
		display: flex;
		align-items: center;
		column-gap: 1rem;
		background-color: var(--container-color);
		padding: 1rem;
		border-radius: 1.25rem;
		position: relative;
	}
	.item-img {
		width: 70px;
		height: 70px;
		object-fit: cover;
		border-radius: 1rem;
		filter: var(--shadow-small-img);
		flex-shrink: 0;
	}
	.item-img--placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: hsla(353, 100%, 8%, 0.05);
		color: var(--text-color-light);
		font-size: 1.5rem;
		filter: none;
	}
	.item-info {
		flex: 1;
	}
	.item-name {
		font-size: var(--normal-font-size);
		font-weight: var(--font-semi-bold);
		color: var(--title-color);
		margin-bottom: 0.25rem;
		/* Ruang untuk tombol hapus yang absolut di kanan atas */
		padding-right: 1.75rem;
	}
	.item-price {
		color: var(--first-color);
		font-family: var(--second-font);
		margin-bottom: 0.75rem;
	}
	.item-controls {
		display: flex;
		align-items: center;
		column-gap: 0.75rem;
	}
	.qty-btn {
		display: inline-flex;
		padding: 4px;
		background-color: var(--body-color);
		border-radius: 0.5rem;
		color: var(--title-color);
		cursor: pointer;
	}
	.qty-btn.active {
		background-color: var(--first-color);
		color: var(--white-color);
	}
	.qty-val {
		font-weight: var(--font-semi-bold);
		min-width: 24px;
		text-align: center;
	}
	.item-notes {
		width: 100%;
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background-color: var(--body-color);
		border: 1px solid transparent;
		color: var(--title-color);
		font-family: var(--body-font);
		font-size: var(--smaller-font-size);
		transition: border-color 0.3s;
	}
	.item-notes::placeholder {
		color: var(--text-color-light);
	}
	.item-notes:focus {
		border-color: var(--first-color);
		outline: none;
	}
	.remove-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: var(--text-color-light);
		background: none;
		cursor: pointer;
		transition: color 0.3s;
	}
	.remove-btn:hover {
		color: var(--first-color);
	}

	.cart-summary {
		background-color: var(--container-color);
		padding: 1.5rem;
		border-radius: 1.5rem;
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, 0.06);
	}
	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: var(--normal-font-size);
		color: var(--text-color);
		margin-bottom: 0.75rem;
	}
	.summary-total {
		display: flex;
		justify-content: space-between;
		font-family: var(--second-font);
		font-size: var(--h2-font-size);
		color: var(--title-color);
		margin-top: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid hsla(353, 16%, 32%, 0.1);
		margin-bottom: 1.5rem;
	}

	.order-form {
		display: flex;
		flex-direction: column;
		row-gap: 1.25rem;
	}
	.input-group {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}
	.input-label {
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
		color: var(--text-color);
	}
	.text-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background-color: var(--body-color);
		border: 2px solid transparent;
		color: var(--title-color);
		font-family: var(--body-font);
		transition: border-color 0.3s;
	}
	.text-input:focus {
		border-color: var(--first-color);
		outline: none;
	}

	.unpaid-notice {
		display: flex;
		align-items: flex-start;
		column-gap: 0.5rem;
		background-color: hsla(38, 95%, 55%, 0.12);
		color: hsl(38, 85%, 30%);
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
		font-size: var(--small-font-size);
		margin-bottom: 1rem;
	}
	.unpaid-notice i {
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	.unpaid-notice__cta {
		text-align: center;
	}

	.order-error {
		background-color: hsl(0, 85%, 96%);
		color: hsl(0, 70%, 45%);
		border: 1px solid hsl(0, 75%, 88%);
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
		font-size: var(--small-font-size);
		margin-bottom: 1rem;
	}

	.clear-cart-link {
		background: none;
		color: var(--text-color-light);
		font-size: var(--smaller-font-size);
		text-align: center;
		margin-top: 1rem;
		cursor: pointer;
		text-decoration: underline;
		width: 100%;
	}

	.w-full {
		width: 100%;
	}

	@media screen and (max-width: 1150px) {
		.main {
			padding-bottom: 4rem;
		}
	}

	@media screen and (min-width: 768px) {
		.cart-content {
			display: grid;
			grid-template-columns: 1fr 350px;
			gap: 2rem;
			align-items: start;
		}
		.cart-items {
			margin-bottom: 0;
		}
	}
</style>
