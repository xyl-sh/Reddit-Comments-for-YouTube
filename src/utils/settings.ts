import { LemmyCommentSort, RedditCommentSort, ThreadSort } from "./constants";

export enum Settings {
	ENABLEYOUTUBE = "enableYouTube",
	ENABLENEBULA = "enableNebula",
	MATCHTOYOUTUBE = "matchToYouTube",
	COLLAPSEONLOAD = "collapseOnLoad",
	CHILDRENHIDDENDEFAULT = "childrenHiddenDefault",
	INCLUDENSFW = "includeNSFW",
	DEFAULTSORT = "defaultSort",
	DEFAULTSORTLEMMY = "defaultSortLemmy",
	LASTSORT = "lastSort",
	COMMUNITYBLACKLIST = "communityBlacklist",
	LEMMYDOMAIN = "lemmyDomain",
	LEMMYTOKEN = "lemmyToken",
	LEMMYUSERNAME = "lemmyUsername",
	SHOWREDDITRESULTS = "showRedditResults",
	SEARCHALLSITES = "searchAllSites",
}

type SettingName = `${Settings}`;

export type StorageValue = string | number | boolean | object;
export type SettingClass =
	| BooleanSetting
	| OptionSetting<StorageValue>
	| ArraySetting<StorageValue>
	| StringSetting;

export enum SettingType {
	ALL,
	BOOLEAN,
	OPTION,
	ARRAY,
	STRING,
}

function getLabel(name: SettingName) {
	return i18n.t(`settings.${name}`);
}

export function getChildren(setting: SettingClass): SettingClass[] {
	return setting.children.map((s) => getSetting(s, SettingType.ALL));
}

type location = "local" | "sync";

abstract class Setting<T extends StorageValue> {
	name: Settings;
	label: string;
	type?: SettingType;
	displayInList: boolean;
	defaultValue: T;
	children: Settings[];
	storage: location;

	constructor(
		name: Settings,
		defaultValue: T,
		displayInList: boolean,
		children?: Settings[],
		location?: location,
	) {
		this.name = name;
		this.label = getLabel(name);
		this.displayInList = displayInList;
		this.defaultValue = defaultValue;
		this.children = children || [];
		this.storage = location || "sync";
	}

	async getValue(): Promise<T> {
		const storedValue = await storage.getItem<T>(
			`${this.storage}:${this.name}`,
		);

		return storedValue === null ? this.defaultValue : storedValue;
	}

	setValue(value: T | null) {
		storage.setItem(`${this.storage}:${this.name}`, value);
	}
}

export class BooleanSetting extends Setting<boolean> {
	readonly type = SettingType.BOOLEAN;
	constructor(
		name: Settings,
		defaultValue: boolean,
		displayInList: boolean,
		children?: Settings[],
		location?: location,
	) {
		super(name, defaultValue, displayInList, children, location);
	}
}

export class OptionSetting<T extends StorageValue> extends Setting<string> {
	availableValues: T[];

	type = SettingType.OPTION;
	constructor(
		name: Settings,
		defaultValue: string,
		displayInList: boolean,
		availableValues: T[],
		children?: Settings[],
		location?: location,
	) {
		super(name, defaultValue, displayInList, children, location);
		this.availableValues = availableValues;
	}
}

export class ArraySetting<T extends StorageValue> extends Setting<T[]> {
	type = SettingType.ARRAY;
	validator: (value: StorageValue) => ValidatorResponse<T>;

	constructor(
		name: Settings,
		defaultValue: T[],
		displayInList: boolean,
		validator: (value: StorageValue) => ValidatorResponse<T>,
		children?: Settings[],
		location?: location,
	) {
		super(name, defaultValue, displayInList, children, location);
		this.validator = validator;
	}

	async addValue(value: T): Promise<T[] | string> {
		const currentValue = await this.getValue();
		if (currentValue.includes(value)) {
			return i18n.t("duplicateEntry");
		}
		const validate = this.validator(value);
		if (validate.errorMessage) {
			return validate.errorMessage;
		}
		currentValue.push(validate.value);
		this.setValue(currentValue);
		return currentValue;
	}

