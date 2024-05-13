import { marked } from 'marked';
import { buildLemmyUrl } from './RequestTools';
import { REDDIT_LINK_DOMAIN } from '../constants';
import { parseTimestamp } from './TimeTools';
import { Media } from '../types/Elements';

export const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
	const html = linkRenderer.call(renderer, href, title, text);
	return html.replace(/^<a /, '<a target="_blank" ');
};

function commentParser(content: string) {
	content = content.replaceAll(/\] \(http/g, '](http');

	content = content.replaceAll(
		/(?<=\s|^|;)([0-5]?\d(?::[0-5]?\d){1,2})(?=\s|$|&|\.)/g,
		(m) => {
			try {
				const timestamp = parseTimestamp(m);
				return `<button onclick='document.dispatchEvent(new CustomEvent("timestampClicked", {detail: { time: ${timestamp}}}))'>[${m}]</button>`;
			} catch {
				console.error('commentParser', `Parsing timestamp ${m} failed.`);
				return '';
			}
		}
	);

	content = content.replaceAll(
		/(?<=\s|^|;)([0-5]?\d(?::[0-5]?\d){1,2})(?=\s|$|&|\.)/g,
		(m) => {
			try {
				const timestamp = parseTimestamp(m);
				return `<button onclick='document.dispatchEvent(new CustomEvent("timestampClicked", {detail: { time: ${timestamp}}}))'>[${m}]</button>`;
			} catch {
				console.error('commentParser', `Parsing timestamp ${m} failed.`);
				return '';
			}
		}
	);

	return content;
}

export async function redditCommentParser(content: string, media: Media) {
	content = commentParser(content);
	content = content.replaceAll(/\]\(\//g, `](${REDDIT_LINK_DOMAIN}/`);
	content = content.replaceAll(
		/(?<=^|\s)(\/?r\/(\w*))/g,
		`[$1](${REDDIT_LINK_DOMAIN}/r/$2)`
	);
	content = content.replaceAll(
		/(?<=^|\s)(\/?u\/([\w-]*))/g,
		`[$1](${REDDIT_LINK_DOMAIN}/user/$2)`
	);
	content = content.replaceAll(
		/>!(.*?)!</g,
		`<button class='reddit-spoiler' onclick='this.classList.toggle("reddit-spoiler")'>$1</button>`
	);

	content = content.replaceAll(/\^{3,}/g, '^^^');
	while (content.match(/\^((?:\(.*?\))|(?:\S*))/)) {
		content = content.replaceAll(/\^((?:\(.*?\))|(?:\S*))/g, '<sup>$1</sup>');
	}

	while (content.match(/(<sup>)\((.*?)\)(<\/sup>)/)) {
		content = content.replaceAll(/(<sup>)\((.*?)\)(<\/sup>)/g, '$1$2$3');
	}

	for (const [k, v] of Object.entries(media || {})) {
		const image = v.e === 'Image';
		const src = (image ? v.s.u : v.s.gif) || '';
		let width = v.s.x;
		let height = v.s.y;

		if (width > 240 || height > 240) {
			if (width > height) {
				let ratio = width / 240;
				width = 240;
				height = height / ratio;
			} else if (height > width) {
				let ratio = height / 240;
				height = 240;
				width = width / ratio;
			} else {
				width = 240;
				height = 240;
			}
		}

		const img = ` <img src='${src}' width='${width}' height='${height}'> `;
		const regex = k.includes('|')
			? new RegExp(String.raw`!\[.*?\]\(${k.replaceAll('|', String.raw`\|`)}\)`, 'g')
			: new RegExp(String.raw`${src}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

		content = content.replaceAll(regex, img);
	}

	return await marked(content, { renderer });
}

export async function lemmyCommentParser(content: string) {
	content = commentParser(content);
	content = content.replaceAll(
		/(?<=^|\s)!(\w*?@[\w.]*)/g,
		`[!$1](${await buildLemmyUrl('c/$1')})`
	);
	content = content.replaceAll(
		/(?<=^|\s)@([\w-]*?@[\w.]*)/g,
		`[@$1](${await buildLemmyUrl('u/$1')})`
	);

	return await marked(content, { renderer });
}
