import * as vscode from "vscode";
import { PhpExtension } from "./phpExtension";

let phpExtension: PhpExtension;

export function activate(context: vscode.ExtensionContext) {
  phpExtension = new PhpExtension(context);
}

