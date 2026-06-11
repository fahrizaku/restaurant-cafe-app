<script lang="ts">
	import { onMount } from 'svelte';
	import { formatRupiah } from '$lib/utils';

	let { data } = $props();
	const session = $derived(data.session);
	const cafeName = $derived(data.cafeName);

	const paymentMethodLabel: Record<string, string> = {
		cash: 'Tunai',
		qris: 'QRIS',
		transfer: 'Transfer Bank'
	};

	// Kumpulkan semua item dari batch yang tidak dibatalkan, gabungkan qty per menu+harga
	type AggItem = { name: string; quantity: number; priceAtTime: number };
	const items = $derived(
		session.batches
			.filter((b) => b.status !== 'cancelled')
			.flatMap((b) => b.items)
			.reduce<AggItem[]>((acc, item) => {
				const existing = acc.find(
					(i) => i.name === (item.menu?.name ?? '') && i.priceAtTime === item.priceAtTime
				);
				if (existing) {
					existing.quantity += item.quantity;
				} else {
					acc.push({
						name: item.menu?.name ?? 'Item',
						quantity: item.quantity,
						priceAtTime: item.priceAtTime
					});
				}
				return acc;
			}, [])
	);

	function formatDateTime(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		window.print();
	});
</script>

<svelte:head>
	<title>Struk #{session.id.slice(0, 8)}</title>
</svelte:head>

<div class="page">
	<div class="receipt">
		<!-- Header -->
		<div class="header">
			<h1 class="cafe-name">{cafeName}</h1>
			<p class="tagline">Terima kasih telah berkunjung</p>
		</div>

		<div class="divider">{'- '.repeat(24)}</div>

		<!-- Info -->
		<div class="info-row">
			<span>No. Struk</span>
			<span class="mono">#{session.id.slice(0, 8).toUpperCase()}</span>
		</div>
		<div class="info-row">
			<span>Meja</span>
			<span>{session.table?.name ?? session.customerName ?? '-'}</span>
		</div>
		<div class="info-row">
			<span>Tanggal</span>
			<span>{formatDateTime(session.openedAt)}</span>
		</div>
		{#if session.paymentMethod}
			<div class="info-row">
				<span>Pembayaran</span>
				<span>{paymentMethodLabel[session.paymentMethod] ?? session.paymentMethod}</span>
			</div>
		{/if}

		<div class="divider">{'- '.repeat(24)}</div>

		<!-- Items -->
		<table class="items">
			<tbody>
				{#each items as item}
					<tr>
						<td class="item-name">{item.name}</td>
						<td class="item-qty">{item.quantity}x</td>
						<td class="item-price">{formatRupiah(item.priceAtTime * item.quantity)}</td>
					</tr>
					<tr class="item-sub">
						<td colspan="3">{item.quantity} × {formatRupiah(item.priceAtTime)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="divider">{'='.repeat(32)}</div>

		<!-- Total -->
		<div class="total-row">
			<span>TOTAL</span>
			<span class="total-amount">{formatRupiah(session.totalPrice)}</span>
		</div>

		<div class="divider">{'='.repeat(32)}</div>

		<p class="footer">Simpan struk ini sebagai bukti pembayaran</p>
		<p class="footer">✦ ✦ ✦</p>
	</div>

	<!-- Tombol hanya tampil di layar, tidak dicetak -->
	<div class="actions no-print">
		<button onclick={() => window.print()}>Cetak Lagi</button>
		<button onclick={() => window.close()}>Tutup</button>
	</div>
</div>

<style>
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		background: #f5f5f5;
		font-family: 'Courier New', Courier, monospace;
	}

	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem;
		min-height: 100vh;
		background: #f5f5f5;
	}

	.receipt {
		width: 100%;
		max-width: 320px;
		background: #fff;
		padding: 1.5rem 1.25rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		font-size: 13px;
		line-height: 1.5;
		color: #111;
	}

	.header {
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.cafe-name {
		font-size: 18px;
		font-weight: bold;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.tagline {
		font-size: 11px;
		color: #555;
		margin-top: 2px;
	}

	.divider {
		color: #999;
		font-size: 11px;
		overflow: hidden;
		white-space: nowrap;
		margin: 0.5rem 0;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 12px;
		margin: 3px 0;
	}

	.info-row span:first-child {
		color: #555;
		white-space: nowrap;
	}

	.info-row span:last-child {
		text-align: right;
	}

	.mono {
		font-family: 'Courier New', Courier, monospace;
	}

	.items {
		width: 100%;
		border-collapse: collapse;
		margin: 0.25rem 0;
	}

	.item-name {
		font-weight: 600;
		padding-top: 6px;
		width: 60%;
	}

	.item-qty {
		text-align: center;
		width: 10%;
		padding-top: 6px;
	}

	.item-price {
		text-align: right;
		width: 30%;
		padding-top: 6px;
		white-space: nowrap;
	}

	.item-sub td {
		font-size: 11px;
		color: #888;
		padding-bottom: 4px;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-weight: bold;
		font-size: 15px;
		margin: 0.25rem 0;
	}

	.total-amount {
		font-size: 16px;
	}

	.footer {
		text-align: center;
		font-size: 11px;
		color: #888;
		margin-top: 6px;
	}

	.actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.75rem;
	}

	.actions button {
		padding: 0.5rem 1.5rem;
		border: 1px solid #ccc;
		background: #fff;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
	}

	.actions button:hover {
		background: #f0f0f0;
	}

	@media print {
		:global(body) {
			background: #fff;
		}

		.page {
			padding: 0;
			background: #fff;
		}

		.receipt {
			box-shadow: none;
			border-radius: 0;
			max-width: 100%;
		}

		.no-print {
			display: none !important;
		}

		@page {
			margin: 8mm;
			size: 80mm auto;
		}
	}
</style>
