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
const Clairvoyant = __importStar(require("../clairvoyant"));
const Menu = __importStar(require("../ui/menu"));
exports.make = (document, index, token) => Profiler.profile("Selection.make", () => new vscode.Selection(document.positionAt(index), document.positionAt(index + token.length)));
exports.toString = (selection) => {
    if (selection instanceof vscode.Range) {
        if (selection.start.line !== selection.end.line) {
            return `${exports.toString(selection.start)} - ${exports.toString(selection.end)}`;
        }
        else if (selection.start.character !== selection.end.character) {
            return `${exports.toString(selection.start)}-${exports.toString(selection.end.character)}`;
        }
        else {
            return exports.toString(selection.start);
        }
    }
    else if (selection instanceof vscode.Position) {
        return `line:${exports.toString(selection.line)} row:${exports.toString(selection.character)}`;
    }
    else {
        return `${selection + 1}`;
    }
};
exports.makeWhole = (document) => Profiler.profile("Selection.makeWhole", () => new vscode.Selection(document.positionAt(0), document.positionAt(document.getText().length)));
let lastValidViemColumn = 1;
exports.setLastValidViemColumn = (viewColumn) => lastValidViemColumn = viewColumn;
exports.getLastValidViemColumn = () => lastValidViemColumn;
exports.getLastTextEditor = (getter = (i => i)) => vscode.window.visibleTextEditors.filter(i => i.viewColumn === exports.getLastValidViemColumn()).map(getter)[0];
class Entry {
    constructor(viewColumn) {
        this.viewColumn = viewColumn;
        this.showTokenUndoBuffer = [];
        this.showTokenRedoBuffer = [];
        this.backupTargetTextEditor = undefined;
        this.groundBackupSelectionEntry = null;
        this.targetBackupSelectionEntry = null;
        this.lastPreviewSelectionEntry = null;
        this.previewViewColumn = 1;
        this.showTextDocumentWithBackupSelection = (document) => __awaiter(this, void 0, void 0, function* () {
            Clairvoyant.outputLine("verbose", `Selection.Entry(${this.viewColumn}).showTextDocumentWithBackupSelection() is called.`);
            this.previewViewColumn = exports.getLastValidViemColumn();
            this.groundBackupSelectionEntry = makeShowTokenCoreEntry();
            if (undefined === document || (this.groundBackupSelectionEntry && this.groundBackupSelectionEntry.document.uri.toString() === document.uri.toString())) {
                this.targetBackupSelectionEntry = null;
            }
            else {
                Clairvoyant.outputLine("verbose", `showTextDocument("${document.fileName}", viewColumn: ${this.previewViewColumn})`);
                yield vscode.window.showTextDocument(document, this.previewViewColumn);
                this.targetBackupSelectionEntry = makeShowTokenCoreEntry();
            }
            this.lastPreviewSelectionEntry = null;
            this.backupTargetTextEditor = vscode.window.activeTextEditor;
        });
        this.previewSelection = (entry) => {
            const textEditor = vscode.window.visibleTextEditors.filter(i => i.viewColumn === this.previewViewColumn)[0];
            if (textEditor) {
                Clairvoyant.outputLine("verbose", `previewSelection.viewColumn: ${this.previewViewColumn}`);
                revealSelection(textEditor, entry.selection);
                this.lastPreviewSelectionEntry = entry;
            }
        };
        this.rollbackSelection = () => __awaiter(this, void 0, void 0, function* () {
            Clairvoyant.outputLine("verbose", `Selection.Entry(${this.viewColumn}).rollbackSelection() is called.`);
            if (this.lastPreviewSelectionEntry) {
                if (Clairvoyant.enablePreviewIntercept.get("")) {
                    const currentSelectionEntry = makeShowTokenCoreEntry();
                    if (currentSelectionEntry &&
                        this.lastPreviewSelectionEntry.document.uri.toString() === currentSelectionEntry.document.uri.toString() &&
                        !this.lastPreviewSelectionEntry.selection.isEqual(currentSelectionEntry.selection) &&
                        this.backupTargetTextEditor === vscode.window.activeTextEditor) {
                        this.targetBackupSelectionEntry = null;
                        this.groundBackupSelectionEntry = null;
                        const data = {
                            entry: this.lastPreviewSelectionEntry,
                        };
                        setTimeout(() => this.previewSelection(data.entry), 0);
                    }
                }
                this.lastPreviewSelectionEntry = null;
            }
            if (this.targetBackupSelectionEntry) {
                this.previewSelection(this.targetBackupSelectionEntry);
                this.targetBackupSelectionEntry = null;
            }
            if (this.groundBackupSelectionEntry) {
                showSelection(this.groundBackupSelectionEntry, yield vscode.window.showTextDocument(this.groundBackupSelectionEntry.document, this.backupTargetTextEditor ?
                    this.backupTargetTextEditor.viewColumn :
                    undefined));
                this.groundBackupSelectionEntry = null;
            }
            this.backupTargetTextEditor = undefined;
        });
        this.dispose = (commitable) => __awaiter(this, void 0, void 0, function* () {
            if (!commitable) {
                yield this.rollbackSelection();
            }
        });
        this.showToken = (entry) => __awaiter(this, void 0, void 0, function* () {
            Clairvoyant.outputLine("verbose", `Selection.Entry(${this.viewColumn}).showToken() is called.`);
            this.showTokenUndoBuffer.push({
                redo: entry,
                undo: this.groundBackupSelectionEntry || makeShowTokenCoreEntry(),
            });
            showSelection(entry);
            this.showTokenRedoBuffer.splice(0, 0);
            onUpdateHistory();
        });
        this.showTokenUndo = () => __awaiter(this, void 0, void 0, function* () {
            Clairvoyant.outputLine("verbose", `Selection.Entry(${this.viewColumn}).showTokenUndo() is called.`);
            const entry = this.showTokenUndoBuffer.pop();
            if (entry) {
                if (entry.undo) {
                    showSelection(entry.undo);
                }
                this.showTokenRedoBuffer.push(entry);
                onUpdateHistory();
            }
        });
        this.showTokenRedo = () => __awaiter(this, void 0, void 0, function* () {
            Clairvoyant.outputLine("verbose", `Selection.Entry(${this.viewColumn}).showTokenRedo() is called.`);
            const entry = this.showTokenRedoBuffer.pop();
            if (entry) {
                entry.undo = makeShowTokenCoreEntry() || entry.undo;
                showSelection(entry.redo);
                this.showTokenUndoBuffer.push(entry);
                onUpdateHistory();
            }
        });
    }
}
const entryMap = {};
exports.getEntry = () => {
    const key = Clairvoyant.gotoHistoryMode.get("")(exports.getLastValidViemColumn());
    if (!entryMap[key]) {
        entryMap[key] = new Entry(key);
    }
    return entryMap[key];
};
const revealSelection = (textEditor, selection) => {
    textEditor.selection = selection;
    textEditor.revealRange(selection, Clairvoyant.textEditorRevealType.get(textEditor.document.languageId));
};
const showSelection = (entry, textEditor) => __awaiter(void 0, void 0, void 0, function* () {
    revealSelection(textEditor || (yield vscode.window.showTextDocument(entry.document)), entry.selection);
});
const makeShowTokenCoreEntry = () => {
    let result = null;
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        result =
            {
                document: activeTextEditor.document,
                selection: activeTextEditor.selection,
            };
    }
    return result;
};
const onUpdateHistory = () => {
    Clairvoyant.outputLine("verbose", `onUpdateHistory() is called.`);
    Menu.removeCache(`root.full`);
};
exports.reload = () => {
    Object.keys(entryMap).forEach(i => delete entryMap[i]);
};
var Log;
(function (Log) {
    const latests = {};
    const recentDocuments = {};
    Log.getLatest = (viemColumn, uri) => {
        const documentSelectionMap = latests[viemColumn];
        if (undefined !== documentSelectionMap) {
            const selection = documentSelectionMap[uri];
            if (undefined !== selection) {
                return selection;
            }
        }
        return undefined;
    };
    Log.update = (current) => {
        if (undefined !== current.viewColumn) {
            const uri = current.document.uri.toString();
            if (undefined === latests[current.viewColumn]) {
                latests[current.viewColumn] = {};
            }
            latests[current.viewColumn][uri] = current.selection;
            if (undefined === recentDocuments[current.viewColumn]) {
                recentDocuments[current.viewColumn] = [];
            }
            recentDocuments[current.viewColumn] = [uri].concat(recentDocuments[current.viewColumn].filter(i => i !== uri));
        }
    };
})(Log = exports.Log || (exports.Log = {}));
var PreviewTextEditor;
(function (PreviewTextEditor) {
    let IsLunatic;
    PreviewTextEditor.make = () => __awaiter(this, void 0, void 0, function* () {
        IsLunatic =
            !vscode.workspace.getConfiguration("workbench.editor")["enablePreview"] &&
                Clairvoyant.enableLunaticPreview.get("");
        IsLunatic ?
            yield LunaticPreviewTextEditor.make() :
            yield RegularPreviewTextEditor.make();
    });
    PreviewTextEditor.show = (previewDocument) => __awaiter(this, void 0, void 0, function* () {
        return IsLunatic ?
            yield LunaticPreviewTextEditor.show(previewDocument) :
            yield RegularPreviewTextEditor.show(previewDocument);
    });
    PreviewTextEditor.dispose = (commitable) => __awaiter(this, void 0, void 0, function* () {
        return IsLunatic ?
            yield LunaticPreviewTextEditor.dispose(commitable) :
            yield RegularPreviewTextEditor.dispose(commitable);
    });
})(PreviewTextEditor = exports.PreviewTextEditor || (exports.PreviewTextEditor = {}));
var LunaticPreviewTextEditor;
(function (LunaticPreviewTextEditor) {
    let backupDocument;
    let lastPreviewDocument;
    let document;
    let textEditor;
    let viewColumn;
    LunaticPreviewTextEditor.make = () => __awaiter(this, void 0, void 0, function* () {
        Clairvoyant.outputLine("verbose", `LunaticPreviewTextEditor.make.viewColumn: ${viewColumn}`);
        viewColumn = exports.getLastValidViemColumn();
        const oldTextEditor = exports.getLastTextEditor();
        backupDocument = oldTextEditor ? oldTextEditor.document : undefined;
        document = yield vscode.workspace.openTextDocument();
        textEditor = yield vscode.window.showTextDocument(document, { viewColumn, preserveFocus: true, preview: true });
        if (backupDocument) {
            yield LunaticPreviewTextEditor.show(backupDocument);
        }
    });
    LunaticPreviewTextEditor.show = (previewDocument) => __awaiter(this, void 0, void 0, function* () {
        if (lastPreviewDocument !== previewDocument) {
            lastPreviewDocument = previewDocument;
            const targetDocument = previewDocument || backupDocument;
            if (undefined !== targetDocument) {
                yield textEditor.edit(editBuilder => editBuilder.replace(exports.makeWhole(document), targetDocument.getText()));
                yield vscode.languages.setTextDocumentLanguage(document, targetDocument.languageId);
                revealSelection(textEditor, Log.getLatest(viewColumn, targetDocument.uri.toString()) ||
                    new vscode.Selection(document.positionAt(0), document.positionAt(0)));
            }
        }
    });
    LunaticPreviewTextEditor.dispose = (commitable) => __awaiter(this, void 0, void 0, function* () {
        textEditor = yield vscode.window.showTextDocument(document, viewColumn);
        yield textEditor.edit(editBuilder => editBuilder.delete(exports.makeWhole(document)));
        yield vscode.commands.executeCommand("workbench.action.closeActiveEditor");
        if (undefined !== lastPreviewDocument && commitable) {
            yield vscode.window.showTextDocument(lastPreviewDocument, viewColumn);
            revealSelection(textEditor, Log.getLatest(viewColumn, lastPreviewDocument.uri.toString()) ||
                new vscode.Selection(lastPreviewDocument.positionAt(0), lastPreviewDocument.positionAt(0)));
        }
    });
})(LunaticPreviewTextEditor = exports.LunaticPreviewTextEditor || (exports.LunaticPreviewTextEditor = {}));
var RegularPreviewTextEditor;
(function (RegularPreviewTextEditor) {
    let backupDocument;
    let lastPreviewDocument;
    let backupTextEditor;
    let backupSelectionEntry = null;
    let viewColumn;
    RegularPreviewTextEditor.make = () => __awaiter(this, void 0, void 0, function* () {
        viewColumn = exports.getLastValidViemColumn();
        const oldTextEditor = exports.getLastTextEditor();
        backupDocument = oldTextEditor ? oldTextEditor.document : undefined;
    });
    RegularPreviewTextEditor.show = (previewDocument) => __awaiter(this, void 0, void 0, function* () {
        if (lastPreviewDocument !== previewDocument) {
            if (undefined !== lastPreviewDocument) {
                restoreSelection();
            }
            lastPreviewDocument = previewDocument;
            const targetDocument = previewDocument || backupDocument;
            if (undefined !== targetDocument) {
                const textEditor = yield vscode.window.showTextDocument(targetDocument, { viewColumn, preserveFocus: true, preview: true });
                backupSelection(textEditor);
                revealSelection(textEditor, Log.getLatest(viewColumn, targetDocument.uri.toString()) ||
                    new vscode.Selection(targetDocument.positionAt(0), targetDocument.positionAt(0)));
            }
        }
    });
    RegularPreviewTextEditor.dispose = (commitable) => __awaiter(this, void 0, void 0, function* () {
        if (backupDocument !== lastPreviewDocument) {
            if (commitable) {
                if (undefined !== lastPreviewDocument) {
                    yield vscode.window.showTextDocument(lastPreviewDocument, { viewColumn, preview: false });
                }
            }
            else {
                if (undefined !== backupDocument) {
                    restoreSelection();
                    yield vscode.window.showTextDocument(backupDocument, viewColumn);
                }
            }
        }
    });
    const backupSelection = (textEditor) => {
        backupTextEditor = textEditor;
        backupSelectionEntry = makeShowTokenCoreEntry();
    };
    const restoreSelection = () => __awaiter(this, void 0, void 0, function* () {
        if (backupSelectionEntry && backupTextEditor) {
            showSelection(backupSelectionEntry, backupTextEditor);
            backupSelectionEntry = null;
            backupTextEditor = undefined;
        }
    });
})(RegularPreviewTextEditor = exports.RegularPreviewTextEditor || (exports.RegularPreviewTextEditor = {}));
//# sourceMappingURL=selection.js.map