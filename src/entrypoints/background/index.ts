import { getPopup, getPopupThreads, removeFromDicts } from "./popup";
import { comment } from "./messages/interactions/Comment";
import { deleteComment } from "./messages/interactions/Delete";
import { getComments } from "./messages/GetComments";
import { getMoreChildren } from "./messages/GetMoreChildren";
import { getThreads } from "./messages/GetThreads";
import { lemmyLogin } from "./messages/LemmyLogin";
import { onMessage } from "@/utils/messaging";
import { searchYouTube } from "./messages/SearchYouTube";
import { vote } from "./messages/interactions/Vote";

export default defineBackground(() => {
	onMessage("comment", async (r) => {
		return await comment(r.data);
	});
	onMessage("deleteComment", async (r) => {
		return await deleteComment(r.data);
	});
	onMessage("getComments", async (r) => {
		return await getComments(r.data);
	});
	onMessage("getMoreChildren", async (r) => {
		return await getMoreChildren(r.data);
	});
	onMessage("getThreads", async (r) => {
		return await getThreads(r.data);
	});
	onMessage("vote", async (r) => {
		return await vote(r.data);
	});
	onMessage("lemmyLogin", async (r) => {
		return await lemmyLogin(r.data);
	});
	onMessage("searchYouTube", async (r) => {
		return await searchYouTube(r.data);
	});

	browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
		if (changeInfo.status === "complete") {
			getPopup(tabId);
		}
		if (changeInfo.url) {
			browser.tabs.sendMessage(tabId, {
				hasUrlChanged: true,
			});
		}
	});

	browser.tabs.onRemoved.addListener((tabId) => {
		removeFromDicts(tabId);
	});

	browser.runtime.onMessage.addListener((data) => {
		if (data.id === "DICTREQUEST") {
			browser.runtime.sendMessage({
				id: "DICTRESPONSE",
				tab: data.tab,
				dict: getPopupThreads(data.tab),
			});
		}
	});
});
