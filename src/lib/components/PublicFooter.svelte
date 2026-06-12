<script lang="ts">
	import { page } from '$app/state';

	const cafeName = $derived((page.data.cafeName as string | undefined) ?? 'Cafe');
	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer__container container">
		<span class="footer__copy">&#169; {year} {cafeName} — Semua Hak Dilindungi</span>
	</div>
</footer>

<style>
	/* Beri ruang untuk MobileNav yang fixed di bawah */
	@media screen and (max-width: 1150px) {
		.footer {
			padding-bottom: 6rem;
		}
	}
</style>
