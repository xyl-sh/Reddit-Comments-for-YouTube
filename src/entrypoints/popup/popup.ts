import "@/assets/css/popup.css";
import Popup from "@/components/popup/Popup.svelte";
import { mount } from "svelte";

mount(Popup, {
	target: document.getElementById("popup")!,
});
