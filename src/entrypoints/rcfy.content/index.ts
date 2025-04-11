import "@/assets/css/threads.css";
import { getSite } from "@/utils/types/Site";
import { setup } from "./rcfy.svelte";

export default defineContentScript({
  matches: ["*://www.youtube.com/*", "*://nebula.tv/*"],
  runAt: "document_start",

  main(ctx: InstanceType<typeof ContentScriptContext>) {
    const site = getSite(window.location.hostname);
    if (!site) {
      return;
    }

    const ui = document.createElement("div");

    site.eventListeners.forEach((e) => {
      document.addEventListener(e, () => setup(site, ui));
    });

    browser.runtime.onMessage.addListener((data) => {
      if (data.hasUrlChanged) {
        setup(site, ui);
      }
    });

    ctx.onInvalidated(() => {
      ui.remove();
    });
  },
});
