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
const Clairvoyant = __importStar(require("../clairvoyant"));
exports.cache = {};
exports.removeCache = (key) => {
    Clairvoyant.outputLine("verbose", `Change.removeCache("${key}") is called.`);
    Object.keys(exports.cache).filter(i => i.startsWith(key)).forEach(i => delete exports.cache[i]);
    return key;
};
exports.getCacheOrMake = (textEditor, itemMaker) => __awaiter(void 0, void 0, void 0, function* () {
    const uri = textEditor.document.uri.toString();
    if (!exports.cache[uri]) {
        exports.cache[uri] = yield itemMaker(textEditor);
    }
    return exports.cache[uri];
});
exports.get = () => __awaiter(void 0, void 0, void 0, function* () {
    return vscode.window.activeTextEditor ?
        yield exports.getCacheOrMake(vscode.window.activeTextEditor, (textEditor) => __awaiter(void 0, void 0, void 0, function* () {
            const result = [];
            const backup = textEditor.selections;
            const first = textEditor.selection;
            while (true) {
                yield vscode.commands.executeCommand("workbench.action.editor.nextChange");
                if (first.start !== textEditor.selection.start && 0 <= result.filter(i => i.start === textEditor.selection.start).length) {
                    result.push(textEditor.selection);
                }
                else {
                    break;
                }
            }
            textEditor.selections = backup;
            return result;
        })) :
        [];
});
//# sourceMappingURL=change.js.map