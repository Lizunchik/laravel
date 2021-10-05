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
const phi_colors_1 = require("phi-colors");
const Profiler = __importStar(require("../lib/profiler"));
const cache_1 = require("../lib/cache");
const Clairvoyant = __importStar(require("../clairvoyant"));
const Scan = __importStar(require("../scan"));
const Menu = __importStar(require("../ui/menu"));
const Selection = __importStar(require("../textEditor/selection"));
exports.hash = (source) => source.split("").map(i => i.codePointAt(0) || 0).reduce((a, b) => (a * 173 + b + ((a & 0x5555) >>> 5)) & 8191)
    % 34; // ← 通常、こういうところの数字は素数にすることが望ましいがここについては https://wraith13.github.io/phi-ratio-coloring/phi-ratio-coloring.htm で類似色の出てくる周期をベース(8,13,21,...)に調整すること。
let decorations = {};
let hslaCache = new cache_1.Cache((color) => phi_colors_1.phiColors.rgbaToHsla(phi_colors_1.phiColors.rgbaFromStyle(color)));
exports.makeHueDecoration = (name, hue, alpha, overviewRulerLane, isWholeLine) => ({
    name,
    base: hslaCache.get("number" === typeof hue ?
        Clairvoyant.highlightBaseColor.get("") :
        hue),
    hue: "number" === typeof hue ? hue : 0,
    alpha: alpha.get(""),
    overviewRulerLane: overviewRulerLane,
    isWholeLine,
});
exports.createTextEditorDecorationType = (backgroundColor, overviewRulerLane, isWholeLine) => vscode.window.createTextEditorDecorationType({
    backgroundColor: backgroundColor,
    overviewRulerColor: undefined !== overviewRulerLane ? backgroundColor : undefined,
    overviewRulerLane: overviewRulerLane,
    isWholeLine,
});
exports.addDecoration = (entry) => {
    const key = JSON.stringify(entry.decorationParam);
    if (!decorations[key]) {
        decorations[key] =
            {
                decorator: exports.createTextEditorDecorationType(phi_colors_1.phiColors.rgbForStyle(phi_colors_1.phiColors.hslaToRgba(phi_colors_1.phiColors.generate(entry.decorationParam.base, entry.decorationParam.hue, 0, 0, 0)))
                    + ((0x100 + entry.decorationParam.alpha).toString(16)).substr(1), entry.decorationParam.overviewRulerLane, entry.decorationParam.isWholeLine),
                rangesOrOptions: []
            };
    }
    decorations[key].rangesOrOptions.push(entry.range);
};
let activeSelection = undefined;
let latestToken = undefined;
let backupLatestToken = undefined;
let tokens = [];
exports.reload = () => {
    activeSelection = undefined;
    latestToken = undefined;
    backupLatestToken = undefined;
    tokens = [];
    exports.update();
    Object.keys(decorations).forEach(i => decorations[i].decorator.dispose());
    decorations = {};
    onUpdateToken("");
};
exports.getHighlight = () => undefined !== latestToken ? tokens.filter(i => i !== latestToken).concat([latestToken]) : tokens;
exports.isHighlighted = (token) => 0 <= exports.getHighlight().indexOf(token);
exports.add = (token) => {
    tokens.push(token);
    onUpdateToken(token);
    exports.update();
};
exports.remove = (token) => {
    if (latestToken === token) {
        latestToken = undefined;
    }
    tokens = tokens.filter(i => i !== token);
    onUpdateToken(token);
    exports.update();
};
exports.toggle = (token) => exports.isHighlighted(token) ? exports.remove(token) : exports.add(token);
var Preview;
(function (Preview) {
    Preview.backup = () => {
        if (undefined === backupLatestToken) {
            backupLatestToken = latestToken;
        }
    };
    Preview.showToken = (token) => {
        latestToken = token;
        exports.update();
    };
    Preview.showSelection = (slection) => {
        activeSelection = slection;
        exports.update();
    };
    Preview.commit = () => {
        if (undefined !== backupLatestToken && Clairvoyant.highlightMode.get("").trail) {
            onUpdateToken(backupLatestToken);
        }
        activeSelection = undefined;
        backupLatestToken = undefined;
        if (latestToken) {
            tokens = tokens.filter(i => i !== latestToken);
            tokens.push(latestToken);
            onUpdateToken(latestToken);
        }
        exports.update();
    };
    Preview.rollback = () => {
        activeSelection = undefined;
        latestToken = backupLatestToken;
        backupLatestToken = undefined;
        exports.update();
    };
    Preview.dispose = (commitable) => commitable ? Preview.commit() : Preview.rollback();
})(Preview = exports.Preview || (exports.Preview = {}));
const onUpdateToken = (token) => {
    Clairvoyant.outputLine("verbose", `onUpdateToken() is called.`);
    Menu.removeCache(`filelist.${token}`);
};
exports.update = () => {
    Clairvoyant.outputLine("verbose", `Highlight.update() is called.`);
    vscode.window.visibleTextEditors
        .filter(textEditor => Clairvoyant.isTargetEditor(textEditor) &&
        Clairvoyant.autoScanMode.get(textEditor.document.languageId).enabled &&
        !Clairvoyant.isExcludeDocument(textEditor.document))
        .forEach(i => exports.updateEditor(i));
};
exports.updateEditor = (textEditor) => Profiler.profile("Highlight.updateEditor", () => {
    Clairvoyant.outputLine("verbose", `Highlight.updateEditor() is called.`);
    Profiler.profile("Highlight.updateEditor.clear", () => Object.keys(decorations).forEach(i => decorations[i].rangesOrOptions = []));
    const document = textEditor.document;
    const tokenHits = Scan.documentTokenEntryMap[document.uri.toString()] || {};
    let entries = [];
    if (undefined !== latestToken) {
        if (activeSelection && activeSelection.document.uri.toString() === document.uri.toString()) {
            //  line
            entries.push({
                range: document.lineAt(activeSelection.selection.active.line).range,
                decorationParam: exports.makeHueDecoration(`line`, exports.hash(latestToken), Clairvoyant.activeHighlightLineAlpha, undefined, true)
            });
            //  token
            entries.push({
                range: activeSelection.selection,
                decorationParam: exports.makeHueDecoration(`active.token:${latestToken}`, exports.hash(latestToken), Clairvoyant.activeHighlightAlpha, Clairvoyant.activeHighlightOverviewRulerLane.get(""), false)
            });
        }
        const validLatestToken = latestToken; // TypeScript の警告除け( 警告が出る方がおかしい状況なんだけど。。。 )
        entries = entries.concat((tokenHits[Clairvoyant.encodeToken(validLatestToken)] || []).map(hit => ({
            range: Selection.make(document, hit, validLatestToken),
            decorationParam: exports.makeHueDecoration(`latest.token:${validLatestToken}`, exports.hash(validLatestToken), Clairvoyant.latestHighlightAlpha, Clairvoyant.latestHighlightOverviewRulerLane.get(""), false)
        })));
    }
    tokens.filter(i => latestToken !== i).forEach(token => entries = entries.concat((tokenHits[Clairvoyant.encodeToken(token)] || []).map(hit => ({
        range: Selection.make(document, hit, token),
        decorationParam: exports.makeHueDecoration(`token:${token}`, exports.hash(token), Clairvoyant.highlightAlpha, Clairvoyant.highlightOverviewRulerLane.get(""), false)
    }))));
    entries.forEach(i => exports.addDecoration(i));
    Profiler.profile("Highlight.updateEditor.apply", () => Object.keys(decorations)
        .map(i => decorations[i])
        .forEach(i => textEditor.setDecorations(i.decorator, i.rangesOrOptions)));
});
//# sourceMappingURL=highlight.js.map