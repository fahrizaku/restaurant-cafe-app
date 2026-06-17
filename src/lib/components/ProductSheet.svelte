<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cart } from '$lib/stores/cart.svelte';
	import { formatRupiah } from '$lib/utils';

	interface Menu {
		id: string;
		name: string;
		price: number;
		image: string | null;
		description: string | null;
	}

	interface Props {
		menu: Menu;
		onClose: () => void;
	}

	let { menu, onClose }: Props = $props();

	let qty = $state(1);
	let notes = $state('');

	// Kunci scroll halaman selama sheet terbuka
	$effect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function addToCart() {
		cart.addMany(
			{ menuId: menu.id, name: menu.name, price: menu.price, image: menu.image },
			qty,
			notes
		);
		onClose();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="sheet-backdrop" transition:fade={{ duration: 200 }} onclick={onClose} aria-hidden="true"></div>

<div
	class="sheet"
	role="dialog"
	aria-modal="true"
	aria-label={menu.name}
	transition:fly={{ y: 320, duration: 300 }}
>
	<div class="sheet__handle" aria-hidden="true"></div>
	<button class="sheet__close" onclick={onClose} aria-label="Tutup">
		<i class="ri-close-line"></i>
	</button>

	<div class="sheet__scroll">
		<div class="sheet__media">
			{#if menu.image}
				<img src={menu.image} alt={menu.name} class="sheet__photo" />
			{:else}
				<i class="ri-restaurant-line sheet__placeholder" aria-hidden="true"></i>
			{/if}
		</div>

		<div class="sheet__info">
			<h2 class="sheet__name">{menu.name}</h2>
			<span class="sheet__price">{formatRupiah(menu.price)}</span>
			{#if menu.description}
				<p class="sheet__description">{menu.description}</p>
			{/if}
		</div>

		<input
			type="text"
			class="sheet__notes"
			placeholder="Catatan (opsional): mis. tanpa gula, pedas sedang"
			maxlength="200"
			bind:value={notes}
		/>
	</div>

	<div class="sheet__footer">
		<div class="sheet__stepper">
			<button
				class="sheet__qty-btn"
				onclick={() => (qty = Math.max(1, qty - 1))}
				aria-label="Kurangi jumlah"
			>
				<i class="ri-subtract-line"></i>
			</button>
			<span class="sheet__qty">{qty}</span>
			<button class="sheet__qty-btn sheet__qty-btn--plus" onclick={() => (qty += 1)} aria-label="Tambah jumlah">
				<i class="ri-add-line"></i>
			</button>
		</div>
		<button class="button sheet__add" onclick={addToCart}>
			Tambah · {formatRupiah(menu.price * qty)}
		</button>
	</div>
</div>

<style>
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		background-color: hsla(24, 30%, 8%, 0.45);
		z-index: 1100;
	}

	.sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1101;
		background-color: var(--container-color);
		border-radius: 1.5rem 1.5rem 0 0;
		box-shadow: 0 -8px 32px hsla(24, 30%, 10%, 0.18);
		max-height: 85dvh;
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.sheet__handle {
		width: 2.5rem;
		height: 4px;
		border-radius: 2px;
		background-color: hsl(30, 12%, 85%);
		margin: 0.75rem auto 0;
		flex-shrink: 0;
	}

	.sheet__close {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: hsl(30, 14%, 95%);
		color: var(--title-color);
		font-size: 1.25rem;
		cursor: pointer;
	}

	.sheet__scroll {
		overflow-y: auto;
		padding: 1rem 1.25rem 1.25rem;
	}

	.sheet__media {
		aspect-ratio: 16 / 10;
		border-radius: 1rem;
		overflow: hidden;
		background-color: hsl(30, 14%, 95%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.sheet__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.sheet__placeholder {
		font-size: 3rem;
		color: var(--text-color-light);
		opacity: 0.5;
	}

	.sheet__name {
		font-size: var(--h2-font-size);
		margin-bottom: 0.25rem;
	}

	.sheet__price {
		display: block;
		font-family: var(--second-font);
		font-size: var(--h3-font-size);
		font-weight: 700;
		color: var(--first-color);
		margin-bottom: 0.75rem;
	}

	.sheet__description {
		font-size: var(--small-font-size);
		color: var(--text-color);
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.sheet__notes {
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background-color: hsl(30, 14%, 96%);
		border: 1.5px solid var(--border-color);
		color: var(--title-color);
		font-family: var(--body-font);
		font-size: var(--smaller-font-size);
		transition: border-color 0.3s;
	}

	.sheet__notes::placeholder {
		color: var(--text-color-light);
	}

	.sheet__notes:focus {
		border-color: var(--first-color);
		outline: none;
	}

	.sheet__footer {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1.25rem 1rem;
		border-top: 1px solid var(--border-color);
		flex-shrink: 0;
	}

	.sheet__stepper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sheet__qty-btn {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.75rem;
		background-color: hsl(30, 14%, 95%);
		color: var(--title-color);
		font-size: 1.25rem;
		cursor: pointer;
	}

	.sheet__qty-btn--plus {
		background-color: var(--first-color);
		color: var(--white-color);
	}

	.sheet__qty {
		min-width: 1.5rem;
		text-align: center;
		font-weight: var(--font-semi-bold);
		color: var(--title-color);
	}

	.sheet__add {
		flex: 1;
		padding: 0.875rem 1rem;
		font-size: var(--small-font-size);
	}

	/* Di layar lebar, sheet jadi panel tengah agar tidak membentang penuh */
	@media screen and (min-width: 768px) {
		/* margin auto (bukan transform) agar tidak bentrok dengan transisi fly */
		.sheet {
			width: 480px;
			margin-inline: auto;
		}
	}
</style>
