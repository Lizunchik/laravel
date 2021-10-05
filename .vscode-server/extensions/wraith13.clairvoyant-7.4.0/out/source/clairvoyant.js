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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const Profiler = __importStar(require("./lib/profiler"));
const Config = __importStar(require("./lib/config"));
const Locale = __importStar(require("./lib/locale"));
const Busy = __importStar(require("./lib/busy"));
const File = __importStar(require("./lib/file"));
const Comparer = __importStar(require("./lib/comparer"));
const Menu = __importStar(require("./ui/menu"));
const StatusBar = __importStar(require("./ui/statusbar"));
const Selection = __importStar(require("./textEditor/selection"));
const Highlight = __importStar(require("./textEditor/highlight"));
const Scan = __importStar(require("./scan"));
const roundCenti = (value) => Math.round(value * 100) / 100;
const percentToDisplayString = (value, locales) => `${roundCenti(value).toLocaleString(locales, { style: "percent" })}`;
const applicationKey = Config.applicationKey;
exports.busy = new Busy.Entry(() => StatusBar.update());
const autoScanModeObject = Object.freeze({
    "none": {
        onInit: () => StatusBar.update(),
        enabled: false,
    },
    "open documents": {
        onInit: () => Scan.scanOpenDocuments(),
        enabled: true,
    },
    "workspace": {
        onInit: () => Scan.scanWorkspace(),
        enabled: true,
    },
});
const textEditorRevealTypeObject = Object.freeze({
    "AtTop": vscode.TextEditorRevealType.AtTop,
    "Default": vscode.TextEditorRevealType.Default,
    "InCenter": vscode.TextEditorRevealType.InCenter,
    "InCenterIfOutsideViewport": vscode.TextEditorRevealType.InCenterIfOutsideViewport,
});
const outputChannelVolumeObject = Object.freeze({
    "silent": (level) => 0 <= ["silent"].indexOf(level),
    "regular": (level) => 0 <= ["silent", "regular"].indexOf(level),
    "verbose": (level) => 0 <= ["silent", "regular", "verbose"].indexOf(level),
});
const gotoHistoryModeObject = Object.freeze({
    "single": (_lastValidViemColumn) => `@0`,
    "by view column": (lastValidViemColumn) => `@${lastValidViemColumn}`,
});
const highlightModeObject = Object.freeze({
    "none": {
        active: false,
        latest: false,
        trail: false,
    },
    "active": {
        active: true,
        latest: false,
        trail: false,
    },
    "latest": {
        active: true,
        latest: true,
        trail: false,
    },
    "trail": {
        active: true,
        latest: true,
        trail: true,
    },
});
const overviewRulerLaneObject = Object.freeze({
    "none": undefined,
    "left": vscode.OverviewRulerLane.Left,
    "center": vscode.OverviewRulerLane.Center,
    "right": vscode.OverviewRulerLane.Right,
    "full": vscode.OverviewRulerLane.Full,
});
const developFileListObject = Object.freeze({
    "none": () => Menu.makeEmptyList().concat(Menu.sightFileListRootMenuItem, Menu.lunaticGoToFileRootMenuItem),
    "sight": () => Menu.makeEmptyList().concat(Menu.lunaticGoToFileRootMenuItem, Menu.makeSightFileListMenu()),
    "goto": () => Menu.makeEmptyList().concat(Menu.sightFileListRootMenuItem, Menu.makeLunaticGoToFileMenu()),
});
const colorValidator = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);
exports.autoScanMode = new Config.MapEntry("clairvoyant.autoScanMode", autoScanModeObject);
exports.maxFiles = new Config.Entry("clairvoyant.maxFiles");
exports.showStatusBarItems = new Config.Entry("clairvoyant.showStatusBarItems");
exports.textEditorRevealType = new Config.MapEntry("clairvoyant.textEditorRevealType", textEditorRevealTypeObject);
exports.isExcludeStartsWidhDot = new Config.Entry("clairvoyant.isExcludeStartsWidhDot");
exports.excludeDirectories = new Config.Entry("clairvoyant.excludeDirectories", Config.stringArrayValidator);
exports.excludeExtentions = new Config.Entry("clairvoyant.excludeExtentions", Config.stringArrayValidator);
exports.targetProtocols = new Config.Entry("clairvoyant.targetProtocols", Config.stringArrayValidator);
exports.enablePreviewIntercept = new Config.Entry("clairvoyant.enablePreviewIntercept");
exports.gotoHistoryMode = new Config.MapEntry("clairvoyant.gotoHistoryMode", gotoHistoryModeObject);
exports.parserRegExp = new Config.Entry("clairvoyant.parserRegExp", value => "string" === typeof value);
exports.highlightMode = new Config.MapEntry("clairvoyant.highlightMode", highlightModeObject);
exports.highlightBaseColor = new Config.Entry("clairvoyant.highlightBaseColor", colorValidator);
exports.highlightAlpha = new Config.Entry("clairvoyant.highlightAlpha", value => "number" === typeof value);
exports.activeHighlightAlpha = new Config.Entry("clairvoyant.activeHighlightAlpha", value => "number" === typeof value);
exports.activeHighlightLineAlpha = new Config.Entry("clairvoyant.activeHighlightLineAlpha", value => "number" === typeof value);
exports.latestHighlightAlpha = new Config.Entry("clairvoyant.latestHighlightAlpha", value => "number" === typeof value);
exports.activeHighlightOverviewRulerLane = new Config.MapEntry("clairvoyant.activeHighlightOverviewRulerLane", overviewRulerLaneObject);
exports.latestHighlightOverviewRulerLane = new Config.MapEntry("clairvoyant.latestHighlightOverviewRulerLane", overviewRulerLaneObject);
exports.highlightOverviewRulerLane = new Config.MapEntry("clairvoyant.highlightOverviewRulerLane", overviewRulerLaneObject);
exports.enableLunaticPreview = new Config.Entry("clairvoyant.enableLunaticPreview");
exports.enableMenuCache = new Config.Entry("clairvoyant.enableMenuCache");
exports.developFileListOnSightRootMenu = new Config.MapEntry("clairvoyant.developFileListOnSightRootMenu", developFileListObject);
const outputChannelVolume = new Config.MapEntry("clairvoyant.outputChannelVolume", outputChannelVolumeObject);
const outputChannel = vscode.window.createOutputChannel(Config.applicationName);
let muteOutput = false;
exports.showOutput = () => outputChannel.show();
exports.output = (level, text) => {
    if (outputChannelVolume.get("")(level)) {
        if (muteOutput) {
            console.log(text);
        }
        else {
            outputChannel.append(text);
        }
    }
};
exports.outputLine = (level, text) => {
    if (outputChannelVolume.get("")(level)) {
        if (muteOutput) {
            console.log(text);
        }
        else {
            outputChannel.appendLine(text);
        }
    }
};
exports.initialize = (aContext) => {
    exports.outputLine("verbose", "Clairvoyant.initialize() is called.");
    exports.context = aContext;
    exports.context.subscriptions.push(
    //  コマンドの登録
    vscode.commands.registerCommand(`${applicationKey}.scanDocument`, () => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `"${applicationKey}.scanDocument" is called.`);
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            yield Scan.scanDocument(activeTextEditor.document, true);
        }
    })), vscode.commands.registerCommand(`${applicationKey}.scanOpenDocuments`, Scan.scanOpenDocuments), vscode.commands.registerCommand(`${applicationKey}.scanWorkspace`, Scan.scanWorkspace), vscode.commands.registerCommand(`${applicationKey}.sight`, exports.sight), vscode.commands.registerCommand(`${applicationKey}.sightDocument`, exports.sightDocument), vscode.commands.registerCommand(`${applicationKey}.sightToken`, exports.sightToken), vscode.commands.registerCommand(`${applicationKey}.lunaticGoToFile`, exports.lunaticGoToFile), vscode.commands.registerCommand(`${applicationKey}.back`, Selection.getEntry().showTokenUndo), vscode.commands.registerCommand(`${applicationKey}.forward`, Selection.getEntry().showTokenRedo), vscode.commands.registerCommand(`${applicationKey}.reload`, exports.reload), vscode.commands.registerCommand(`${applicationKey}.reportStatistics`, exports.reportStatistics), vscode.commands.registerCommand(`${applicationKey}.reportProfile`, exports.reportProfile), vscode.commands.registerCommand(`${applicationKey}.firstToken`, () => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `"${applicationKey}.firstToken" is called.`);
        let hit = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (undefined !== activeTextEditor) {
            const selection = Scan.getFirstTokenSelection(activeTextEditor);
            if (undefined !== selection) {
                hit = true;
                yield Selection.getEntry().showToken({ document: activeTextEditor.document, selection });
            }
        }
        if (!hit) {
            yield vscode.window.showInformationMessage(Locale.map("No token."));
        }
    })), vscode.commands.registerCommand(`${applicationKey}.nextToken`, () => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `"${applicationKey}.nextToken" is called.`);
        let hit = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (undefined !== activeTextEditor) {
            const selection = Scan.getNextTokenSelection(activeTextEditor);
            if (undefined !== selection) {
                hit = true;
                yield Selection.getEntry().showToken({ document: activeTextEditor.document, selection });
            }
        }
        if (!hit) {
            yield vscode.window.showInformationMessage(Locale.map("No token."));
        }
    })), vscode.commands.registerCommand(`${applicationKey}.previousToken`, () => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `"${applicationKey}.previousToken" is called.`);
        let hit = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (undefined !== activeTextEditor) {
            const selection = Scan.getPreviousTokenSelection(activeTextEditor);
            if (undefined !== selection) {
                hit = true;
                yield Selection.getEntry().showToken({ document: activeTextEditor.document, selection });
            }
        }
        if (!hit) {
            yield vscode.window.showInformationMessage(Locale.map("No token."));
        }
    })), vscode.commands.registerCommand(`${applicationKey}.toggleHighlight`, () => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `"${applicationKey}.toggleHighlight" is called.`);
        let hit = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (undefined !== activeTextEditor) {
            const token = Scan.getToken(activeTextEditor);
            if (undefined !== token) {
                hit = true;
                Highlight.toggle(token);
            }
        }
        if (!hit) {
            yield vscode.window.showInformationMessage(Locale.map("No token."));
        }
    })), 
    //  ステータスバーアイコンの登録
    StatusBar.make(), 
    //  イベントリスナーの登録
    vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration), vscode.workspace.onDidChangeWorkspaceFolders(exports.reload), vscode.workspace.onDidChangeTextDocument((event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const uri = event.document.uri.toString();
            //  OuputChannel に対するイベント処理中に OuputChannel に書き出すと無限ループになってしまうのでミュートする
            muteOutput = uri.startsWith("output:");
            exports.outputLine("verbose", `onDidChangeTextDocument("${uri}") is called.`);
            if (exports.autoScanMode.get(event.document.languageId).enabled && !exports.isExcludeDocument(event.document)) {
                yield Scan.scanDocument(event.document, true);
                vscode.window.visibleTextEditors
                    .filter(i => i.document.uri.toString() === uri)
                    .forEach(i => Highlight.updateEditor(i));
            }
            else {
                yield Scan.detachDocument(event.document);
            }
        }
        finally {
            muteOutput = false;
        }
    })), vscode.workspace.onDidCloseTextDocument((document) => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `onDidCloseTextDocument("${document.uri.toString()}") is called.`);
        if (Scan.isScanedDocment(document)) {
            try {
                yield vscode.workspace.fs.stat(document.uri);
            }
            catch (error) {
                console.log(`vscode.workspace.onDidCloseTextDocument: ${error}`); // 一応ログにエラーを吐いておく
                Scan.detachDocument(document);
            }
        }
    })), vscode.window.onDidChangeActiveTextEditor((textEditor) => __awaiter(void 0, void 0, void 0, function* () {
        exports.outputLine("verbose", `onDidChangeActiveTextEditor("${textEditor ? textEditor.document.uri.toString() : "undefined"}") is called.`);
        if (textEditor && exports.isTargetEditor(textEditor)) {
            exports.outputLine("verbose", `lastValidViemColumn: ${textEditor.viewColumn}`);
            if (textEditor.viewColumn) {
                Selection.setLastValidViemColumn(textEditor.viewColumn);
            }
            if (exports.autoScanMode.get(textEditor.document.languageId).enabled && !exports.isExcludeDocument(textEditor.document)) {
                yield Scan.scanDocument(textEditor.document);
                Highlight.updateEditor(textEditor);
            }
        }
        exports.setIsDocumentScanedWithClairvoyant(undefined !== textEditor && Scan.isScanedDocment(textEditor.document));
    })), vscode.window.onDidChangeTextEditorSelection(event => Selection.Log.update(event.textEditor)), vscode.languages.onDidChangeDiagnostics(exports.onDidChangeDiagnostics));
    exports.reload();
};
exports.setIsDocumentScanedWithClairvoyant = (isDocumentScanedWithClairvoyant) => vscode.commands.executeCommand('setContext', 'isDocumentScanedWithClairvoyant', isDocumentScanedWithClairvoyant);
exports.isTargetEditor = (textEditor) => undefined !== textEditor.viewColumn;
exports.isTargetProtocol = (uri) => exports.targetProtocols.get("").some(i => uri.startsWith(i));
exports.isExcludeFile = (filePath) => exports.excludeExtentions.get("").some(i => filePath.toLowerCase().endsWith(i.toLowerCase()));
exports.startsWithDot = (path) => exports.isExcludeStartsWidhDot.get("") && path.startsWith(".");
exports.isExcludeDocument = (document) => !Scan.isScanedDocment(document) &&
    (!exports.isTargetProtocol(document.uri.toString()) ||
        File.extractRelativePath(document.uri.toString()).split("/").some(i => 0 <= exports.excludeDirectories.get("").indexOf(i) || exports.startsWithDot(i)) ||
        exports.isExcludeFile(document.uri.toString()));
