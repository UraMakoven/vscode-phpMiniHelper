import {
  ExtensionContext,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  TextEditorEdit,
  window,
  workspace,
} from "vscode";

export class PhpExtension {
  private changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  public constructor(context: ExtensionContext) {
    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
      this.replacePhpObjectOperator(event);
    });
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async addText(
    range: Range,
    re: RegExp,
    text: string,
    deleteChars: number
  ) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const start = range.start.translate(0, 1);

    const r = new Range(new Position(range.start.line, 0), start);

    const textLine = editor.document.getText(r);

    if (re.test(textLine)) {
      await editor.edit((editBuilder: TextEditorEdit) => {
        if (deleteChars) {
          editBuilder.delete(
            new Range(range.start.translate(0, -(deleteChars - 1)), start)
          );
        }
        editBuilder.insert(start, text);
      });
    }
  }

  private async applyChanges(element: TextDocumentContentChangeEvent) {
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

  private replacePhpObjectOperator(event: TextDocumentChangeEvent) {
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

    this.changeTimers.set(
      fileName,
      setTimeout(async () => {
        this.changeTimers.delete(fileName);

        for (const el of event.contentChanges) {
          const d = await this.applyChanges(el);
        }
      }, 300)
    );
  }
}
