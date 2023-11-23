<script lang="ts">
	import { SettingsList } from '@/lib/settings';
	import SettingContainer from './SettingContainer.svelte';

	const settings = SettingsList.filter((s) => !SettingsList.find((p) => p.children?.includes(s.name)));
</script>

<main>
	<div>
		<p class="text-lg">Settings</p>
		<div class="my-5">
			<SettingContainer settings="{settings}" />
		</div>
	</div>
</main>
