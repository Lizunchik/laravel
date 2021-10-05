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
const timeout = (wait) => new Promise((resolve) => setTimeout(resolve, wait));
class Entry {
    constructor(stateReceiver) {
        this.stateReceiver = stateReceiver;
        this.busyStackCount = 0;
        this.do = (busyFunction) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.incrementBusy();
                return busyFunction();
            }
            finally {
                yield this.decrementBusy();
            }
        });
        this.doAsync = (busyFunction) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.incrementBusy();
                return yield busyFunction();
            }
            finally {
                yield this.decrementBusy();
            }
        });
        this.isBusy = () => 0 < this.busyStackCount;
        this.incrementBusy = () => __awaiter(this, void 0, void 0, function* () {
            if (this.isBusy()) {
                ++this.busyStackCount;
            }
            else {
                ++this.busyStackCount;
                yield this.updateState();
            }
        });
        this.decrementBusy = () => __awaiter(this, void 0, void 0, function* () {
            --this.busyStackCount;
            if (!this.isBusy()) {
                yield this.updateState();
            }
        });
        this.updateState = () => __awaiter(this, void 0, void 0, function* () {
            this.stateReceiver(this);
            yield timeout(1);
        });
    }
}
exports.Entry = Entry;
//# sourceMappingURL=busy.js.map