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
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async addText(range, re, text, deleteChars) {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const start = range.start.translate(0, 1);
        const r = new vscode_1.Range(new vscode_1.Position(range.start.line, 0), start);
        const textLine = editor.document.getText(r);
        if (re.test(textLine)) {
            await editor.edit((editBuilder) => {
                if (deleteChars) {
                    editBuilder.delete(new vscode_1.Range(range.start.translate(0, -(deleteChars - 1)), start));
                }
                editBuilder.insert(start, text);
            });
        }
    }
    async applyChanges(element) {
        switch (element.text) {
            case "-":
                await this.addText(element.range, /[\$,>][A-z,0-9,_]+-$/, ">", 0);
                break;
            case "=":
                await this.addText(element.range, /[",'].+?[",'].*?=$/, ">", 0);
                break;
            case ".":
                await this.addText(element.range, /[\$,>][A-z,0-9,_]+\.$/, "->", 1);
                break;
        }
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
        this.changeTimers.set(fileName, setTimeout(async () => {
            this.changeTimers.delete(fileName);
            for (const el of event.contentChanges) {
                const d = await this.applyChanges(el);
            }
        }, 300));
    }
}
exports.PhpExtension = PhpExtension;
//# sourceMappingURL=phpExtension.js.map