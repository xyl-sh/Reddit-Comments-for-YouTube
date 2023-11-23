<script context="module" lang="ts">
	export interface SelectOption {
		id: any;
		title: string;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let options: SelectOption[];
	export let defaultOption: SelectOption | undefined;
	export let fullWidth: boolean = false;
	export let callback: (o: SelectOption) => void;

	let selectedOption: SelectOption;
	let entryWidth: number;
	let buttonWidth: number = 0;
	let isActive = false;

	function setSelectedOption(option: any) {
		selectedOption = option;
		isActive = false;
		if (callback) {
			callback(option);
		}
	}

	function clickOutside(node: HTMLElement) {
		const handleClick = (e: Event) => {
			const target = e.target as HTMLElement;
			if (node && !node.contains(target) && !e.defaultPrevented) {
				isActive = false;
			}
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			},
		};
	}

	setSelectedOption(defaultOption || options[0]);

	onMount(() => {
		buttonWidth = entryWidth - 10;
	});
</script>

<div
	class="container"
	class:fill-available={fullWidth}
	class:fit={!fullWidth}
	use:clickOutside
>
	<button
		class="selector"
		class:active={isActive}
		on:click={() => {
			isActive = !isActive;
		}}
	>
		<span style="width: {buttonWidth}px;">{selectedOption.title}</span>
		<div class="arrow">╲╱</div>
	</button>
	<div
		class="options"
		class:hidden={!isActive}
		class:fill-available={buttonWidth}
		bind:clientWidth={entryWidth}
	>
		{#each options as o (o.id)}
			<button tabindex="-1" on:click={() => setSelectedOption(o)}>
				{o.title}
			</button>
		{/each}
	</div>
</div>

<style lang="postcss">
	.container {
		@apply relative text-standard cursor-pointer [&_*]:text-primary [&_*]:overflow-hidden [&_*]:whitespace-pre [&_*]:text-ellipsis;
	}

	.fit {
		@apply max-w-fit;
	}

	.selector {
		@apply plain-button box-content flex items-center justify-between p-[5px] gap-[5px] rounded-small bg-interactable border-[1px] border-interactable fill-available;
	}

	.selector.active {
		@apply rounded-b-none;
	}

	.arrow {
		@apply flex-shrink-0 text-arrow;
	}

	.options {
		@apply bg-select absolute top-full z-10 border-interactable border-[1px] box-content border-t-0 flex flex-col rounded-b-small max-h-[40vh];
	}

	.options.hidden {
		@apply invisible;
	}

	.options button {
		@apply plain-button bg-option p-[5px] border-t-0 flex-shrink-0 last:border-b-0 hover:bg-hover;
	}

	button {
		font-size: revert;
	}
</style>
