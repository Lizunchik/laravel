"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simple = (a, b) => a < b ? -1 :
    b < a ? 1 :
        0;
exports.make = (getValue) => (a, b) => exports.simple(getValue(a), getValue(b));
exports.string = (a, b) => a.toLowerCase() < b.toLowerCase() ? -1 :
    b.toLowerCase() < a.toLowerCase() ? 1 :
        exports.simple(a, b);
exports.merge = (comparerList) => (a, b) => {
    let result = 0;
    for (let i = 0; i < comparerList.length && 0 === result; ++i) {
        result = comparerList[i](a, b);
    }
    return result;
};
//# sourceMappingURL=comparer.js.map