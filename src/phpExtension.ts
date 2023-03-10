import {
  ExtensionContext,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextEditorEdit,
  window,
  workspace,
} from "vscode";

export class PhpExtension {
  private changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  public constructor(context: ExtensionContext) {
    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
      this.checkPhpObjectOperator(event);
    });
  }

  private checkPhpObjectOperator(event: TextDocumentChangeEvent) {
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

        const c = event.contentChanges[0].text;

        const editor = window.activeTextEditor;
        if (editor) {
          if (c === "-") {
            const range = new Range(
              new Position(editor.selection.start.line, 0),
              editor.selection.start.translate(0, 0)
            );

            const text = editor.document.getText(range);

            // $this-  $obj->user-
            const re = /[\$,>][A-z,_]+-$/;
            if (re.test(text)) {
              editor.edit((editBuilder: TextEditorEdit) => {
                editBuilder.insert(editor.selection.start.translate(0, 0), ">");
              });
            }
          } else if (c === "=") {
            const range = new Range(
              new Position(editor.selection.start.line, 0),
              editor.selection.start.translate(0, 0)
            );

            const text = editor.document.getText(range);

            // "key" =
            const re = /[",'].+?[",'].*?=$/;
            if (re.test(text)) {
              editor.edit((editBuilder: TextEditorEdit) => {
                editBuilder.insert(editor.selection.start.translate(0, 0), ">");
              });
            }
          }
        }
      }, 300)
    );
  }
}
