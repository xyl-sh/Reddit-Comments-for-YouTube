# Reddit Comments for YouTube (+ Nebula) (and everything else, sorta...)


[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/eeoojlakofhogpkplghnmcljbcjdobbo)](https://chrome.google.com/webstore/detail/reddit-comments-for-youtu/eeoojlakofhogpkplghnmcljbcjdobbo) [![Mozilla Add-on](https://img.shields.io/amo/v/reddit-comments-for-youtube)](https://addons.mozilla.org/en-US/firefox/addon/reddit-comments-for-youtube/)

An extension to display Reddit (and Lemmy) threads for YouTube and Nebula videos. It also technically supports viewing comments for any page, however this is considered an out-of-scope bonus, so dev priority is not given to it.

This is loosely based on [Lucien Maloney's extension](https://github.com/lucienmaloney/reddit_comments_for_youtube_extension) (it was once a fork, but has since been totally rewritten twice).

Supports:

- Displaying threads
- Blacklisting communities
- Voting
- Commenting

Interactive elements will be stripped if:

- The extension cannot access Reddit cookies
- The user is logged out
- The user is suspended
- The thread is archived
- The thread or comment chain is locked

## How to Build

This project was written with Node.js v21.2.0, and pnpm 8.11.0. YMMV with other versions.

The [wxt](https://wxt.dev/) browser extension framework is used to handle building and browser functions.

`pnpm install`

### Development

`pnpm dev` for Chromium/MV3  
`pnpm dev:firefox` for Firefox/MV2 (dev server crashes on reload)

### Build

`pnpm build` for Chromium/MV3  
`pnpm build:firefox` for Firefox/MV2

### Build (Extension Reviewers, Do This)

`pnpm zip` for Chromium/MV3  
`pnpm zip:firefox` for Firefox/MV2

The built zip will be output to /.output.

## Gallery

![Screenshot of comments (light mode)](https://files.catbox.moe/isyjop.png)  
![Screenshot of thread selector (dark mode)](https://files.catbox.moe/g41iut.png)  
![Screenshot of popup](https://files.catbox.moe/nnbet3.png)