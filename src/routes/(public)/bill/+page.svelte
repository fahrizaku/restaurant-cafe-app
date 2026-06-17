<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import PublicFooter from '$lib/components/PublicFooter.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Tagihan — {data.cafeName}</title>
</svelte:head>

<Navbar />

<main class="main has-mobile-nav">
	<section class="section">
		<div class="container">
			<div class="empty-state">
				<div class="empty-state__icon">
					<i class="ri-receipt-line"></i>
				</div>
				<h1 class="section__title">Belum Ada Tagihan</h1>
				<p class="empty-state__description">
					Anda belum memesan apapun. Silakan pilih menu terlebih dahulu — tagihan akan muncul di
					sini setelah pesanan dibuat.
				</p>
				<a href="/menu" class="button">Lihat Menu</a>
			</div>
		</div>
	</section>
</main>

<MobileNav />

<PublicFooter />

<style>
	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
	}

	.empty-state__icon {
		width: 80px;
		height: 80px;
		background-color: var(--first-color-soft);
		color: var(--first-color);
		font-size: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 auto 1.5rem;
	}

	.empty-state__description {
		color: var(--text-color);
		font-size: var(--small-font-size);
		max-width: 380px;
		margin: 0 auto 2rem;
	}

	@media screen and (max-width: 1150px) {
		.main {
			padding-bottom: 4rem;
		}
	}
</style>
