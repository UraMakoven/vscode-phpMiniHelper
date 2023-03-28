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

  private makeObject(
    range: Range,
    re: RegExp,
    text: string,
    deleteChars: number
  ) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const start = range.start.translate(0, 1);

    const r = new Range(new Position(range.start.line, 0), start);

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

  private makeChange(element: TextDocumentContentChangeEvent) {
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
      setTimeout(() => {
        this.changeTimers.delete(fileName);

        let changes: any = [];

        event.contentChanges.forEach((el) => {
          const c = this.makeChange(el);
          if (c) {
            changes.push(c);
          }
        });

        if (changes.length) {
          const editor = window.activeTextEditor;
          if (editor) {
            editor.edit((editBuilder: TextEditorEdit) => {
              changes.forEach((el: any) => {
                if (el.delete) {
                  editBuilder.delete(
                    new Range(el.start.translate(0, -el.delete), el.start)
                  );
                }
                editBuilder.insert(el.start, el.text);
              });
            });
          }
        }
      }, 250)
    );
  }
}
