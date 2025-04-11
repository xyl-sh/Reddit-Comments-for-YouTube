<script lang="ts">
	import { type CommentSort, Kind, Website } from "@/utils/constants";
	import type { MoreReplies, Replies, Thread } from "@/utils/types/Elements";
	import type { GetMoreChildrenRequest } from "@/utils/types/NetworkRequests";
	import { sendMessage } from "@/utils/messaging";

	interface MoreChildrenProps {
		comments: Replies;
		moreChildren: MoreReplies;
		sort: CommentSort | undefined;
		thread: Thread;
	}

	let {
		thread = $bindable(),
		moreChildren,
		comments = $bindable(),
		sort = $bindable(),
	}: MoreChildrenProps = $props();

	let loading: boolean = $state(false);
	let continueThread: boolean = moreChildren.id === "_";
	let permalink = `${thread.link}${moreChildren.parent.split("_")[1]}`;

	const loadMoreMessage = i18n.t("loadMoreComments");
	const loadingMessage = i18n.t("loadingMoreComments");
	const continueMessage = i18n.t("continueThread");
	let loadMoreCountMessage = $derived(
		i18n.t("moreCount", [moreChildren.count.toString()]),
	);

	async function getMoreChildren() {
		if (loading || sort === undefined) {
			return;
		}

		loading = true;

		const getMoreChildrenRequest: GetMoreChildrenRequest = {
			moreChildren: moreChildren,
			sort: sort,
			page: thread.page + 1,
		};

		const response = await sendMessage(
			"getMoreChildren",
			getMoreChildrenRequest,
		);

		if (!response.success) {
			return;
		}

		const data = response.value;

		if (moreChildren.website === Website.REDDIT) {
			comments = [...comments.filter((c) => c.kind === Kind.COMMENT), ...data];
		} else {
			if (moreChildren.parent === moreChildren.threadId) {
				thread.replies = [
					...thread.replies.filter((c) => c.kind === Kind.COMMENT),
					...data.filter(
						(c) => !thread.replies.find((p) => p.fullId === c.fullId),
					),
				];
				thread.page++;
			} else {
				comments = data;
			}
		}

		loading = false;
	}
</script>

{#if continueThread}
	<a class="continue" target="_blank" href={permalink}>{continueMessage} </a>
{:else}
	<button onclick={getMoreChildren} class="load-more" class:loading>
		<span class="label">{loading ? loadingMessage : loadMoreMessage} </span>
		{#if !loading}
			<span>{loadMoreCountMessage} </span>
		{/if}
	</button>
{/if}

<style lang="postcss">
	@reference "@/assets/css/threads.css";

	.load-more {
		@apply plain-button text-subtle px-[4px] ml-[3px] inline-block text-[10px] overflow-hidden;

		&:hover:not(.loading) {
			@apply underline;
		}

		&.loading {
			@apply text-[#CC0000] cursor-default;
		}
	}

	.continue {
		@apply plain-button text-[12px] overflow-hidden px-[4px] ml-[3px] text-link hover:underline;
	}

	.label {
		@apply font-bold;
	}
</style>
