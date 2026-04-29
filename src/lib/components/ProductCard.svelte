<script lang="ts">
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

	<h3 class="products__name">{name}</h3>
	<span class="products__price">${price.toFixed(2)}</span>

	<button class="products__button" aria-label="Add {name} to cart" onclick={() => onAdd?.()}>
		<i class="ri-shopping-bag-3-fill"></i>
	</button>
</article>
