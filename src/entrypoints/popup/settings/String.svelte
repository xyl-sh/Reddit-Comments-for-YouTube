<script lang="ts">
	export let callback: (value: string) => any;
	export let placeholder: string | undefined;
	export let value: string;
	export let label: string;
</script>

<div class="string-container">
	<input type="text" bind:value placeholder={placeholder || ''} /><button
		on:click={() => callback(value)}>{label}</button
	>
</div>

<style lang="postcss">
	.string-container {
		@apply flex gap-2 w-full;

		input {
			@apply min-w-0;
		}
	}
</style>
