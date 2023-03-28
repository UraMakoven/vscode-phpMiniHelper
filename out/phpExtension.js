"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhpExtension = void 0;
const vscode_1 = require("vscode");
class PhpExtension {
    constructor(context) {
        this.changeTimers = new Map();
        vscode_1.workspace.onDidChangeTextDocument((event) => {
            this.replacePhpObjectOperator(event);
        });
    }
    makeObject(range, re, text, deleteChars) {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        const start = range.start.translate(0, 1);
        const r = new vscode_1.Range(new vscode_1.Position(range.start.line, 0), start);
        const textLine = editor.document.getText(r);
        if (re.test(textLine)) {
            return {
                start: start,
                delete: deleteChars,
                text: text,
            };
        }
        return null;
    }
    makeChange(element) {
        let res = null;
        switch (element.text) {
            case ">":
                res = this.makeObject(element.range, /[-,=]>{2}$/, ">", 2);
                break;
            case "-":
                res = this.makeObject(element.range, /[\$,>][A-z,0-9,_]+-$/, ">", 0);
                break;
            case "=":
                res = this.makeObject(element.range, /[",']\w+?[",']\s?=$/, ">", 0);
                break;
            case ".":
                res = this.makeObject(element.range, /[\$,>][A-z,0-9,_]+\.$/, "->", 1);
                break;
        }
        return res;
    }
    replacePhpObjectOperator(event) {
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
            let changes = [];
            event.contentChanges.forEach((el) => {
                const c = this.makeChange(el);
                if (c) {
                    changes.push(c);
                }
            });
            if (changes.length) {
                const editor = vscode_1.window.activeTextEditor;
                if (editor) {
                    editor.edit((editBuilder) => {
                        changes.forEach((el) => {
                            if (el.delete) {
                                editBuilder.delete(new vscode_1.Range(el.start.translate(0, -el.delete), el.start));
                            }
                            editBuilder.insert(el.start, el.text);
                        });
                    });
                }
            }
        }, 250));
    }
}
exports.PhpExtension = PhpExtension;
//# sourceMappingURL=phpExtension.js.map