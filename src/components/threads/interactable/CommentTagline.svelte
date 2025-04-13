<script lang="ts">
	import type { Reply } from "@/utils/types/Elements";
	import { getScore } from "@/utils/tools/StringTools";
	import { timestampToRelativeTime } from "@/utils/tools/TimeTools";

	interface CommentTaglineProps {
		collapsed: boolean;
		comment: Reply;
	}

	let { comment = $bindable(), collapsed = $bindable() }: CommentTaglineProps =
		$props();
	const stickiedCommentMessage = i18n.t("tagline.stickiedComment");
	let score = $derived(comment.score + comment.userVote);
	let scoreMessage = $derived(
		comment.scoreHidden
			? i18n.t("tagline.commentScoreHidden")
			: getScore(score, true),
	);
	const editedTimestamp = comment.editedTimestamp
		? i18n.t("tagline.commentEdited", [
				timestampToRelativeTime(comment.editedTimestamp),
			])
		: null;

	const distinguishedColor = () => {
		switch (comment.distinguishedPoster) {
			case "op":
				return "#0055DF";
			case "moderator":
				return "#228822";
			case "admin":
				return "#FF0011";
		}
		return "none";
	};
</script>

<p class:collapsed>
	<button onclick={() => (collapsed = !collapsed)}
		>{collapsed ? "[＋]" : "[－]"}
	</button>
	{#if comment.author === "[deleted]"}
		<span class="deleted"><em>[deleted]</em></span>
	{:else}
		<a
			class="author"
			style="background: {distinguishedColor()}"
			href={comment.authorLink}
			target="_blank"
			class:distinguished={comment.distinguishedPoster}
			>{comment.author}
		</a>
	{/if}
	<span class="score">{scoreMessage} </span>
	{#if comment.controversial}
		<sup class="controversial">†</sup>
	{/if}
	<span>{timestampToRelativeTime(comment.createdTimestamp)} </span>
	{#if comment.editedTimestamp}
		<span title={editedTimestamp}>*</span>
	{/if}
	{#if comment.locked}
		<span>🔒</span>
	{/if}
	{#if comment.stickied}
		<span>{stickiedCommentMessage} </span>
	{/if}
</p>

<style lang="postcss">
	@reference "@/assets/css/threads.css";

	p {
		@apply text-secondary text-[11px];
	}

	a,
	button {
		@apply plain-button;
	}

	button {
		:not(.collapsed) > & {
			@apply text-link;
		}

		.collapsed & {
			@apply text-secondary;
		}
	}

	.deleted {
		@apply mr-[5px];
	}

	.author {
		@apply text-link font-bold mr-[5px];

		&:hover {
			@apply underline;
		}
	}

	.score {
		@apply text-primary;
	}

	.controversial {
		@apply text-[#CC0000];
	}

	.distinguished {
		@apply font-bold text-white p-0.5 rounded-sm;
	}

	.collapsed {
		*:not(button, .distinguished) {
			@apply text-secondary;
		}

		*:not(button) {
			@apply italic;
		}
	}
</style>
