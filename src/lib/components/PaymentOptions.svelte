<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatRupiah } from '$lib/utils';

	interface Bank {
		bankName: string;
		bankAccount: string;
		bankHolder: string;
	}

	interface Props {
		paymentStatus: 'unpaid' | 'pending' | 'paid';
		totalPrice: number;
		bank: Bank | null;
		errorMessage?: string | null;
	}

	let { paymentStatus, totalPrice, bank, errorMessage }: Props = $props();

	let selected = $state<'cashier' | 'transfer' | null>(null);
	let submitting = $state(false);
	let copied = $state(false);

	async function copyAccount() {
		if (!bank) return;
		try {
			await navigator.clipboard.writeText(bank.bankAccount.replace(/[^0-9]/g, ''));
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard tidak tersedia — abaikan
		}
	}
</script>

{#if paymentStatus === 'pending'}
	<div class="payment-card payment-card--pending">
		<i class="ri-time-line payment-pending__icon"></i>
		<div>
			<h3 class="payment-card__title">Menunggu Konfirmasi Kasir</h3>
			<p class="payment-card__description">
				Bukti transfer Anda sudah terkirim. Kasir akan memeriksa dan mengonfirmasi pembayaran
				sebesar <strong>{formatRupiah(totalPrice)}</strong>.
			</p>
		</div>
	</div>
{:else if paymentStatus === 'unpaid' && totalPrice > 0}
	<div class="payment-card">
		<h3 class="payment-card__title">
			<i class="ri-wallet-3-line"></i>
			Bayar Sekarang — {formatRupiah(totalPrice)}
		</h3>

		<div class="payment-options">
			<button
				class="payment-option {selected === 'cashier' ? 'active' : ''}"
				onclick={() => (selected = selected === 'cashier' ? null : 'cashier')}
			>
				<i class="ri-cash-line"></i>
				<span>Bayar ke Kasir</span>
			</button>
			{#if bank}
				<button
					class="payment-option {selected === 'transfer' ? 'active' : ''}"
					onclick={() => (selected = selected === 'transfer' ? null : 'transfer')}
				>
					<i class="ri-bank-line"></i>
					<span>Transfer Bank</span>
				</button>
			{/if}
		</div>

		{#if selected === 'cashier'}
			<div class="payment-panel">
				<p class="payment-card__description">
					Silakan menuju kasir dan tunjukkan halaman ini. Anda bisa membayar dengan tunai atau
					QRIS di kasir.
				</p>
			</div>
		{:else if selected === 'transfer' && bank}
			<div class="payment-panel">
				<div class="bank-info">
					<div class="bank-info__row">
						<span class="bank-info__label">Bank</span>
						<span class="bank-info__value">{bank.bankName}</span>
					</div>
					<div class="bank-info__row">
						<span class="bank-info__label">No. Rekening</span>
						<span class="bank-info__value">
							{bank.bankAccount}
							<button class="copy-btn" onclick={copyAccount} aria-label="Salin nomor rekening">
								<i class={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
							</button>
						</span>
					</div>
					{#if bank.bankHolder}
						<div class="bank-info__row">
							<span class="bank-info__label">Atas Nama</span>
							<span class="bank-info__value">{bank.bankHolder}</span>
						</div>
					{/if}
					<div class="bank-info__row">
						<span class="bank-info__label">Jumlah</span>
						<span class="bank-info__value bank-info__value--total">{formatRupiah(totalPrice)}</span>
					</div>
				</div>

				{#if errorMessage}
					<p class="payment-error" role="alert">{errorMessage}</p>
				{/if}

				<form
					method="POST"
					action="?/requestTransfer"
					enctype="multipart/form-data"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
							invalidateAll();
						};
					}}
					class="transfer-form"
				>
					<label class="transfer-form__label" for="proof">
						Upload bukti transfer <span class="required">*</span>
					</label>
					<input
						type="file"
						id="proof"
						name="proof"
						accept="image/jpeg,image/png,image/webp"
						required
						class="transfer-form__file"
					/>
					<button type="submit" disabled={submitting} class="button transfer-form__submit">
						{submitting ? 'Mengirim...' : 'Saya Sudah Transfer'}
					</button>
				</form>
			</div>
		{/if}
	</div>
{/if}

<style>
	.payment-card {
		background-color: var(--container-color);
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: 0 4px 16px hsla(353, 100%, 8%, 0.06);
		margin-bottom: 1.5rem;
	}

	.payment-card--pending {
		display: flex;
		align-items: flex-start;
		column-gap: 1rem;
		border: 2px dashed var(--first-color);
	}

	.payment-pending__icon {
		font-size: 1.75rem;
		color: var(--first-color);
	}

	.payment-card__title {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		font-size: var(--h3-font-size);
		color: var(--title-color);
		margin-bottom: 0.75rem;
	}

	.payment-card__title i {
		color: var(--first-color);
	}

	.payment-card__description {
		font-size: var(--small-font-size);
		color: var(--text-color);
	}

	.payment-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.payment-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 0.35rem;
		padding: 0.85rem 0.5rem;
		background-color: var(--body-color);
		border: 2px solid transparent;
		border-radius: 1rem;
		color: var(--text-color);
		font-size: var(--small-font-size);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: border-color 0.3s, color 0.3s;
	}

	.payment-option i {
		font-size: 1.4rem;
		color: var(--first-color);
	}

	.payment-option.active {
		border-color: var(--first-color);
		color: var(--title-color);
	}

	.payment-panel {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px dashed hsla(353, 16%, 32%, 0.2);
	}

	.bank-info {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.bank-info__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--small-font-size);
	}

	.bank-info__label {
		color: var(--text-color-light);
	}

	.bank-info__value {
		display: inline-flex;
		align-items: center;
		column-gap: 0.35rem;
		color: var(--title-color);
		font-weight: var(--font-semi-bold);
	}

	.bank-info__value--total {
		color: var(--first-color);
	}

	.copy-btn {
		background: none;
		color: var(--first-color);
		cursor: pointer;
		font-size: 1rem;
		display: inline-flex;
	}

	.payment-error {
		background-color: hsl(0, 85%, 96%);
		color: hsl(0, 70%, 45%);
		border: 1px solid hsl(0, 75%, 88%);
		border-radius: 0.75rem;
		padding: 0.6rem 0.9rem;
		font-size: var(--small-font-size);
		margin-bottom: 1rem;
	}

	.transfer-form {
		display: flex;
		flex-direction: column;
		row-gap: 0.75rem;
	}

	.transfer-form__label {
		font-size: var(--smaller-font-size);
		font-weight: var(--font-medium);
		color: var(--text-color);
	}

	.required {
		color: var(--first-color);
	}

	.transfer-form__file {
		font-size: var(--small-font-size);
		color: var(--text-color);
	}

	.transfer-form__file::file-selector-button {
		background-color: var(--body-color);
		color: var(--title-color);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		margin-right: 0.75rem;
		font-size: var(--small-font-size);
		cursor: pointer;
	}

	.transfer-form__submit {
		border: none;
		cursor: pointer;
		font-size: var(--normal-font-size);
	}

	.transfer-form__submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
