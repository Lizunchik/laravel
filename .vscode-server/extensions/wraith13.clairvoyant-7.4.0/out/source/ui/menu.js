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
const Profiler = __importStar(require("../lib/profiler"));
const Locale = __importStar(require("../lib/locale"));
const File = __importStar(require("../lib/file"));
const Comparer = __importStar(require("../lib/comparer"));
const Clairvoyant = __importStar(require("../clairvoyant"));
const Changes = __importStar(require("../textEditor/changes"));
const Selection = __importStar(require("../textEditor/selection"));
const Highlight = __importStar(require("../textEditor/highlight"));
const Scan = __importStar(require("../scan"));
exports.makeEmptyList = () => [];
exports.cache = {};
exports.reload = () => {
    Clairvoyant.outputLine("verbose", `Menu.reload() is called.`);
    Object.keys(exports.cache).forEach(i => delete exports.cache[i]);
    Object.keys(previewCache).forEach(i => delete previewCache[i]);
};
exports.removeCache = (key) => {
    Clairvoyant.outputLine("verbose", `Menu.removeCache("${key}") is called.`);
    Object.keys(exports.cache).filter(i => i.startsWith(key)).forEach(i => delete exports.cache[i]);
    return key;
};
exports.getCacheOrMake = (key, itemMaker) => {
    if (Clairvoyant.enableMenuCache.get("")) {
        if (!exports.cache[key]) {
            Clairvoyant.outputLine("verbose", `Menu.getCacheOrMake("${key}") has no cache.`);
            exports.cache[key] = itemMaker();
        }
        else {
            Clairvoyant.outputLine("verbose", `Menu.getCacheOrMake("${key}") has cache.`);
        }
        return exports.cache[key];
    }
    else {
        return itemMaker();
    }
};
var Show;
(function (Show) {
    const menuStack = [];
    const show = (entry) => __awaiter(this, void 0, void 0, function* () {
        // Highlight.Preview.* 周りの処理の影響を受けないように事前にメニューアイテムを取得
        const items = yield Clairvoyant.busy.do(() => Profiler.profile("Menu.Show.show.entry.makeItemList", entry.makeItemList));
        const lastValidViemColumn = Selection.getLastValidViemColumn();
        let lastPreviewItem;
        let lastSelection = Selection.getLastTextEditor(i => i.selection);
        const options = entry.options || {};
        const selectionEntry = Selection.getEntry();
        Highlight.Preview.backup();
        if (undefined !== options.token) {
            Highlight.Preview.showToken(options.token);
        }
        //if (undefined !== options.document)
        //{
        yield selectionEntry.showTextDocumentWithBackupSelection(options.document);
        //}
        if (true === options.filePreview) {
            yield Selection.PreviewTextEditor.make();
        }
        options.onDidSelectItem = (select) => __awaiter(this, void 0, void 0, function* () {
            lastPreviewItem = select;
            if (true === options.filePreview) {
                yield Selection.PreviewTextEditor.show(select.document);
            }
            if (select.preview &&
                (options.document === select.preview.document ||
                    (true === options.filePreview && select.document === select.preview.document) ||
                    Selection.getLastTextEditor(i => i.document.uri.toString()) === select.preview.document.uri.toString())) {
                selectionEntry.previewSelection(select.preview);
            }
            if (undefined === options.token) {
                Highlight.Preview.showToken(select.token);
            }
            Highlight.Preview.showSelection(select.preview);
            lastSelection = Selection.getLastTextEditor(i => i.selection);
        });
        const select = yield vscode.window.showQuickPick(items, options);
        const isCommitable = ((undefined !== select &&
            lastPreviewItem === select &&
            select.isTerm) ||
            (undefined === select &&
                undefined !== vscode.window.activeTextEditor &&
                lastValidViemColumn === vscode.window.activeTextEditor.viewColumn &&
                Clairvoyant.enablePreviewIntercept.get("") &&
                Selection.toString(lastSelection) !== Selection.toString(Selection.getLastTextEditor(i => i.selection))));
        if (true === options.filePreview) {
            yield Selection.PreviewTextEditor.dispose(isCommitable);
        }
        //if (undefined !== options.document)
        //{
        yield selectionEntry.dispose(isCommitable);
        //}
        if (undefined !== options.token) {
            Highlight.Preview.dispose(isCommitable);
        }
        if (select) {
            yield select.command();
        }
    });
    Show.update = () => __awaiter(this, void 0, void 0, function* () { return yield show(menuStack[menuStack.length - 1]); });
    const push = (entry) => __awaiter(this, void 0, void 0, function* () {
        menuStack.push(entry);
        yield Show.update();
    });
    const pop = () => __awaiter(this, void 0, void 0, function* () {
        menuStack.pop();
        yield Show.update();
    });
    Show.root = (entry) => __awaiter(this, void 0, void 0, function* () {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor && activeTextEditor.viewColumn) {
            Selection.setLastValidViemColumn(activeTextEditor.viewColumn);
        }
        menuStack.splice(0, 0);
        yield push(entry);
    });
    Show.forward = (entry) => __awaiter(this, void 0, void 0, function* () {
        return yield push(Profiler.profile("Menu.Show.forward", () => ({
            makeItemList: () => Profiler.profile("Menu.Show.forward.addBackMenuItem", () => exports.makeEmptyList().concat({
                label: `$(reply) ${Locale.typeableMap("clairvoyant.backMenu.title")}`,
                command: () => __awaiter(this, void 0, void 0, function* () { return yield pop(); }),
            }, entry.makeItemList())),
            options: entry.options,
        })));
    });
})(Show = exports.Show || (exports.Show = {}));
const previewCache = {};
exports.removePreviewCache = (uri) => {
    Clairvoyant.outputLine("verbose", `Menu.removePreviewCache("${uri}") is called.`);
    delete previewCache[uri];
    return uri;
};
const makePreview = (document, anchor) => Profiler.profile("makePreview", () => {
    if (!previewCache[document.uri.toString()]) {
        previewCache[document.uri.toString()] = {};
    }
    if (!previewCache[document.uri.toString()][anchor.line]) {
        const line = document.getText(new vscode.Range(anchor.line, 0, anchor.line + 1, 0)).substr(0, 128);
        previewCache[document.uri.toString()][anchor.line] = line.trim().replace(/\s+/gm, " ");
    }
    return previewCache[document.uri.toString()][anchor.line];
});
const makeGoCommandMenuItem = (label, entry, command, hits, document) => Profiler.profile("makeGoCommandMenuItem", () => ({
    label: `$(rocket) ${Locale.typeableMap(label)} ${Selection.toString(entry.selection)}` + (undefined !== hits ? ` ${hits}` : ""),
    description: File.extractRelativePath(entry.document.uri.toString()),
    detail: makePreview(entry.document, entry.selection.anchor),
    command: command ? command : (() => __awaiter(void 0, void 0, void 0, function* () { return Selection.getEntry().showToken(entry); })),
    preview: entry,
    document,
    isTerm: true,
}));
const getDiagnosticIcon = (severity) => {
    switch (severity) {
        case vscode.DiagnosticSeverity.Error:
            return "flame";
        case vscode.DiagnosticSeverity.Warning:
            return "alert";
        case vscode.DiagnosticSeverity.Information:
            return "info";
        case vscode.DiagnosticSeverity.Hint:
            return "light-bulb";
        default:
            return "rocket";
    }
};
const getDiagnosticLabel = (severity) => {
    switch (severity) {
        case vscode.DiagnosticSeverity.Error:
            return "Error";
        case vscode.DiagnosticSeverity.Warning:
            return "Warning";
        case vscode.DiagnosticSeverity.Information:
            return "Information";
        case vscode.DiagnosticSeverity.Hint:
            return "Hint";
        default:
            return "unknown";
    }
};
const makeGoDiagnosticCommandMenuItem = (diagnostic, entry, diagnostics) => Profiler.profile("makeGoCommandMenuItem", () => ({
    label: `$(${getDiagnosticIcon(diagnostic.severity)}) ${getDiagnosticLabel(diagnostic.severity)}:${diagnostics.indexOf(diagnostic) + 1}/${diagnostics.length} ${diagnostic.message} `,
    description: Selection.toString(entry.selection),
    detail: makePreview(entry.document, entry.selection.anchor),
    command: () => __awaiter(void 0, void 0, void 0, function* () { return Selection.getEntry().showToken(entry); }),
    preview: entry,
    //document: entry.document,
    isTerm: true,
}));
const makeSightShowMenu = (uri, token, hits) => exports.getCacheOrMake(`${uri}.makeSightShowMenu:${token}`, () => Profiler.profile("makeSightShowMenu", () => exports.makeEmptyList().concat(hits.map((index, i) => makeGoCommandMenuItem("clairvoyant.goto.title", {
    document: Scan.documentMap[uri],
    selection: Selection.make(Scan.documentMap[uri], index, token)
}, undefined, `hits:${i + 1}/${hits.length}`)))));
const makeSightTokenCoreMenu = (token) => ([
    {
        label: `$(clippy) ${Locale.typeableMap("Copy \"${token}\" to clipboard").replace(/\$\{token\}/g, token)}`,
        command: () => __awaiter(void 0, void 0, void 0, function* () { return Clairvoyant.copyToken(token); }),
    },
    {
        label: `$(clippy) ${Locale.typeableMap("Paste \"${token}\" to text editor").replace(/\$\{token\}/g, token)}`,
        command: () => __awaiter(void 0, void 0, void 0, function* () { return Clairvoyant.pasteToken(token); }),
    },
    Highlight.isHighlighted(token) ?
        {
            label: `$(trashcan) ${Locale.typeableMap("Remove highlight for \"${token}\"").replace(/\$\{token\}/g, token)}`,
            command: () => __awaiter(void 0, void 0, void 0, function* () { return Highlight.remove(token); }),
        } :
        {
            label: `$(light-bulb) ${Locale.typeableMap("Add highlight for \"${token}\"").replace(/\$\{token\}/g, token)}`,
            command: () => __awaiter(void 0, void 0, void 0, function* () { return Highlight.add(token); }),
        },
]);
const makeSightTokenFileMenu = (token) => exports.getCacheOrMake(`filelist.${Clairvoyant.decodeToken(token)}`, () => Profiler.profile("makeSightTokenFileMenu", () => exports.makeEmptyList().concat(
//makeSightTokenCoreMenu(Clairvoyant.decodeToken(token)),
(Scan.tokenDocumentEntryMap[token].map(i => ({ uri: i, hits: Scan.documentTokenEntryMap[i][token] }))
    .sort(Comparer.merge([Comparer.make(entry => -entry.hits.length), Comparer.make(entry => entry.uri)]))
    .map(entry => ({
    label: `$(file-text) ${File.extractFileName(entry.uri)} ...`,
    description: File.makeDescription(Scan.documentMap[entry.uri]),
    detail: `count: ${entry.hits.length}`,
    document: Scan.documentMap[entry.uri],
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat(makeSightShowMenu(entry.uri, Clairvoyant.decodeToken(token), entry.hits)),
            options: {
                matchOnDetail: true,
                document: Scan.documentMap[entry.uri],
                token: Clairvoyant.decodeToken(token),
            },
        });
    })
}))))));
const makeSightTokenFileShowMenu = (token) => exports.getCacheOrMake(`filelist.${Clairvoyant.decodeToken(token)}.show`, () => Profiler.profile("makeSightTokenFileShowMenu", () => exports.makeEmptyList().concat(Scan.tokenDocumentEntryMap[token].map(uri => Scan.documentTokenEntryMap[uri][token].map((index, i, hits) => makeGoCommandMenuItem("clairvoyant.goto.title", {
    document: Scan.documentMap[uri],
    selection: Selection.make(Scan.documentMap[uri], index, token)
}, undefined, `hits:${i + 1}/${hits.length}`, Scan.documentMap[uri]))).reduce((previous, current) => previous.concat(current), []))));
const makeSightFileTokenMenu = (uri, token, indices) => Profiler.profile("makeSightFileTokenMenu", () => exports.makeEmptyList().concat(makeSightTokenCoreMenu(token), makeSightShowMenu(uri, token, indices)));
const makeProblemFileMenuItem = (data) => ({
    label: data.showFileName ? `$(file-text) ${File.extractFileName(data.document.uri.toString())} ...` : `$(flame) ${Locale.typeableMap("Problems")} ...`,
    description: data.showFileName ? File.makeDescription(data.document) : undefined,
    detail: Clairvoyant.getDocumentDiagnosticsSummary(data.document.uri)
        .map(i => `$(${getDiagnosticIcon(i.severity)}) ${getDiagnosticLabel(i.severity)}:${i.count}`).join(", "),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        const diagnostics = Clairvoyant.getDocumentDiagnostics(data.document.uri);
        if (diagnostics.length <= 0) {
            vscode.window.showInformationMessage(Locale.map("No problems."));
        }
        else {
            yield Show.forward({
                makeItemList: () => diagnostics.map(current => makeGoDiagnosticCommandMenuItem(current, {
                    document: data.document,
                    selection: new vscode.Selection(current.range.start, current.range.end)
                }, diagnostics.filter(i => i.severity === current.severity))),
                options: {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    document: data.document,
                }
            });
        }
    }),
    document: data.document,
});
const makeSightFileRootMenu = (uri, entries) => exports.getCacheOrMake(`${uri}.makeSightFileRootMenu:${getRootMenuOrder()}`, () => Profiler.profile("makeSightFileRootMenu", () => exports.makeEmptyList().concat({
    label: `$(git-branch) ${Locale.typeableMap("Changes")} ...`,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        const changes = yield Changes.get();
        if (changes.length <= 0) {
            vscode.window.showInformationMessage(Locale.map("No changes or this is the only change."));
        }
        else {
            yield Show.forward({
                makeItemList: () => changes.map((change, i) => makeGoCommandMenuItem("clairvoyant.goto.title", {
                    document: Scan.documentMap[uri],
                    selection: change
                }, undefined, `changes:${i + 1}/${changes.length}`)),
                options: {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    document: Scan.documentMap[uri],
                },
            });
        }
    }),
}, makeProblemFileMenuItem({ document: Scan.documentMap[uri], showFileName: false }), [
    "token" === getRootMenuOrder() ?
        {
            label: `$(list-ordered) ${Locale.typeableMap("Sort by count")}`,
            command: () => __awaiter(void 0, void 0, void 0, function* () {
                setRootMenuOrder("count");
                yield Show.update();
            }),
        } :
        {
            label: `$(list-ordered) ${Locale.typeableMap("Sort by token")}`,
            command: () => __awaiter(void 0, void 0, void 0, function* () {
                setRootMenuOrder("token");
                yield Show.update();
            }),
        },
], Object.entries(entries).sort("token" === getRootMenuOrder() ?
    (a, b) => Comparer.string(a[0], b[0]) :
    Comparer.merge([
        Comparer.make(entry => -entry[1].length),
        (a, b) => Comparer.string(a[0], b[0])
    ]))
    .map(entry => ({
    label: `$(tag) "${Clairvoyant.decodeToken(entry[0])}" ...`,
    description: undefined,
    detail: `count: ${entry[1].length}`,
    token: Clairvoyant.decodeToken(entry[0]),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => makeSightFileTokenMenu(uri, Clairvoyant.decodeToken(entry[0]), entry[1]),
            options: {
                matchOnDetail: true,
                document: Scan.documentMap[uri],
                token: Clairvoyant.decodeToken(entry[0]),
            },
        });
    }),
})))));
const makeSightCurrentFileMenuItem = (uri, tokenMap = Scan.documentTokenEntryMap[uri]) => ({
    label: `$(file-text) ${Locale.typeableMap("Current file")} ...`,
    description: File.makeDescription(Scan.documentMap[uri]),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => makeSightFileRootMenu(uri, tokenMap),
        });
    })
});
const makeSightFileMenuItem = (uri, tokenMap = Scan.documentTokenEntryMap[uri]) => ({
    label: `$(file-text) ${File.extractFileName(uri)} ...`,
    description: File.makeDescription(Scan.documentMap[uri]),
    document: Scan.documentMap[uri],
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat({
                label: `$(file-text) ${Locale.typeableMap("Go to this file")}`,
                description: `${File.extractFileName(uri)}`,
                detail: File.makeDescription(Scan.documentMap[uri]),
                document: Scan.documentMap[uri],
                command: () => __awaiter(void 0, void 0, void 0, function* () {
                    yield vscode.window.showTextDocument(Scan.documentMap[uri], { preview: false });
                }),
                isTerm: true,
            }, makeSightFileRootMenu(uri, tokenMap)),
            options: {
                document: Scan.documentMap[uri],
            }
        });
    })
});
exports.makeSightFileListMenu = () => exports.getCacheOrMake("filelist", () => Profiler.profile("makeSightFileListMenu", () => exports.makeEmptyList().concat(Object.entries(Scan.documentTokenEntryMap)
    .sort(Comparer.merge([Comparer.make(entry => File.extractDirectoryAndWorkspace(entry[0])), Comparer.make(entry => entry[0])]))
    .map(entry => makeSightFileMenuItem(entry[0], entry[1])))));
