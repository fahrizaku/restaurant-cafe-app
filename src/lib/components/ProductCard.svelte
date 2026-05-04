<script lang="ts">
	import { formatRupiah } from '$lib/utils';

	interface Props {
		name: string;
		price: number;
		image?: string;
		description?: string;
		onAdd?: () => void;
	}

	let { name, price, image, description, onAdd }: Props = $props();
</script>

<article class="products__card">
	<img src={image || '/img/product-1.png'} alt={name} class="products__img" />

	<div class="products__content">
		<div class="products__info">
			<h3 class="products__name">{name}</h3>
			{#if description}
				<p class="products__description">{description}</p>
			{/if}
		</div>
		<div class="products__footer">
			<span class="products__price">{formatRupiah(price)}</span>
			<button class="products__button" aria-label="Add {name} to cart" onclick={() => onAdd?.()}>
				<i class="ri-add-line"></i>
			</button>
		</div>
	</div>
</article>

<style>
	.products__card {
		position: relative;
		background-color: var(--container-color);
		padding: 4rem 0.75rem 1.25rem 0.75rem;
		border-radius: 1.5rem;
		box-shadow: 0 8px 24px hsla(353, 100%, 8%, 0.1);
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.products__content {
		display: flex;
		flex-direction: column;
		flex: 1;
		justify-content: space-between;
		row-gap: 0.75rem;
	}

	.products__img {
		width: 100px;
		position: absolute;
		top: -3rem;
		left: 0;
		right: 0;
		margin: 0 auto;
		filter: var(--shadow-small-img);
		transition: transform 0.4s;
	}

	.products__name {
		font-size: var(--h3-font-size);
		margin-bottom: 0.25rem;
		word-break: break-word;
	}

	.products__description {
		font-size: var(--smaller-font-size);
		color: var(--text-color-light);
		line-height: 1.4;
		margin-bottom: 0.5rem;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
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
		font-size: var(--h2-font-size);
		line-height: 120%;
		color: var(--first-color);
		white-space: nowrap;
	}

	.products__button {
		background-color: var(--first-color);
		color: var(--white-color);
		width: 32px;
		height: 32px;
		border-radius: 0.5rem;
		font-size: 1.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px hsla(353, 100%, 40%, 0.4);
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

	.products__card:hover .products__img {
		transform: translateY(-0.5rem);
	}

	@media screen and (min-width: 1150px) {
		.products__img {
			width: 120px;
		}

		.products__price {
			font-size: var(--h1-font-size);
		}

		.products__button {
			width: 36px;
			height: 36px;
			font-size: 1.5rem;
		}
	}
</style>
