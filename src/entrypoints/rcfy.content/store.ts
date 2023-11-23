import { Site } from '@/lib/types/Site';
import { writable } from 'svelte/store';

export const siteStore = writable<Site>();
export const videoIdStore = writable<string>();
export const youtubeIdStore = writable<string | null>();
