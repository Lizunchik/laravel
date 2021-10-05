"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getTicks = () => new Date().getTime();
var Profiler;
(function (Profiler) {
    let profileScore = {};
    let entryStack = [];
    let isProfiling = false;
    let startAt = 0;
    let endAt = 0;
    let debugCount = 0;
    class ProfileEntry {
        constructor(name) {
            this.name = name;
            this.childrenTicks = 0;
            if (isProfiling) {
                this.startTicks = getTicks();
                entryStack.push(this);
                if (this.name.startsWith("DEBUG:")) {
                    ++debugCount;
                }
                Profiler.debug(`${"*".repeat(entryStack.length)} ${this.name} begin`);
            }
            else {
                this.startTicks = 0;
            }
        }
        end() {
            if (0 !== this.startTicks) {
                Profiler.debug(`${"*".repeat(entryStack.length)} ${this.name} end`);
                if (this.name.startsWith("DEBUG:")) {
                    --debugCount;
                }
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
    Profiler.debug = (text, object) => {
        if (0 < debugCount) {
            if (undefined !== object) {
                console.log(text);
            }
            else {
                console.log(`${text}: ${JSON.stringify(object)}`);
            }
        }
    };
})(Profiler = exports.Profiler || (exports.Profiler = {}));
//# sourceMappingURL=profile.js.map