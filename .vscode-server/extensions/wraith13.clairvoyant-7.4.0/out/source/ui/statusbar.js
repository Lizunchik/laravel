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
const Profiler = __importStar(require("../lib/profiler"));
const Locale = __importStar(require("../lib/locale"));
const Clairvoyant = __importStar(require("../clairvoyant"));
const create = (properties) => {
    const result = vscode.window.createStatusBarItem(properties.alignment);
    if (undefined !== properties.text) {
        result.text = properties.text;
    }
    if (undefined !== properties.command) {
        result.command = properties.command;
    }
    if (undefined !== properties.tooltip) {
        result.tooltip = properties.tooltip;
    }
    return result;
};
let eyeLabel;
exports.make = () => eyeLabel = create({
    alignment: vscode.StatusBarAlignment.Right,
    text: "$(eye)",
    command: `clairvoyant.sight`,
    tooltip: Locale.map("clairvoyant.sight.title")
});
exports.update = () => Profiler.profile("StatusBar.update", () => {
    if (Clairvoyant.showStatusBarItems.get("")) {
        if (Clairvoyant.busy.isBusy()) {
            eyeLabel.text = "$(sync~spin)";
            eyeLabel.tooltip = `Clairvoyant: ${Locale.map("clairvoyant.sight.busy")}`;
        }
        else {
            eyeLabel.text = "$(eye)";
            eyeLabel.tooltip = `Clairvoyant: ${Locale.map("clairvoyant.sight.title")}`;
        }
        eyeLabel.show();
    }
    else {
        eyeLabel.hide();
    }
});
//# sourceMappingURL=statusbar.js.map