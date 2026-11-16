<script lang="ts">
	import { formatRupiah } from '$lib/utils';
	import { cart } from '$lib/stores/cart.svelte';

	interface Props {
		menuId: string;
		name: string;
		price: number;
		image?: string;
		description?: string;
		onAdd?: () => void;
		onOpen?: () => void;
	}

	let { menuId, name, price, image, description, onAdd, onOpen }: Props = $props();

	const cartQty = $derived(cart.items.find((i) => i.menuId === menuId)?.quantity ?? 0);

	function decrement(e: MouseEvent) {
		e.stopPropagation();
		cart.updateQty(menuId, cartQty - 1);
	}

	let particles = $state<{ id: number; x: number; y: number }[]>([]);
	let flyingIcons = $state<
		{ id: number; startX: number; startY: number; destX: number; destY: number }[]
	>([]);

	function handleAdd(e: MouseEvent) {
		// Jangan ikut membuka sheet detail saat quick-add
		e.stopPropagation();
		const id = Date.now();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

		// Partikel "+1" relatif terhadap tombol
		particles.push({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });

		// Icon terbang menuju icon keranjang di mobile nav (jika terlihat)
		const cartIcon = document.querySelector('.mobile-nav .ri-shopping-cart-2-line');
		if (cartIcon) {
			const cartRect = cartIcon.getBoundingClientRect();
			if (cartRect.width > 0) {
				flyingIcons.push({
					id,
					startX: e.clientX,
					startY: e.clientY,
					destX: cartRect.left + cartRect.width / 2,
					destY: cartRect.top + cartRect.height / 2
				});
			}
		}

		setTimeout(() => {
			particles = particles.filter((p) => p.id !== id);
			flyingIcons = flyingIcons.filter((f) => f.id !== id);
		}, 1200);

		onAdd?.();
	}
</script>

