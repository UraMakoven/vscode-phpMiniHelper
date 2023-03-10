"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const phpExtension_1 = require("./phpExtension");
let phpExtension;
function activate(context) {
    phpExtension = new phpExtension_1.PhpExtension(context);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map