exports.encodeToken = (token) => `@${token}`;
exports.decodeToken = (token) => token.substring(1);
exports.copyToken = (text) => __awaiter(void 0, void 0, void 0, function* () {
    exports.outputLine("verbose", `copyToken("${text}") is called.`);
    yield vscode.env.clipboard.writeText(text);
});
exports.pasteToken = (text) => __awaiter(void 0, void 0, void 0, function* () {
    exports.outputLine("verbose", `pasteToken("${text}") is called.`);
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor) {
        yield textEditor.edit(editBuilder => {
            editBuilder.delete(textEditor.selection);
            editBuilder.insert(textEditor.selection.anchor.compareTo(textEditor.selection.active) <= 0 ?
                textEditor.selection.anchor :
                textEditor.selection.active, text);
        });
    }
});
const clearConfig = () => {
    [
        exports.autoScanMode,
        exports.maxFiles,
        exports.showStatusBarItems,
        exports.textEditorRevealType,
        exports.isExcludeStartsWidhDot,
        exports.excludeDirectories,
        exports.excludeExtentions,
        exports.targetProtocols,
        exports.enablePreviewIntercept,
        exports.gotoHistoryMode,
        exports.parserRegExp,
        exports.highlightMode,
        exports.highlightBaseColor,
        exports.highlightAlpha,
        exports.activeHighlightAlpha,
        exports.activeHighlightLineAlpha,
        exports.latestHighlightAlpha,
        exports.activeHighlightOverviewRulerLane,
        exports.latestHighlightOverviewRulerLane,
        exports.highlightOverviewRulerLane,
        exports.enableLunaticPreview,
        outputChannelVolume,
        exports.developFileListOnSightRootMenu,
        exports.enableMenuCache,
    ]
        .forEach(i => i.clear());
    vscode.commands.executeCommand('setContext', 'enableLunaticPreviewWithClairvoyant', exports.enableLunaticPreview.get(""));
};
exports.reload = () => {
    exports.outputLine("silent", Locale.map("♻️ Reload Clairvoyant!"));
    Scan.reload();
    Menu.reload();
    Selection.reload();
    Highlight.reload();
    clearConfig();
    Profiler.start();
    exports.autoScanMode.get("").onInit();
};
const onDidChangeConfiguration = () => {
    exports.outputLine("verbose", `onDidChangeConfiguration() is called.`);
    const old = {
        autoScanMode: exports.autoScanMode.getCache(""),
        maxFiles: exports.maxFiles.getCache(""),
        isExcludeStartsWidhDot: exports.isExcludeStartsWidhDot.getCache(""),
        excludeDirectories: exports.excludeDirectories.getCache(""),
        excludeExtentions: exports.excludeExtentions.getCache(""),
        targetProtocols: exports.targetProtocols.getCache(""),
        gotoHistoryMode: exports.gotoHistoryMode.getCache(""),
        enableLunaticPreview: exports.enableLunaticPreview.getCache(""),
        developFileListOnSightRootMenu: exports.developFileListOnSightRootMenu.getCache(""),
    };
    clearConfig();
    StatusBar.update();
    if (JSON.stringify(old.gotoHistoryMode) !== JSON.stringify(exports.gotoHistoryMode.get(""))) {
        Selection.reload();
    }
    if (old.autoScanMode !== exports.autoScanMode.get("") ||
        old.maxFiles !== exports.maxFiles.get("") ||
        old.isExcludeStartsWidhDot !== exports.isExcludeStartsWidhDot.get("") ||
        JSON.stringify(old.excludeDirectories) !== JSON.stringify(exports.excludeDirectories.get("")) ||
        JSON.stringify(old.excludeExtentions) !== JSON.stringify(exports.excludeExtentions.get("")) ||
        JSON.stringify(old.targetProtocols) !== JSON.stringify(exports.targetProtocols.get("")) ||
        old.enableLunaticPreview !== exports.enableLunaticPreview.get("") ||
        old.developFileListOnSightRootMenu !== exports.developFileListOnSightRootMenu.get("")) {
        Scan.reload();
        Menu.reload();
        exports.autoScanMode.get("").onInit();
    }
};
exports.onDidChangeDiagnostics = (event) => {
    event.uris.forEach(uri => Menu.removeCache(`${uri.toString()}.makeSightFileRootMenu:`));
};
exports.getDiagnosticDocuments = () => vscode.languages.getDiagnostics().filter(i => 0 < i[1].length).map(i => i[0]);
exports.getDocumentDiagnostics = (uri) => vscode.languages.getDiagnostics(uri)
    .sort(Comparer.merge([
    Comparer.make(i => i.severity),
    Comparer.make(i => i.range.start.line),
    Comparer.make(i => i.range.start.character),
    Comparer.make(i => i.range.end.line),
    Comparer.make(i => i.range.end.character),
]));
exports.getDocumentDiagnosticsSummary = (uri) => {
    const result = [];
    const diagnostics = exports.getDocumentDiagnostics(uri);
    const severities = diagnostics
        .map(i => i.severity)
        .filter((i, index, list) => index === list.indexOf(i));
    severities.forEach(severity => {
        result.push({
            severity,
            count: diagnostics.filter(i => i.severity === severity).length
        });
    });
    return result;
};
exports.reportStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.busy.do(() => Profiler.profile("reportStatistics", () => {
        exports.showOutput();
        exports.outputLine("silent", `${Locale.map("📊 Statistics Report")} - ${new Date()}`);
        exports.outputLine("silent", `files: ${Object.keys(Scan.documentTokenEntryMap).length.toLocaleString()}`);
        exports.outputLine("silent", `unique tokens: ${Object.keys(Scan.tokenDocumentEntryMap).length.toLocaleString()}`);
        exports.outputLine("silent", `total tokens: ${Object.values(Scan.tokenCountMap).reduce((a, b) => a + b, 0).toLocaleString()}`);
        exports.outputLine("silent", "");
    }));
});
exports.reportProfile = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.busy.do(() => Profiler.profile("reportProfile", () => {
        exports.showOutput();
        if (Profiler.getIsProfiling()) {
            exports.outputLine("silent", `${Locale.map("📊 Profile Report")} - ${new Date()}`);
            const overall = Profiler.getOverall();
            const total = Profiler.getReport().map(i => i.ticks).reduce((p, c) => p + c);
            exports.outputLine("silent", Locale.map("⚖ Overview"));
            exports.outputLine("silent", `- Overall: ${overall.toLocaleString()}ms ( ${percentToDisplayString(1)} )`);
            exports.outputLine("silent", `- Busy: ${total.toLocaleString()}ms ( ${percentToDisplayString(total / overall)} )`);
            exports.outputLine("silent", Locale.map("🔬 Busy Details"));
            exports.outputLine("silent", `- Total: ${total.toLocaleString()}ms ( ${percentToDisplayString(1)} )`);
            Profiler.getReport().forEach(i => exports.outputLine("silent", `- ${i.name}: ${i.ticks.toLocaleString()}ms ( ${percentToDisplayString(i.ticks / total)} )`));
            exports.outputLine("silent", "");
        }
        else {
            exports.outputLine("silent", Locale.map("🚫 Profile has not been started."));
        }
    }));
});
exports.sight = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield Menu.Show.root({
        makeItemList: Object.keys(Scan.tokenDocumentEntryMap).length <= 0 ?
            Menu.makeStaticMenu :
            Menu.makeSightRootMenu,
        options: {
            matchOnDescription: true,
            filePreview: exports.enableLunaticPreview.get(""),
        }
    });
});
exports.sightDocument = () => __awaiter(void 0, void 0, void 0, function* () {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (undefined === activeTextEditor || !Scan.isScanedDocment(activeTextEditor.document)) {
        yield Menu.Show.root({
            makeItemList: Menu.makeStaticMenu,
            options: {
                matchOnDescription: true,
            }
        });
    }
    else {
        yield Menu.Show.root({
            makeItemList: () => Menu.makeSightDocumentRootMenu(activeTextEditor.document.uri.toString()),
            options: {
                matchOnDescription: true,
            }
        });
    }
});
exports.sightToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const activeTextEditor = vscode.window.activeTextEditor;
    const token = undefined === activeTextEditor ? undefined : Scan.getToken(activeTextEditor);
    if (undefined === activeTextEditor || undefined === token) {
        yield vscode.window.showInformationMessage(Locale.map("No token."));
    }
    else {
        yield Menu.Show.root({
            makeItemList: () => Menu.makeSightTokenRootMenu(activeTextEditor.document.uri.toString(), token),
            options: {
                matchOnDescription: true,
                matchOnDetail: true,
                document: activeTextEditor.document,
                token,
            }
        });
    }
});
exports.lunaticGoToFile = () => __awaiter(void 0, void 0, void 0, function* () {
    if (Object.keys(Scan.documentMap).length <= 0) {
        yield Menu.Show.root({
            makeItemList: Menu.makeStaticMenu,
            options: {
                matchOnDescription: true,
            }
        });
    }
    else {
        yield Menu.Show.root({
            makeItemList: () => Menu.makeEmptyList().concat(Menu.makeLunaticGoToFileMenu(), Menu.regularGotoFileMenuItem),
            options: {
                matchOnDescription: true,
                filePreview: true,
            }
        });
    }
});
//# sourceMappingURL=clairvoyant.js.map