<div
	class="products__card"
	class:products__card--clickable={onOpen}
	role="button"
	tabindex={0}
	onclick={onOpen}
	onkeydown={(e) => onOpen && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
>
	<div class="card__media">
		{#if image}
			<img src={image} alt={name} class="card__photo" loading="lazy" />
		{:else}
			<i class="ri-restaurant-line card__placeholder" aria-hidden="true"></i>
		{/if}
	</div>

	<div class="products__content">
		<div class="products__info">
			<h3 class="products__name">{name}</h3>
			{#if description}
				<p class="products__description">{description}</p>
			{/if}
		</div>
		<div class="products__footer">
			<span class="products__price">{formatRupiah(price)}</span>
			{#if cartQty > 0}
				<div class="products__stepper">
					<button class="stepper__btn" aria-label="Kurangi {name}" onclick={decrement}>
						<i class="ri-subtract-line"></i>
					</button>
					<span class="stepper__qty">{cartQty}</span>
					<button class="stepper__btn stepper__btn--plus" aria-label="Tambah {name}" onclick={handleAdd}>
						<i class="ri-add-line"></i>
						{#each particles as particle (particle.id)}
							<span class="plus-one" style="left: {particle.x}px; top: {particle.y}px;">+1</span>
						{/each}
					</button>
				</div>
			{:else}
				<button class="products__button" aria-label="Tambah {name} ke keranjang" onclick={handleAdd}>
					<i class="ri-add-line"></i>
					{#each particles as particle (particle.id)}
						<span class="plus-one" style="left: {particle.x}px; top: {particle.y}px;">+1</span>
					{/each}
				</button>
			{/if}
		</div>
	</div>
</div>

{#each flyingIcons as icon (icon.id)}
	<div class="fly-outer" style="--start-x: {icon.startX}px; --dest-x: {icon.destX}px;">
		<div class="fly-inner" style="--start-y: {icon.startY}px; --dest-y: {icon.destY}px;">
			<i class="ri-shopping-cart-fill"></i>
		</div>
	</div>
{/each}

<style>
	.products__card {
		position: relative;
		background-color: var(--container-color);
		padding: 0.75rem;
		border-radius: 1.125rem;
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		height: 100%;
		transition:
			transform 0.25s,
			box-shadow 0.25s,
			border-color 0.25s;
	}

	.products__card:hover {
		transform: translateY(-0.25rem);
		border-color: transparent;
		box-shadow: var(--shadow-md);
	}

	.products__card--clickable {
		cursor: pointer;
	}

	.products__content {
		display: flex;
		flex-direction: column;
		flex: 1;
		justify-content: space-between;
		row-gap: 0.75rem;
	}

	/* Area foto rasio tetap agar tinggi kartu seragam apa pun bentuk fotonya */
	.card__media {
		aspect-ratio: 1 / 1;
		border-radius: 0.75rem;
		overflow: hidden;
		margin-bottom: 0.875rem;
		background-color: hsl(30, 14%, 95%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s;
	}

	.card__placeholder {
		font-size: 2.5rem;
		color: var(--text-color-light);
		opacity: 0.5;
	}

	.products__name {
		font-size: var(--normal-font-size);
		font-weight: var(--font-semi-bold);
		letter-spacing: -0.01em;
		margin-bottom: 0.25rem;
		word-break: break-word;
		text-align: left;
	}

	.products__description {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		line-height: 1.45;
		margin-bottom: 0.5rem;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-align: left;
	}

	.products__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		column-gap: 0.5rem;
		margin-top: auto;
	}

	.products__price {
		font-family: var(--second-font);
		font-size: var(--normal-font-size);
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.2;
		color: var(--title-color);
		white-space: nowrap;
	}

	/* the public stylesheet already gives position: absolute (pojok kanan bawah kartu);
	   itu sekaligus jadi anchor untuk partikel .plus-one */
	.products__button {
		background-color: var(--first-color);
		color: var(--white-color);
		width: 34px;
		height: 34px;
		border-radius: 0.625rem;
		font-size: 1.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.4s,
			transform 0.2s;
		flex-shrink: 0;
	}

	.products__button:hover {
		background-color: var(--first-color-alt);
	}

	.products__button:active {
		transform: scale(0.9);
	}

	/* Stepper menggantikan tombol + saat item sudah di keranjang */
	.products__stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		background-color: hsl(30, 14%, 95%);
		border-radius: 0.625rem;
		padding: 3px;
		flex-shrink: 0;
	}

	.stepper__btn {
		position: relative; /* anchor partikel +1 */
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		background-color: var(--container-color);
		color: var(--title-color);
		font-size: 1rem;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.stepper__btn:active {
		transform: scale(0.9);
	}

	.stepper__btn--plus {
		background-color: var(--first-color);
		color: var(--white-color);
	}

	.stepper__qty {
		min-width: 1.125rem;
		text-align: center;
		font-size: var(--small-font-size);
		font-weight: var(--font-semi-bold);
		color: var(--title-color);
	}

	.products__card:hover .card__photo {
		transform: scale(1.05);
	}

	/* Partikel "+1" melayang ke atas dari titik klik */
	.plus-one {
		position: absolute;
		color: #f59e0b;
		font-weight: var(--font-semi-bold);
		font-size: var(--small-font-size);
		pointer-events: none;
		animation: floatUp 1s ease-out forwards;
		z-index: 100;
		text-shadow: 0 0 4px rgba(255, 255, 255, 1);
	}

	@keyframes floatUp {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		40% {
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -100px) scale(1.5);
			opacity: 0;
		}
	}

	/* Icon keranjang terbang: sumbu X linear, sumbu Y parabola */
	.fly-outer {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		pointer-events: none;
		animation: flyX 1.2s linear forwards;
	}

	.fly-inner {
		width: 25px;
		height: 25px;
		background-color: var(--first-color);
		color: var(--white-color);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		box-shadow: 0 4px 10px hsla(16, 72%, 50%, 0.4);
		animation: flyY 1.2s cubic-bezier(0.3, 0, 0.7, 1) forwards;
		border: 1px solid rgba(255, 255, 255, 0.5);
	}

	@keyframes flyX {
		0% {
			transform: translateX(var(--start-x));
		}
		100% {
			transform: translateX(var(--dest-x));
		}
	}

	@keyframes flyY {
		0% {
			transform: translateY(var(--start-y)) translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		/* Puncak lemparan: melambat sejenak di udara */
		45% {
			transform: translateY(calc(var(--start-y) - 120px)) translate(-50%, -50%) scale(1.3);
			opacity: 1;
		}
		/* Hampir sampai: masih terlihat utuh dan presisi di tengah */
		90% {
			transform: translateY(calc(var(--dest-y) - 10px)) translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		/* Kontak: masuk ke keranjang */
		100% {
			transform: translateY(var(--dest-y)) translate(-50%, -50%) scale(0.2);
			opacity: 0;
		}
	}

	@media screen and (min-width: 1150px) {
		.products__card {
			padding: 1rem;
		}

		.products__price {
			font-size: var(--h3-font-size);
		}

		.products__button {
			width: 38px;
			height: 38px;
			font-size: 1.5rem;
		}
	}
</style>
