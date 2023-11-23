import { CommentSort } from './constants';
import { StorageValue } from 'wxt/storage';

export enum Settings {
	ENABLEYOUTUBE = 'enableYouTube',
	ENABLENEBULA = 'enableNebula',
	MATCHTOYOUTUBE = 'matchToYouTube',
	COLLAPSEONLOAD = 'collapseOnLoad',
	CHILDRENHIDDENDEFAULT = 'childrenHiddenDefault',
	INCLUDENSFW = 'includeNSFW',
	DEFAULTSORT = 'defaultSort',
	SUBBLACKLIST = 'subBlacklist',
}

function getLabel(name: Settings) {
	return browser.i18n.getMessage(name as any);
}
export type SettingClass =
	| BooleanSetting
	| OptionSetting<StorageValue>
	| ArraySetting<StorageValue>;

export enum SettingType {
	ALL,
	BOOLEAN,
	OPTION,
	ARRAY,
}

export function getChildren(setting: SettingClass): SettingClass[] {
	return setting.children.map((s) => getSetting(s, SettingType.ALL));
}

abstract class Setting<T extends StorageValue> {
	name: Settings;
	label: string;
	type?: SettingType;
	defaultValue: T;
	children: Settings[];

	constructor(name: Settings, defaultValue: T, children?: Settings[]) {
		this.name = name;
		this.label = getLabel(name);
		this.defaultValue = defaultValue;
		this.children = children || [];
	}

	async getValue(): Promise<T> {
		const storedValue = await storage.getItem<T>(`sync:${this.name}`);

		return storedValue === null ? this.defaultValue : storedValue;
	}

	setValue<T extends StorageValue>(value: T) {
		storage.setItem<StorageValue>(`sync:${this.name}`, value);
	}
}

export class BooleanSetting extends Setting<boolean> {
	readonly type = SettingType.BOOLEAN;
	constructor(name: Settings, defaultValue: boolean, children?: Settings[]) {
		super(name, defaultValue, children);
	}
}

export class OptionSetting<T> extends Setting<string> {
	availableValues: T[];

	type = SettingType.OPTION;
	constructor(
		name: Settings,
		defaultValue: string,
		availableValues: T[],
		children?: Settings[]
	) {
		super(name, defaultValue, children);
		this.availableValues = availableValues;
	}
}

export class ArraySetting<T> extends Setting<T[]> {
	type = SettingType.ARRAY;
	validator: (value: any) => ValidatorResponse;

	constructor(
		name: Settings,
		defaultValue: T[],
		validator: (value: any) => ValidatorResponse,
		children?: Settings[]
	) {
		super(name, defaultValue, children);
		this.validator = validator;
	}

	async addValue(value: T): Promise<T[] | string> {
		const currentValue = await this.getValue();
		if (currentValue.includes(value)) {
			return browser.i18n.getMessage('duplicateEntry');
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

interface ValidatorResponse {
	value: any;
	errorMessage?: string;
}

export const SettingsList: SettingClass[] = [
	new BooleanSetting(Settings.ENABLEYOUTUBE, true),
	new BooleanSetting(Settings.ENABLENEBULA, true, [Settings.MATCHTOYOUTUBE]),
	new BooleanSetting(Settings.MATCHTOYOUTUBE, true),
	new BooleanSetting(Settings.COLLAPSEONLOAD, false),
	new BooleanSetting(Settings.CHILDRENHIDDENDEFAULT, false),
	new BooleanSetting(Settings.INCLUDENSFW, false),
	new OptionSetting(
		Settings.DEFAULTSORT,
		CommentSort.TOP,
		Object.values(CommentSort)
	),
	new ArraySetting<string>(Settings.SUBBLACKLIST, [], (value: string) => {
		const splitValue = value.toLowerCase().split('/').pop();
		if (!splitValue) {
			throw new Error('Value invalid, somehow...');
		}
		const valid = /^[a-zA-Z0-9_]{3,}/.test(splitValue);
		if (!valid) {
			return <ValidatorResponse>{
				value: value,
				errorMessage: browser.i18n.getMessage('invalidSubreddit'),
			};
		}
		return { value: splitValue };
	}),
];

export function getSetting(name: Settings, type: SettingType.ALL): SettingClass;
export function getSetting(
	name: Settings,
	type: SettingType.BOOLEAN
): BooleanSetting;
export function getSetting<T>(
	name: Settings,
	type: SettingType.OPTION
): OptionSetting<T>;
export function getSetting<T>(
	name: Settings,
	type: SettingType.ARRAY
): ArraySetting<T>;
export function getSetting(name: Settings): SettingClass {
	const result = SettingsList.find((s) => s.name === name);
	if (!result) {
		throw new Error('Invalid setting, somehow...');
	}
	return result;
}
