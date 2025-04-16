# Reddit Comments for YouTube (+ Nebula) (and everything else, sorta...)

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

This project was written with Node.js v22.14.0, and bun 1.2.9. YMMV with other versions.

The [wxt](https://wxt.dev/) browser extension framework is used to handle building and browser functions.

`bun install --frozen-lockfile`

### Development

`bun run dev` for Chromium
`bun run dev:firefox` for Firefox

### Build

`bun run build` for Chromium
`bun run build:firefox` for Firefox

### Build (Extension Reviewers, Do This)

`bun run zip` for Chromium
`bun run zip:firefox` for Firefox

The built zip will be output to /.output.

## Gallery

![Screenshot of comments (light mode)](https://files.catbox.moe/isyjop.png)  
![Screenshot of thread selector (dark mode)](https://files.catbox.moe/g41iut.png)  
![Screenshot of popup](https://files.catbox.moe/bpdjt6.png)

## License

Reddit Comments for YouTube

Copyright (C) 2025 Xyl

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

```
SPDX-License-Identifier: AGPL-3.0-or-later
```
