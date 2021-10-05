"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
/*
import localeEn from "../package.nls.json";
import localeJa from "../package.nls.ja.json";

interface LocaleEntry
{
    [key : string] : string;
}
const localeTableKey = <string>JSON.parse(<string>process.env.VSCODE_NLS_CONFIG).locale;
const localeTable = Object.assign(localeEn, ((<{[key : string] : LocaleEntry}>{
    ja : localeJa
})[localeTableKey] || { }));
const localeString = (key : string) : string => localeTable[key] || key;
*/
const localeString = (key) => key;
const getTicks = () => new Date().getTime();
const roundCenti = (value) => Math.round(value * 100) / 100;
const percentToDisplayString = (value, locales) => `${roundCenti(value).toLocaleString(locales, { style: "percent" })}`;
var Profiler;
(function (Profiler) {
    let profileScore = {};
    let entryStack = [];
    let isProfiling = false;
    let startAt = 0;
    let endAt = 0;
    class ProfileEntry {
        constructor(name) {
            this.name = name;
            this.childrenTicks = 0;
            if (isProfiling) {
                this.startTicks = getTicks();
                entryStack.push(this);
                //console.log(`${"*".repeat(entryStack.length)} ${this.name} begin`);
            }
            else {
                this.startTicks = 0;
            }
        }
        end() {
            if (0 !== this.startTicks) {
                //console.log(`${"*".repeat(entryStack.length)} ${this.name} end`);
                const wholeTicks = getTicks() - this.startTicks;
                if (undefined === profileScore[this.name]) {
                    profileScore[this.name] = 0;
                }
                profileScore[this.name] += wholeTicks - this.childrenTicks;
                entryStack.pop();
                if (0 < entryStack.length) {
                    entryStack[entryStack.length - 1].childrenTicks += wholeTicks;
                }
            }
        }
    }
    Profiler.ProfileEntry = ProfileEntry;
    Profiler.profile = (name, target) => {
        const entry = new ProfileEntry(name);
        try {
            return target();
        }
        catch (error) // 現状(VS Code v1.32.3)、こうしておかないとデバッグコンソールに例外情報が出力されない為の処置。
         {
            console.error(`Exception at: ${name}`);
            console.error(error);
            throw error; // ※この再送出により外側のこの関数で再び catch し重複してエラーが出力されることに注意。
        }
        finally {
            entry.end();
        }
    };
    Profiler.getIsProfiling = () => isProfiling;
    Profiler.start = () => {
        isProfiling = true;
        profileScore = {};
        entryStack = [];
        startAt = getTicks();
    };
    Profiler.stop = () => {
        isProfiling = false;
        endAt = getTicks();
    };
    Profiler.getOverall = () => (isProfiling ? getTicks() : endAt) - startAt;
    Profiler.getReport = () => Object.keys(profileScore)
        .map(name => ({
        name,
        ticks: profileScore[name]
    }))
        .sort((a, b) => b.ticks - a.ticks);
})(Profiler = exports.Profiler || (exports.Profiler = {}));
var Clairvoyant;
(function (Clairvoyant) {
    const applicationKey = "clairvoyant";
    class Cache {
        constructor(loader) {
            this.loader = loader;
            this.cache = {};
            this.get = (key) => this.getCore(key, JSON.stringify(key));
            this.getCore = (key, keyJson) => undefined === this.cache[keyJson] ?
                (this.cache[keyJson] = this.loader(key)) :
                this.cache[keyJson];
            this.clear = () => this.cache = {};
        }
    }
    class Config {
        constructor(name, defaultValue, validator, minValue, maxValue) {
            this.name = name;
            this.defaultValue = defaultValue;
            this.validator = validator;
            this.minValue = minValue;
            this.maxValue = maxValue;
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
            this.cache = new Cache((lang) => {
                let result;
                if (undefined === lang || null === lang || 0 === lang.length) {
                    result = vscode.workspace.getConfiguration(applicationKey)[this.name];
                    if (undefined === result) {
                        result = this.defaultValue;
                    }
                    else {
                        result = this.regulate(`${applicationKey}.${this.name}`, result);
                    }
                }
                else {
                    const langSection = vscode.workspace.getConfiguration(`[${lang}]`, null);
                    result = langSection[`${applicationKey}.${this.name}`];
                    if (undefined === result) {
                        result = this.get("");
                    }
                    else {
                        result = this.regulate(`[${lang}].${applicationKey}.${this.name}`, result);
                    }
                }
                return result;
            });
            this.get = this.cache.get;
            this.clear = this.cache.clear;
        }
    }
    class ConfigMap {
        constructor(name, defaultValue, mapObject) {
            this.name = name;
            this.defaultValue = defaultValue;
            this.mapObject = mapObject;
            this.config = new Config(this.name, this.defaultValue, makeEnumValidator(this.mapObject));
            this.get = (key) => this.mapObject[this.config.cache.get(key)];
            this.clear = this.config.cache.clear;
        }
    }
    const makeEnumValidator = (mapObject) => (value) => 0 <= Object.keys(mapObject).indexOf(value.toString());
    const autoScanModeObject = Object.freeze({
        "none": {
            onInit: () => { },
            enabled: false,
        },
        "current document": {
            onInit: () => { },
            enabled: true,
        },
        "open documents": {
            onInit: () => scanOpenDocuments(),
            enabled: true,
        },
        "folder": {
            onInit: () => scanFolder(),
            enabled: true,
        },
    });
    const enabledProfile = new Config("enabledProfile", true);
    const autoScanMode = new ConfigMap("autoScanMode", "folder", autoScanModeObject);
    const outputChannel = vscode.window.createOutputChannel("Clairvoyant");
    Clairvoyant.initialize = (context) => {
        context.subscriptions.push(
        //  コマンドの登録
        vscode.commands.registerCommand(`${applicationKey}.scanDocument`, scanDocument), vscode.commands.registerCommand(`${applicationKey}.scanOpenDocuments`, scanOpenDocuments), vscode.commands.registerCommand(`${applicationKey}.scanFolder`, scanFolder), vscode.commands.registerCommand(`${applicationKey}.sight`, sight), vscode.commands.registerCommand(`${applicationKey}.reload`, reload), vscode.commands.registerCommand(`${applicationKey}.startProfile`, () => {
            outputChannel.show();
            if (Profiler.getIsProfiling()) {
                outputChannel.appendLine(localeString("🚫 You have already started the profile."));
            }
            else {
                outputChannel.appendLine(`${localeString("⏱ Start Profile!")} - ${new Date()}`);
                Profiler.start();
            }
        }), vscode.commands.registerCommand(`${applicationKey}.stopProfile`, () => {
            outputChannel.show();
            if (Profiler.getIsProfiling()) {
                Profiler.stop();
                outputChannel.appendLine(`${localeString("🏁 Stop Profile!")} - ${new Date()}`);
                outputChannel.appendLine(localeString("📊 Profile Report"));
                const total = Profiler.getReport().map(i => i.ticks).reduce((p, c) => p + c);
                outputChannel.appendLine(`- Total: ${total.toLocaleString()}ms ( ${percentToDisplayString(1)} )`);
                Profiler.getReport().forEach(i => outputChannel.appendLine(`- ${i.name}: ${i.ticks.toLocaleString()}ms ( ${percentToDisplayString(i.ticks / total)} )`));
            }
            else {
                outputChannel.appendLine(localeString("🚫 Profile has not been started."));
            }
        }), vscode.commands.registerCommand(`${applicationKey}.reportProfile`, () => {
            outputChannel.show();
            if (Profiler.getIsProfiling()) {
                outputChannel.appendLine(`${localeString("📊 Profile Report")} - ${new Date()}`);
                const overall = Profiler.getOverall();
                const total = Profiler.getReport().map(i => i.ticks).reduce((p, c) => p + c);
                outputChannel.appendLine(localeString("⚖ Overview"));
                outputChannel.appendLine(`- Overall: ${overall.toLocaleString()}ms ( ${percentToDisplayString(1)} )`);
                outputChannel.appendLine(`- Busy: ${total.toLocaleString()}ms ( ${percentToDisplayString(total / overall)} )`);
                outputChannel.appendLine(localeString("🔬 Busy Details"));
                outputChannel.appendLine(`- Total: ${total.toLocaleString()}ms ( ${percentToDisplayString(1)} )`);
                Profiler.getReport().forEach(i => outputChannel.appendLine(`- ${i.name}: ${i.ticks.toLocaleString()}ms ( ${percentToDisplayString(i.ticks / total)} )`));
                outputChannel.appendLine("");
            }
            else {
                outputChannel.appendLine(localeString("🚫 Profile has not been started."));
            }
        }), 
        //  イベントリスナーの登録
        vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration), vscode.workspace.onDidChangeWorkspaceFolders(() => scanFolder()), vscode.workspace.onDidChangeTextDocument(event => scanDocument(event.document)), vscode.window.onDidChangeActiveTextEditor(textEditor => textEditor && scanDocument(textEditor.document)));
        reload();
    };
    const documentTokenEntryMap = new Map();
    const tokenDocumentEntryMap = new Map();
    const makeSureTokenDocumentEntryMap = () => Profiler.profile("makeSureTokenDocumentEntryMap", () => {
        if (tokenDocumentEntryMap.size <= 0) {
            Array.from(documentTokenEntryMap.values())
                .map(i => Array.from(i.keys()))
                .reduce((a, b) => a.concat(b).filter((i, index, a) => index === a.indexOf(i)))
                .forEach(token => {
                tokenDocumentEntryMap.set(token, new Map(Array.from(documentTokenEntryMap.entries())
                    .map(i => ({
                    textDocument: i[0],
                    entries: i[1].get(token)
                }))
                    .filter(i => undefined !== i.entries)
                    .map(i => [i.textDocument, i.entries])));
            });
        }
        return tokenDocumentEntryMap;
    });
    const showToken = (document, entry) => __awaiter(this, void 0, void 0, function* () {
        const textEditor = yield vscode.window.showTextDocument(document);
        textEditor.selection = entry.selection;
    });
    const copyToken = (text) => __awaiter(this, void 0, void 0, function* () { return yield vscode.env.clipboard.writeText(text); });
    const pasteToken = (text) => __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (textEditor) {
            yield textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, text));
        }
    });
    const reload = () => {
        documentTokenEntryMap.clear();
        tokenDocumentEntryMap.clear();
        onDidChangeConfiguration();
    };
    const onDidChangeConfiguration = () => {
        [
            enabledProfile,
            autoScanMode,
        ]
            .forEach(i => i.clear());
        startOrStopProfile();
        autoScanMode.get("").onInit();
    };
    const startOrStopProfile = () => {
        if (Profiler.getIsProfiling() !== enabledProfile.get("")) {
            if (enabledProfile.get("")) {
                Profiler.start();
            }
            else {
                Profiler.stop();
            }
        }
    };
    Clairvoyant.regExpExecToArray = (regexp, text) => Profiler.profile(`regExpExecToArray(/${regexp.source}/${regexp.flags})`, () => {
        const result = [];
        while (true) {
            const match = regexp.exec(text);
            if (null === match) {
                break;
            }
            result.push(match);
        }
        return result;
    });
    const makePreview = (document, index, _token) => Profiler.profile("makePreview", () => {
        const anchor = document.positionAt(index);
        const line = document.getText(new vscode.Range(anchor.line, 0, anchor.line + 1, 0));
        return line.trim().replace(/\s+/gm, " ");
    });
    const makeSelection = (document, index, token) => Profiler.profile("makeSelection", () => new vscode.Selection(document.positionAt(index), document.positionAt(index + token.length)));
    const scanDocument = (document) => Profiler.profile("scanDocument", () => {
        //if (autoScanMode.get(document.languageId).enabled)
        const text = document.getText();
        const hits = Clairvoyant.regExpExecToArray(/\w+/gm, text)
            .map(match => ({
            token: makePreview(document, match.index, match[0]),
            preview: "",
            selection: makeSelection(document, match.index, match[0]),
        }));
        const map = new Map();
        const tokens = hits.map(i => i.token).filter((i, index, a) => index === a.indexOf(i));
        tokens.forEach(token => {
            map.set(token, hits.filter(i => token === i.token));
        });
        documentTokenEntryMap.set(document, map);
    });
    const scanOpenDocuments = () => Profiler.profile("scanFolder", () => {
        vscode.workspace.textDocuments.forEach(i => scanDocument(i));
    });
    const scanFolder = () => Profiler.profile("scanFolder", () => {
        vscode.workspace.textDocuments.forEach(i => scanDocument(i));
    });
    const stripFileName = (path) => path.substr(0, path.length - stripDirectory(path).length);
    const stripDirectory = (path) => path.split('\\').reverse()[0].split('/').reverse()[0];
    const digest = (text) => text.replace(/\s+/g, " ").substr(0, 128);
    const makeSightShowMenu = (document, entries) => Profiler.profile("makeSightTokenMenu", () => entries
        .map(entry => ({
        label: `$(rocket) Go to ${entry.selection.anchor.line}:${entry.selection.anchor.character}`,
        detail: entry.preview,
        command: () => __awaiter(this, void 0, void 0, function* () { return showToken(document, entry); })
    })));
    const makeSightTokenMenu = (token, entry) => Profiler.profile("makeSightTokenMenu", () => [
        {
            label: `$(clippy) Copy "${token}" to clipboard`,
            command: () => __awaiter(this, void 0, void 0, function* () { return copyToken(token); }),
        },
        {
            label: `$(clippy) Paste "${token}" to text editor`,
            command: () => __awaiter(this, void 0, void 0, function* () { return pasteToken(token); }),
        },
    ]
        .concat(Array.from(entry.entries())
        .map(entry => ({
        label: `$(file-text) ${stripDirectory(entry[0].fileName)}`,
        description: entry[0].isUntitled ?
            digest(entry[0].getText()) :
            stripFileName(entry[0].fileName),
        detail: `count: ${entry[1].length}`,
        command: () => __awaiter(this, void 0, void 0, function* () { return yield vscode.window.showQuickPick(makeSightShowMenu(entry[0], entry[1])); })
    }))));
    const makeSightRootMenu = () => Profiler.profile("makeSightRootMenu", () => Array.from(makeSureTokenDocumentEntryMap().entries())
        .map(entry => ({
        label: entry[0],
        description: undefined,
        detail: Array.from(entry[1].entries())
            .map(entry => `${stripDirectory(entry[0].fileName)}(${entry[1].length})`)
            .join(", "),
        command: () => __awaiter(this, void 0, void 0, function* () { return yield vscode.window.showQuickPick(makeSightTokenMenu(entry[0], entry[1])); })
    })));
    const sight = () => __awaiter(this, void 0, void 0, function* () {
        const select = yield vscode.window.showQuickPick(makeSightRootMenu());
        if (select) {
            yield select.command();
        }
    });
})(Clairvoyant = exports.Clairvoyant || (exports.Clairvoyant = {}));
//# sourceMappingURL=extension.js.map