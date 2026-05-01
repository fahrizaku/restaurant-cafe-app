<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let isMenuOpen = $state(false);
	let isShadowHeader = $state(false);

	const tableId = $derived(page.url.searchParams.get('table'));

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	onMount(() => {
		const handleScroll = () => {
			isShadowHeader = window.scrollY >= 50;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header class="header" id="header" class:shadow-header={isShadowHeader}>
	<nav class="nav container">
		<a href="/" class="nav__logo">
			<img src="/img/logo-pizza.svg" alt="logo" />
			Pizza
		</a>

		<div class="nav__menu" id="nav-menu" class:show-menu={isMenuOpen}>
			<ul class="nav__list">
				<li>
					<a href="/#home" class="nav__link active-link" onclick={closeMenu}>Home</a>
				</li>
				<li>
					<a href="/#about" class="nav__link" onclick={closeMenu}>About Us</a>
				</li>
				<li>
					<a href="/#popular" class="nav__link" onclick={closeMenu}>Popular</a>
				</li>
				<li>
					<a href="/menu{tableId ? '?table=' + tableId : ''}" class="nav__link" onclick={closeMenu}>Menu</a>
				</li>
				<li>
					<a href="/#contact" class="nav__link" onclick={closeMenu}>Contact</a>
				</li>
			</ul>

			<!-- Close button -->
			<div class="nav__close" id="nav-close" onclick={toggleMenu} aria-hidden="true">
				<i class="ri-close-large-line"></i>
			</div>
		</div>

		<div class="nav__buttons">
			<!-- Toggle button -->
			<div class="nav__toggle" id="nav-toggle" onclick={toggleMenu} aria-hidden="true">
				<i class="ri-apps-2-fill"></i>
			</div>
		</div>
	</nav>
</header>

<style>
	.nav__buttons {
		display: flex;
		align-items: center;
		column-gap: 1rem;
	}
</style>
