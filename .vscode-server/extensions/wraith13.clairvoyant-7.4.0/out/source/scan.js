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
const Locale = __importStar(require("./lib/locale"));
const File = __importStar(require("./lib/file"));
const Clairvoyant = __importStar(require("./clairvoyant"));
const Menu = __importStar(require("./ui/menu"));
const Selection = __importStar(require("./textEditor/selection"));
const Changes = __importStar(require("./textEditor/changes"));
const regExpExecToArray = (regexp, text) => Profiler.profile(`regExpExecToArray(/${regexp.source}/${regexp.flags})`, () => {
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
const toUri = (uri) => "string" === typeof (uri) ? vscode.Uri.parse(uri) : uri;
const getDocument = (uri) => vscode.workspace.textDocuments.filter(document => document.uri.toString() === uri.toString())[0];
const getOrOpenDocument = (uri) => __awaiter(void 0, void 0, void 0, function* () { return exports.documentMap[uri.toString()] || getDocument(uri) || (yield vscode.workspace.openTextDocument(toUri(uri))); });
const getFiles = (folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Clairvoyant.outputLine("regular", `scan directory ${folder.toString()}`);
        const rawFiles = (yield vscode.workspace.fs.readDirectory(folder)).filter(i => !Clairvoyant.startsWithDot(i[0]));
        const folders = rawFiles.filter(i => vscode.FileType.Directory === i[1]).map(i => i[0]).filter(i => Clairvoyant.excludeDirectories.get("").indexOf(i) < 0);
        const files = rawFiles.filter(i => vscode.FileType.File === i[1]).map(i => i[0]).filter(i => !Clairvoyant.isExcludeFile(i));
        return files.map(i => vscode.Uri.parse(folder.toString() + "/" + i))
            .concat((yield Promise.all(folders.map(i => getFiles(vscode.Uri.parse(folder.toString() + "/" + i)))))
            .reduce((a, b) => a.concat(b), []));
    }
    catch (error) {
        Clairvoyant.outputLine("silent", `${folder.toString()}: ${JSON.stringify(error)}`);
        return [];
    }
});
exports.documentTokenEntryMap = {};
exports.tokenDocumentEntryMap = {};
exports.documentFileMap = {};
exports.tokenCountMap = {};
exports.documentMap = {};
exports.isMaxFilesNoticed = false;
exports.reload = () => {
    Clairvoyant.outputLine("verbose", `Scan.reload() is called.`);
    Object.keys(exports.documentTokenEntryMap).forEach(i => delete exports.documentTokenEntryMap[i]);
    Object.keys(exports.tokenDocumentEntryMap).forEach(i => delete exports.tokenDocumentEntryMap[i]);
    Object.keys(exports.documentFileMap).forEach(i => delete exports.documentFileMap[i]);
    Object.keys(exports.tokenCountMap).forEach(i => delete exports.tokenCountMap[i]);
    Object.keys(exports.documentMap).forEach(i => delete exports.documentMap[i]);
    exports.isMaxFilesNoticed = false;
};
exports.onUpdateTokens = () => {
    Clairvoyant.outputLine("verbose", `Scan.onUpdateTokens() is called.`);
    Menu.removeCache("root");
    Menu.removeCache("filelist");
};
exports.onUpdateFileList = () => {
    Clairvoyant.outputLine("verbose", `Scan.onUpdateFileList() is called.`);
    Menu.removeCache("filelist");
};
exports.onUpdateDocument = (uri) => {
    Clairvoyant.outputLine("verbose", `Scan.onUpdateDocument("${uri}") is called.`);
    Menu.removeCache(uri);
    Menu.removePreviewCache(uri);
    Changes.removeCache(uri);
};
exports.isScanedDocment = (document) => undefined !== exports.documentTokenEntryMap[document.uri.toString()];
exports.scanDocument = (document, force = false) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Clairvoyant.busy.do(() => Profiler.profile("Scan.scanDocument", () => {
        const uri = document.uri.toString();
        Clairvoyant.outputLine("verbose", `Scan.scanDocument("${uri}", ${force}) is called.`);
        if ((!force && exports.isScanedDocment(document)) || !Clairvoyant.isTargetProtocol(uri)) {
            console.log(`scanDocument SKIP: ${uri}`);
        }
        else {
            if (!exports.documentFileMap[uri] && Clairvoyant.maxFiles.get("") <= Object.keys(exports.documentMap).length) {
                if (!exports.isMaxFilesNoticed) {
                    exports.isMaxFilesNoticed = true;
                    vscode.window.showWarningMessage(Locale.map("Max Files Error"));
                    Clairvoyant.outputLine("silent", `Max Files Error!!!`);
                }
            }
            else {
                Clairvoyant.outputLine("regular", `scan document: ${uri}`);
                exports.documentMap[uri] = document;
                exports.documentFileMap[uri] = File.extractFileName(uri);
                const text = Profiler.profile("scanDocument.document.getText", () => document.getText());
                const hits = Profiler.profile("scanDocument.scan", () => regExpExecToArray(new RegExp(Clairvoyant.parserRegExp.get(document.languageId), "gm"), text)
                    .map(match => ({
                    token: match[0],
                    index: match.index,
                })));
                const map = {};
                Profiler.profile("scanDocument.summary", () => {
                    hits.forEach(hit => {
                        const key = Clairvoyant.encodeToken(hit.token);
                        if (!map[key]) {
                            map[key] = [];
                        }
                        map[key].push(hit.index);
                    });
                });
                Profiler.profile("scanDocument.register", () => {
                    const old = exports.documentTokenEntryMap[uri];
                    exports.documentTokenEntryMap[uri] = map;
                    const oldTokens = old ? Object.keys(old) : [];
                    const newTokens = Object.keys(map);
                    oldTokens.filter(i => newTokens.indexOf(i) < 0).forEach(i => {
                        exports.tokenDocumentEntryMap[i].splice(exports.tokenDocumentEntryMap[i].indexOf(uri), 1);
                        if (exports.tokenDocumentEntryMap[i].length <= 0) {
                            delete exports.tokenDocumentEntryMap[i];
                        }
                    });
                    newTokens.filter(i => oldTokens.indexOf(i) < 0).forEach(i => {
                        if (!exports.tokenDocumentEntryMap[i]) {
                            exports.tokenDocumentEntryMap[i] = [];
                        }
                        exports.tokenDocumentEntryMap[i].push(uri);
                    });
                    oldTokens.forEach(i => exports.tokenCountMap[i] -= old[i].length);
                    newTokens.forEach(i => {
                        if (!exports.tokenCountMap[i]) {
                            exports.tokenCountMap[i] = 0;
                        }
                        exports.tokenCountMap[i] += map[i].length;
                    });
                    if (!old) {
                        exports.onUpdateFileList();
                        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.toString() === uri) {
                            Clairvoyant.setIsDocumentScanedWithClairvoyant(true);
                        }
                    }
                    exports.onUpdateTokens();
                    exports.onUpdateDocument(uri);
                });
            }
        }
    }));
});
exports.detachDocument = (document) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Clairvoyant.busy.do(() => Profiler.profile("Scan.detachDocument", () => {
        if (exports.isScanedDocment(document)) {
            const uri = document.uri.toString();
            Clairvoyant.outputLine("regular", `detach document: ${uri}`);
            const old = exports.documentTokenEntryMap[uri];
            const oldTokens = old ? Object.keys(old) : [];
            oldTokens.forEach(i => {
                exports.tokenDocumentEntryMap[i].splice(exports.tokenDocumentEntryMap[i].indexOf(uri), 1);
                if (exports.tokenDocumentEntryMap[i].length <= 0) {
                    delete exports.tokenDocumentEntryMap[i];
                }
            });
            oldTokens.forEach(i => exports.tokenCountMap[i] -= old[i].length);
            delete exports.documentTokenEntryMap[uri];
            delete exports.documentFileMap[uri];
            delete exports.documentMap[uri];
            exports.onUpdateFileList();
            exports.onUpdateTokens();
            exports.onUpdateDocument(uri);
        }
    }));
});
exports.scanOpenDocuments = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield Clairvoyant.busy.doAsync(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(vscode.window.visibleTextEditors
            .filter(i => Clairvoyant.isTargetProtocol(i.document.uri.toString()))
            .map((i) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.scanDocument(i.document); })));
    }));
});
exports.scanWorkspace = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield Clairvoyant.busy.doAsync(() => __awaiter(void 0, void 0, void 0, function* () {
        Clairvoyant.outputLine("regular", `begin scan workspace`);
        yield exports.scanOpenDocuments();
        if (vscode.workspace.workspaceFolders) {
            const files = (yield Promise.all(vscode.workspace.workspaceFolders.map(i => getFiles(i.uri))))
                .reduce((a, b) => a.concat(b), []);
            if (Clairvoyant.maxFiles.get("") <= Object.keys(exports.documentMap)
                .concat(files.map(i => i.toString()))
                .filter((i, index, self) => index === self.indexOf(i))
                .length) {
                vscode.window.showWarningMessage(Locale.map("Max Files Error"));
                Clairvoyant.outputLine("silent", `Max Files Error!!!`);
            }
            else {
                yield Promise.all(files.map((i) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        Clairvoyant.outputLine("regular", `open document: ${i}`);
                        yield exports.scanDocument(yield getOrOpenDocument(i));
                    }
                    catch (error) {
                        Clairvoyant.outputLine("silent", `error: ${JSON.stringify(error)}`);
                    }
                })));
            }
            Clairvoyant.outputLine("regular", `scan workspace complete!`);
        }
    }));
});
exports.seek = (textEditor, receiver) => Profiler.profile("Scan.seek", () => {
    const document = textEditor.document;
    if (exports.isScanedDocment(document)) {
        const map = exports.documentTokenEntryMap[document.uri.toString()];
        const entries = Object.entries(map);
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            const token = Clairvoyant.decodeToken(entry[0]);
            const hits = entry[1];
            for (let j = 0; j < hits.length; ++j) {
                const hit = hits[j];
                const selection = Selection.make(document, hit, token);
                if (undefined !== selection.intersection(textEditor.selection)) {
                    return receiver(token, hits, j);
                }
            }
        }
    }
    return undefined;
});
exports.getSeekResult = (textEditor) => exports.seek(textEditor, (token, hits, i) => ({ token, hits, i }));
exports.getToken = (textEditor) => exports.seek(textEditor, token => token);
exports.getFirstTokenSelection = (textEditor) => exports.seek(textEditor, (token, hits, _i) => Selection.make(textEditor.document, hits[0], token));
exports.getNextTokenSelection = (textEditor) => exports.seek(textEditor, (token, hits, i) => Selection.make(textEditor.document, hits[(i + 1) % hits.length], token));
exports.getPreviousTokenSelection = (textEditor) => exports.seek(textEditor, (token, hits, i) => Selection.make(textEditor.document, hits[(i - 1 + hits.length) % hits.length], token));
//# sourceMappingURL=scan.js.map