"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
exports.extractDirectoryAndWorkspace = (path) => {
    const dir = exports.extractDirectory(path);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(dir));
    return workspaceFolder && path.startsWith(workspaceFolder.uri.toString()) ?
        (vscode.workspace.workspaceFolders && 2 <= vscode.workspace.workspaceFolders.length ?
            `${workspaceFolder.name}: ${dir.substring(workspaceFolder.uri.toString().length)}` :
            `${dir.substring(workspaceFolder.uri.toString().length)}`) :
        dir;
};
exports.extractDirectory = (path) => path.substr(0, path.length - exports.extractFileName(path).length);
exports.extractFileName = (path) => path.split('\\').reverse()[0].split('/').reverse()[0];
exports.makeDigest = (text) => text.replace(/\s+/g, " ").substr(0, 128);
exports.makeDescription = (document) => document.uri.toString().startsWith("untitled:") ?
    exports.makeDigest(document.getText()) :
    exports.extractDirectoryAndWorkspace(document.uri.toString());
exports.extractRelativePath = (path) => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(path));
    return workspaceFolder && path.startsWith(workspaceFolder.uri.toString()) ? path.substring(workspaceFolder.uri.toString().length) : path;
};
//# sourceMappingURL=file.js.map