	async removeValue(value: T): Promise<T[]> {
		const currentValue = await this.getValue();
		const filteredValue = currentValue.filter((v) => v !== value);
		this.setValue(filteredValue);
		return filteredValue;
	}

	resetValue(): T[] {
		this.setValue(this.defaultValue);
		return this.defaultValue;
	}
}

export class StringSetting extends Setting<string> {
	readonly type = SettingType.STRING;
	constructor(
		name: Settings,
		defaultValue: string,
		displayInList: boolean,
		children?: Settings[],
		location?: location,
	) {
		super(name, defaultValue, displayInList, children, location);
	}
}

interface ValidatorResponse<T> {
	value: T;
	errorMessage?: string;
}

export const SettingsList: SettingClass[] = [
	new BooleanSetting(Settings.ENABLEYOUTUBE, true, true),
	new BooleanSetting(Settings.ENABLENEBULA, true, true, [
		Settings.MATCHTOYOUTUBE,
	]),
	new BooleanSetting(Settings.MATCHTOYOUTUBE, true, true),
	new BooleanSetting(Settings.COLLAPSEONLOAD, false, true),
	new BooleanSetting(Settings.CHILDRENHIDDENDEFAULT, false, true),
	new BooleanSetting(Settings.INCLUDENSFW, false, true),
	new BooleanSetting(Settings.SHOWREDDITRESULTS, true, true),
	new BooleanSetting(Settings.SEARCHALLSITES, false, true),

	new OptionSetting(
		Settings.DEFAULTSORT,
		RedditCommentSort.TOP,
		true,
		Object.values(RedditCommentSort),
	),
	new ArraySetting<string>(
		Settings.COMMUNITYBLACKLIST,
		[],
		true,
		(value: StorageValue) => {
			if (typeof value !== "string") {
				return {
					value: "",
					errorMessage: i18n.t("invalidSubreddit"),
				};
			}

			const splitValue = value
				.trim()
				.toLowerCase()
				.split("/")
				.pop()
				?.split("!")
				.pop();
			if (!splitValue) {
				throw new Error("Value invalid, somehow...");
			}
			const valid = /^[\w-@.]{3,}/.test(splitValue);
			if (!valid) {
				return {
					value: value,
					errorMessage: i18n.t("invalidSubreddit"),
				};
			}

			const prefixedValue = splitValue.includes("@")
				? `!${value}`
				: `r/${value}`;
			return { value: prefixedValue };
		},
	),

	new OptionSetting<ThreadSort>(
		Settings.LASTSORT,
		ThreadSort.COMMENTS,
		false,
		Object.values(ThreadSort),
		undefined,
		"local",
	),
	new StringSetting(Settings.LEMMYDOMAIN, "", false, undefined, "local"),
	new StringSetting(Settings.LEMMYTOKEN, "", false, undefined, "local"),
	new StringSetting(Settings.LEMMYUSERNAME, "", false, undefined, "local"),
	new OptionSetting(
		Settings.DEFAULTSORTLEMMY,
		LemmyCommentSort.TOP,
		false,
		Object.values(LemmyCommentSort),
	),
];

export function getSetting(name: Settings, type: SettingType.ALL): SettingClass;
export function getSetting(
	name: Settings,
	type: SettingType.BOOLEAN,
): BooleanSetting;
export function getSetting(
	name: Settings,
	type: SettingType.STRING,
): StringSetting;
export function getSetting<T extends StorageValue>(
	name: Settings,
	type: SettingType.OPTION,
): OptionSetting<T>;
export function getSetting<T extends StorageValue>(
	name: Settings,
	type: SettingType.ARRAY,
): ArraySetting<T>;
export function getSetting(name: Settings): SettingClass {
	const result = SettingsList.find((s) => s.name === name);
	if (!result) {
		throw new Error("Invalid setting, somehow...");
	}
	return result;
}