const getRootMenuOrder = () => Clairvoyant.context.globalState.get("clairvoyant.rootMenuOrder", "token");
const setRootMenuOrder = (order) => {
    Clairvoyant.context.globalState.update("clairvoyant.rootMenuOrder", order);
    exports.removeCache(`root.full`);
};
const makeQuickMenu = () => {
    const result = [];
    const activeTextEditor = vscode.window.activeTextEditor;
    if (undefined !== activeTextEditor) {
        const seek = Scan.getSeekResult(activeTextEditor);
        if (undefined !== seek) {
            const next_i = (seek.i + 1) % seek.hits.length;
            const previous_i = (seek.i - 1 + seek.hits.length) % seek.hits.length;
            result.push({
                label: `$(rocket) ${Locale.typeableMap("clairvoyant.nextToken.title")}`,
                description: `$(tag) ${seek.token}`,
                detail: `hits:${next_i + 1}/${seek.hits.length}`,
                command: () => __awaiter(void 0, void 0, void 0, function* () { return yield vscode.commands.executeCommand("clairvoyant.nextToken"); }),
                preview: {
                    document: activeTextEditor.document,
                    selection: Selection.make(activeTextEditor.document, seek.hits[next_i], seek.token)
                },
                //token: seek.token,
                document: activeTextEditor.document,
                isTerm: true,
            }, {
                label: `$(rocket) ${Locale.typeableMap("clairvoyant.previousToken.title")}`,
                description: `$(tag) ${seek.token}`,
                detail: `hits:${previous_i + 1}/${seek.hits.length}`,
                command: () => __awaiter(void 0, void 0, void 0, function* () { return yield vscode.commands.executeCommand("clairvoyant.previousToken"); }),
                preview: {
                    document: activeTextEditor.document,
                    selection: Selection.make(activeTextEditor.document, seek.hits[previous_i], seek.token)
                },
                //token: seek.token,
                document: activeTextEditor.document,
                isTerm: true,
            }, {
                label: `$(light-bulb) ${Locale.typeableMap("clairvoyant.toggleHighlight.title")}`,
                description: `$(tag) ${seek.token}`,
                command: () => __awaiter(void 0, void 0, void 0, function* () { return yield vscode.commands.executeCommand("clairvoyant.toggleHighlight"); }),
            });
        }
    }
    return result;
};
const makeHistoryMenu = () => {
    const result = [];
    const selectionEntry = Selection.getEntry();
    if (0 < selectionEntry.showTokenUndoBuffer.length) {
        const entry = selectionEntry.showTokenUndoBuffer[selectionEntry.showTokenUndoBuffer.length - 1];
        if (entry.undo) {
            result.push(makeGoCommandMenuItem("clairvoyant.back.title", entry.undo, selectionEntry.showTokenUndo));
        }
    }
    if (0 < selectionEntry.showTokenRedoBuffer.length) {
        result.push(makeGoCommandMenuItem("clairvoyant.forward.title", selectionEntry.showTokenRedoBuffer[selectionEntry.showTokenRedoBuffer.length - 1].redo, selectionEntry.showTokenRedo));
    }
    return result;
};
const makeHighlightTokensMenu = (highlights) => [
    {
        label: `$(trashcan) ${Locale.typeableMap("Clear all highlights")}`,
        //description: highlights.map(token => `$(tag) "${token}"`).join(", "),
        command: () => __awaiter(void 0, void 0, void 0, function* () { return Highlight.reload(); }),
    }
]
    .concat(Profiler.profile("makeHighlightTokensMenu.core", () => Profiler.profile("makeHighlightTokensMenu.sort", () => Object.entries(Scan.tokenDocumentEntryMap)
    .filter(entry => 0 <= highlights.indexOf(Clairvoyant.decodeToken(entry[0])))
    .sort("token" === getRootMenuOrder() ?
    (a, b) => Comparer.string(a[0], b[0]) :
    Comparer.merge([
        Comparer.make((entry) => -Scan.tokenCountMap[entry[0]]),
        (a, b) => Comparer.string(a[0], b[0])
    ])))
    .map(entry => ({
    label: `$(tag) "${Clairvoyant.decodeToken(entry[0])}" ...`,
    description: undefined,
    detail: entry[1].map(i => ({
        uri: i,
        file: Scan.documentFileMap[i],
        hits: Scan.documentTokenEntryMap[i][entry[0]].length
    }))
        .sort(Comparer.merge([Comparer.make(d => -d.hits), Comparer.make(d => d.uri)]))
        .map(d => `$(file-text) ${d.file}(${d.hits})`)
        .join(", "),
    token: Clairvoyant.decodeToken(entry[0]),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat(makeSightTokenCoreMenu(Clairvoyant.decodeToken(entry[0])), makeSightTokenFileMenu(entry[0]), makeSightTokenFileShowMenu(entry[0])),
            options: {
                matchOnDescription: true,
                matchOnDetail: true,
                token: Clairvoyant.decodeToken(entry[0]),
            },
        });
    })
}))));
const makeHighlightRootMenu = () => {
    const highlights = Highlight.getHighlight().concat([]).reverse();
    return highlights.length <= 0 ?
        [] :
        [{
                label: `$(light-bulb) ${Locale.typeableMap("Highlighted tokens")} ...`,
                description: highlights.map(token => `$(tag) "${token}"`).join(", "),
                command: () => __awaiter(void 0, void 0, void 0, function* () {
                    return yield Show.forward({
                        makeItemList: () => makeHighlightTokensMenu(highlights),
                        options: {
                            matchOnDescription: true,
                        },
                    });
                })
            }];
};
const makeHighlightDocumentTokensMenu = (uri, entries) => [
    {
        label: `$(trashcan) ${Locale.typeableMap("Clear all highlights")}`,
        //description: highlights.map(token => `$(tag) "${token}"`).join(", "),
        command: () => __awaiter(void 0, void 0, void 0, function* () { return Highlight.reload(); }),
    }
]
    .concat(Profiler.profile("makeHighlightDocumentTokensMenu.core", () => Object.entries(entries).sort("token" === getRootMenuOrder() ?
    (a, b) => Comparer.string(a[0], b[0]) :
    Comparer.merge([
        Comparer.make(entry => -entry[1].length),
        (a, b) => Comparer.string(a[0], b[0])
    ]))
    .map(entry => ({
    label: `$(tag) "${Clairvoyant.decodeToken(entry[0])}" ...`,
    description: undefined,
    detail: `count: ${entry[1].length}`,
    token: Clairvoyant.decodeToken(entry[0]),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => makeSightFileTokenMenu(uri, Clairvoyant.decodeToken(entry[0]), entry[1]),
            options: {
                matchOnDetail: true,
                document: Scan.documentMap[uri],
                token: Clairvoyant.decodeToken(entry[0]),
            },
        });
    }),
}))));
const makeHighlightDocumentRootMenu = (uri) => {
    const documentTokenEntry = Scan.documentTokenEntryMap[uri];
    const documentTokens = Object.keys(documentTokenEntry);
    const tokenMap = {};
    Highlight.getHighlight()
        .map(Clairvoyant.encodeToken)
        .reverse()
        .filter(i => 0 <= documentTokens.indexOf(i))
        .forEach(i => tokenMap[i] = documentTokenEntry[i]);
    return Object.keys(tokenMap).length <= 0 ?
        [] :
        [{
                label: `$(light-bulb) ${Locale.typeableMap("Highlighted tokens")} ...`,
                description: Object.keys(tokenMap)
                    .map(Clairvoyant.decodeToken)
                    .map(token => `$(tag) "${token}"`)
                    .join(", "),
                command: () => __awaiter(void 0, void 0, void 0, function* () {
                    return yield Show.forward({
                        makeItemList: () => makeHighlightDocumentTokensMenu(uri, tokenMap),
                        options: {
                            matchOnDescription: true,
                        },
                    });
                })
            }];
};
const makeStaticMenuItem = (octicon, label, command) => ({
    label: octicon + " " + Locale.typeableMap(label),
    command: () => __awaiter(void 0, void 0, void 0, function* () { return yield vscode.commands.executeCommand(command); }),
});
exports.makeStaticMenu = () => [
    makeStaticMenuItem("$(telescope)", "clairvoyant.scanDocument.title", "clairvoyant.scanDocument"),
    makeStaticMenuItem("$(telescope)", "clairvoyant.scanOpenDocuments.title", "clairvoyant.scanOpenDocuments"),
    makeStaticMenuItem("$(telescope)", "clairvoyant.scanWorkspace.title", "clairvoyant.scanWorkspace"),
    makeStaticMenuItem("$(info)", "clairvoyant.reportStatistics.title", "clairvoyant.reportStatistics"),
    makeStaticMenuItem("$(dashboard)", "clairvoyant.reportProfile.title", "clairvoyant.reportProfile"),
];
exports.regularGotoFileMenuItem = {
    label: `$(list-unordered) ${Locale.typeableMap("Regular: Go To File")} ...`,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        yield vscode.commands.executeCommand("workbench.action.quickOpen");
    }),
    isTerm: true,
};
const makeProblemRootMenuItem = (uris) => 0 < uris.length ?
    {
        label: `$(flame) ${Locale.typeableMap("Problems")} ...`,
        detail: uris
            .map(uri => `$(file-text) ${File.extractFileName(uri)}`)
            .join(", "),
        command: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield Show.forward({
                makeItemList: () => uris
                    .map(uri => vscode.workspace.textDocuments.filter(i => i.uri.toString() === uri)[0])
                    .filter(document => document)
                    .map(document => makeProblemFileMenuItem({
                    document,
                    showFileName: true
                })),
                options: {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    filePreview: Clairvoyant.enableLunaticPreview.get(""),
                }
            });
        })
    } :
    [];
