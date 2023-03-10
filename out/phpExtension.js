"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhpExtension = void 0;
const vscode_1 = require("vscode");
class PhpExtension {
    constructor(context) {
        this.changeTimers = new Map();
        vscode_1.workspace.onDidChangeTextDocument((event) => {
            this.checkPhpObjectOperator(event);
        });
    }
    checkPhpObjectOperator(event) {
        if (!event.document.uri.path.includes(".php")) {
            return;
        }
        if (!event.contentChanges.length) {
            return;
        }
        const fileName = event.document.fileName;
        const timer = this.changeTimers.get(fileName);
        if (timer) {
            clearTimeout(timer);
        }
        this.changeTimers.set(fileName, setTimeout(() => {
            this.changeTimers.delete(fileName);
            const c = event.contentChanges[0].text;
            const editor = vscode_1.window.activeTextEditor;
            if (editor) {
                if (c === "-") {
                    const range = new vscode_1.Range(new vscode_1.Position(editor.selection.start.line, 0), editor.selection.start.translate(0, 0));
                    const text = editor.document.getText(range);
                    // $this-  $obj->user-
                    const re = /[\$,>][A-z,_]+-$/;
                    if (re.test(text)) {
                        editor.edit((editBuilder) => {
                            editBuilder.insert(editor.selection.start.translate(0, 0), ">");
                        });
                    }
                }
                else if (c === "=") {
                    const range = new vscode_1.Range(new vscode_1.Position(editor.selection.start.line, 0), editor.selection.start.translate(0, 0));
                    const text = editor.document.getText(range);
                    // "key" =
                    const re = /[",'].+?[",'].*?=$/;
                    if (re.test(text)) {
                        editor.edit((editBuilder) => {
                            editBuilder.insert(editor.selection.start.translate(0, 0), ">");
                        });
                    }
                }
            }
        }, 300));
    }
}
exports.PhpExtension = PhpExtension;
//# sourceMappingURL=phpExtension.js.map