"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const package_json_1 = __importDefault(require("../../package.json"));
const cache_1 = require("./cache");
exports.properties = Object.freeze(package_json_1.default.contributes.configuration[0].properties);
exports.applicationName = package_json_1.default.displayName;
exports.applicationKey = package_json_1.default.name;
class Entry {
    constructor(key, validator) {
        this.key = key;
        this.validator = validator;
        this.regulate = (rawKey, value) => {
            let result = value;
            if (this.validator && !this.validator(result)) {
                // settings.json をテキストとして直接編集してる時はともかく GUI での編集時に無駄にエラー表示が行われてしまうので、エンドユーザーに対するエラー表示は行わない。
                //vscode.window.showErrorMessage(`${rawKey} setting value is invalid! Please check your settings.`);
                console.error(`"${rawKey}" setting value(${JSON.stringify(value)}) is invalid! Please check your settings.`);
                result = this.defaultValue;
            }
            else {
                if (undefined !== this.minValue && result < this.minValue) {
                    result = this.minValue;
                }
                else if (undefined !== this.maxValue && this.maxValue < result) {
                    result = this.maxValue;
                }
            }
            return result;
        };
        this.cache = new cache_1.Cache((languageId) => {
            let result;
            if (undefined === languageId || null === languageId || 0 === languageId.length) {
                const name = this.key.replace(/[^.]+\./, "");
                result = vscode.workspace.getConfiguration(exports.applicationKey)[name];
                if (undefined === result) {
                    result = this.defaultValue;
                }
                else {
                    result = this.regulate(this.key, result);
                }
            }
            else {
                const langSection = vscode.workspace.getConfiguration(`[${languageId}]`, null);
                result = langSection[this.key];
                if (undefined === result) {
                    result = this.get("");
                }
                else {
                    result = this.regulate(`[${languageId}].${this.key}`, result);
                }
            }
            return result;
        });
        this.get = this.cache.get;
        this.getCache = this.cache.getCache;
        this.clear = this.cache.clear;
        this.defaultValue = exports.properties[key].default;
        this.minValue = exports.properties[key].minimum;
        this.maxValue = exports.properties[key].maximum;
    }
}
exports.Entry = Entry;
class MapEntry {
    constructor(key, mapObject) {
        this.key = key;
        this.mapObject = mapObject;
        this.config = new Entry(this.key, exports.makeEnumValidator(this.mapObject));
        this.get = (languageId) => this.mapObject[this.config.cache.get(languageId)];
        this.getCache = (languageId) => this.mapObject[this.config.cache.getCache(languageId)];
        this.clear = this.config.cache.clear;
    }
}
exports.MapEntry = MapEntry;
exports.makeEnumValidator = (mapObject) => (value) => 0 <= Object.keys(mapObject).indexOf(value.toString());
exports.stringArrayValidator = (value) => "[object Array]" === Object.prototype.toString.call(value) && value.map(i => "string" === typeof i).reduce((a, b) => a && b, true);
//# sourceMappingURL=config.js.map