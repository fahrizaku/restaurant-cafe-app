<script lang="ts">
	import { page } from '$app/stores';

	let { sidebarToggle = false, onClose }: { sidebarToggle: boolean, onClose?: () => void } = $props();

	const navItems = [
		{ label: 'Dashboard', href: '/admin', icon: 'dashboard' },
		{ label: 'POS Kasir', href: '/admin/pos', icon: 'pos' },
		{ label: 'Orders', href: '/admin/orders', icon: 'orders' },
		{ label: 'Menus', href: '/admin/menus', icon: 'menus' },
		{ label: 'Categories', href: '/admin/categories', icon: 'categories' },
		{ label: 'Tables', href: '/admin/tables', icon: 'tables' }
	];

	function isActive(href: string) {
		if (href === '/admin') return $page.url.pathname === '/admin';
		return $page.url.pathname.startsWith(href);
	}
</script>

<aside
	class="sidebar fixed left-0 top-0 z-[99999] flex h-screen w-[290px] flex-col overflow-y-hidden border-r border-gray-200 bg-white px-5 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 transition-transform duration-300 {sidebarToggle ? 'translate-x-0' : '-translate-x-full'}"
>
	<!-- Header -->
	<div class="flex items-center justify-between gap-2 pt-8 sidebar-header pb-7">
		<a href="/admin" class="flex items-center gap-2">
			<span class="logo text-xl font-bold text-brand-500">
				🍕 RestAdmin
			</span>
		</a>
	</div>

	<div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
		<nav>
			<div>
				<h3 class="mb-4 text-xs uppercase leading-5 text-gray-400">
					<span class="menu-group-title" class:lg:hidden={sidebarToggle}>Menu</span>
				</h3>
				<ul class="flex flex-col gap-1 mb-6">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="menu-item group"
								class:menu-item-active={isActive(item.href)}
								class:menu-item-inactive={!isActive(item.href)}
								onclick={onClose}
							>
								{#if item.icon === 'dashboard'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill=""/>
									</svg>
								{:else if item.icon === 'pos'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V14.5C20.75 15.7426 19.7426 16.75 18.5 16.75H13.75V19.25H16C16.4142 19.25 16.75 19.5858 16.75 20C16.75 20.4142 16.4142 20.75 16 20.75H8C7.58579 20.75 7.25 20.4142 7.25 20C7.25 19.5858 7.58579 19.25 8 19.25H10.25V16.75H5.5C4.25736 16.75 3.25 15.7426 3.25 14.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V14.5C4.75 14.9142 5.08579 15.25 5.5 15.25H18.5C18.9142 15.25 19.25 14.9142 19.25 14.5V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM7 7.75C7 7.33579 7.33579 7 7.75 7H10.25C10.6642 7 11 7.33579 11 7.75V10.25C11 10.6642 10.6642 11 10.25 11H7.75C7.33579 11 7 10.6642 7 10.25V7.75ZM8.5 8.5V9.5H9.5V8.5H8.5ZM12.5 7.75C12.5 7.33579 12.8358 7 13.25 7H16.25C16.6642 7 17 7.33579 17 7.75C17 8.16421 16.6642 8.5 16.25 8.5H13.25C12.8358 8.5 12.5 8.16421 12.5 7.75ZM12.5 10.25C12.5 9.83579 12.8358 9.5 13.25 9.5H16.25C16.6642 9.5 17 9.83579 17 10.25C17 10.6642 16.6642 11 16.25 11H13.25C12.8358 11 12.5 10.6642 12.5 10.25ZM7 13.25C7 12.8358 7.33579 12.5 7.75 12.5H16.25C16.6642 12.5 17 12.8358 17 13.25C17 13.6642 16.6642 14 16.25 14H7.75C7.33579 14 7 13.6642 7 13.25Z" fill=""/>
									</svg>
								{:else if item.icon === 'menus'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.5858 2 11.25 2.33579 11.25 2.75V12C11.25 12.4142 11.5858 12.75 12 12.75H21.25C21.6642 12.75 22 12.4142 22 12C22 6.47715 17.5228 2 12 2ZM12.75 11.25V3.53263C13.2645 3.57761 13.7659 3.66843 14.25 3.80098C15.6929 4.19606 16.9827 4.96184 18.0104 5.98959C19.0382 7.01734 19.8039 8.30707 20.199 9.75C20.3316 10.2341 20.4224 10.7355 20.4674 11.25H12.75ZM2 12C2 7.25083 5.31065 3.27489 9.75 2.25415V3.80099C6.14748 4.78734 3.5 8.0845 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C15.9155 20.5 19.2127 17.8525 20.199 14.25H21.7459C20.7251 18.6894 16.7492 22 12 22C6.47715 22 2 17.5229 2 12Z" fill=""/>
									</svg>
								{:else if item.icon === 'categories'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5001C19.7427 20.75 20.7501 19.7426 20.7501 18.5V5.5C20.7501 4.25736 19.7427 3.25 18.5001 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5001C18.9143 4.75 19.2501 5.08579 19.2501 5.5V18.5C19.2501 18.9142 18.9143 19.25 18.5001 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM6.25005 9.7143C6.25005 9.30008 6.58583 8.9643 7.00005 8.9643L17 8.96429C17.4143 8.96429 17.75 9.30008 17.75 9.71429C17.75 10.1285 17.4143 10.4643 17 10.4643L7.00005 10.4643C6.58583 10.4643 6.25005 10.1285 6.25005 9.7143ZM6.25005 14.2857C6.25005 13.8715 6.58583 13.5357 7.00005 13.5357H17C17.4143 13.5357 17.75 13.8715 17.75 14.2857C17.75 14.6999 17.4143 15.0357 17 15.0357H7.00005C6.58583 15.0357 6.25005 14.6999 6.25005 14.2857Z" fill=""/>
									</svg>
								{:else if item.icon === 'orders'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill=""/>
									</svg>
								{:else if item.icon === 'tables'}
									<svg class="size-6" class:menu-item-icon-active={isActive(item.href)} class:menu-item-icon-inactive={!isActive(item.href)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z" fill=""/>
									</svg>
								{/if}
								<span class="menu-item-text" class:lg:hidden={sidebarToggle}>
									{item.label}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
	</div>
</aside>