exports.sightFileListRootMenuItem = {
    label: `$(list-ordered) ${Locale.typeableMap("Show by file")} ...`,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: exports.makeSightFileListMenu,
            options: {
                matchOnDescription: true,
                filePreview: Clairvoyant.enableLunaticPreview.get(""),
            },
        });
    })
};
exports.lunaticGoToFileRootMenuItem = {
    label: `$(rocket) ${Locale.typeableMap("Go To File")} ...`,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat(exports.makeLunaticGoToFileMenu(), exports.regularGotoFileMenuItem),
            options: {
                matchOnDescription: true,
                filePreview: Clairvoyant.enableLunaticPreview.get(""),
            },
        });
    })
};
exports.makeSightRootMenu = () => Profiler.profile("makeSightRootMenu", () => exports.makeEmptyList().concat(makeHistoryMenu(), makeQuickMenu(), makeHighlightRootMenu(), vscode.window.activeTextEditor && Scan.isScanedDocment(vscode.window.activeTextEditor.document) ?
    makeSightCurrentFileMenuItem(vscode.window.activeTextEditor.document.uri.toString()) :
    [], makeProblemRootMenuItem(Clairvoyant.getDiagnosticDocuments().map(uri => uri.toString())), exports.getCacheOrMake(`root.${getRootMenuOrder()}`, () => exports.makeEmptyList().concat("token" === getRootMenuOrder() ?
    {
        label: `$(list-ordered) ${Locale.typeableMap("Sort by count")}`,
        command: () => __awaiter(void 0, void 0, void 0, function* () {
            setRootMenuOrder("count");
            yield Show.update();
        }),
    } :
    {
        label: `$(list-ordered) ${Locale.typeableMap("Sort by token")}`,
        command: () => __awaiter(void 0, void 0, void 0, function* () {
            setRootMenuOrder("token");
            yield Show.update();
        }),
    }, exports.makeStaticMenu(), Clairvoyant.developFileListOnSightRootMenu.get("")(), Profiler.profile("makeSightRootMenu.core", () => Profiler.profile("makeSightRootMenu.sort", () => Object.entries(Scan.tokenDocumentEntryMap)
    .sort("token" === getRootMenuOrder() ?
    (a, b) => Comparer.string(a[0], b[0]) :
    Comparer.merge([
        Comparer.make((entry) => -Scan.tokenCountMap[entry[0]]),
        (a, b) => Comparer.string(a[0], b[0])
    ])))
    .map(entry => ({
    label: `$(tag) "${Clairvoyant.decodeToken(entry[0])}" ...`,
    description: undefined,
    detail: entry[1].map(i => ({
        uri: i,
        file: Scan.documentFileMap[i],
        hits: Scan.documentTokenEntryMap[i][entry[0]].length
    }))
        .sort(Comparer.merge([Comparer.make(d => -d.hits), Comparer.make(d => d.uri)]))
        .map(d => `$(file-text) ${d.file}(${d.hits})`)
        .join(", "),
    token: Clairvoyant.decodeToken(entry[0]),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat(makeSightTokenCoreMenu(Clairvoyant.decodeToken(entry[0])), makeSightTokenFileMenu(entry[0]), makeSightTokenFileShowMenu(entry[0])),
            options: {
                filePreview: Clairvoyant.enableLunaticPreview.get(""),
                matchOnDescription: true,
                matchOnDetail: true,
                token: Clairvoyant.decodeToken(entry[0]),
            },
        });
    })
}))))), exports.regularGotoFileMenuItem));
exports.makeSightDocumentRootMenu = (uri) => Profiler.profile("makeSightDocumentRootMenu", () => exports.makeEmptyList().concat(makeHistoryMenu(), makeQuickMenu(), makeHighlightDocumentRootMenu(uri), makeSightFileRootMenu(uri, Scan.documentTokenEntryMap[uri])));
exports.makeSightTokenRootMenu = (uri, token) => Profiler.profile("makeSightDocumentRootMenu", () => exports.makeEmptyList().concat(makeHistoryMenu(), makeQuickMenu(), makeHighlightRootMenu(), makeSightTokenCoreMenu(token), {
    label: `$(list-ordered) ${Locale.typeableMap("Show by file")} ...`,
    description: undefined,
    detail: Scan.tokenDocumentEntryMap[Clairvoyant.encodeToken(token)].map(i => ({
        uri: i,
        file: Scan.documentFileMap[i],
        hits: Scan.documentTokenEntryMap[i][Clairvoyant.encodeToken(token)].length
    }))
        .sort(Comparer.merge([Comparer.make(d => -d.hits), Comparer.make(d => d.uri)]))
        .map(d => `$(file-text) ${d.file}(${d.hits})`)
        .join(", "),
    token: token,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield Show.forward({
            makeItemList: () => exports.makeEmptyList().concat(makeSightTokenFileMenu(Clairvoyant.encodeToken(token)), makeSightTokenFileShowMenu(Clairvoyant.encodeToken(token))),
            options: {
                matchOnDescription: true,
                matchOnDetail: true,
                token: token,
            },
        });
    })
}, makeSightShowMenu(uri, token, Scan.documentTokenEntryMap[uri][Clairvoyant.encodeToken(token)])));
const makeGoToFileMenuItem = (uri, document) => ({
    label: `$(file-text) ${File.extractFileName(uri)}`,
    description: File.makeDescription(document),
    document: document,
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        yield vscode.window.showTextDocument(document, { preview: false });
    }),
    isTerm: true,
});
exports.makeLunaticGoToFileMenu = () => exports.getCacheOrMake("filelist.lunatic", () => Profiler.profile("makeLunaticGoToFileMenu", () => exports.makeEmptyList().concat(Object.entries(Scan.documentMap)
    .sort(Comparer.merge([Comparer.make(entry => File.extractDirectoryAndWorkspace(entry[0])), Comparer.make(entry => entry[0])]))
    .map(entry => makeGoToFileMenuItem(entry[0], entry[1])))));
//# sourceMappingURL=menu.js.map