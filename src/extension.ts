import * as vscode from "vscode";
import { parseForESLint } from "@angular-eslint/template-parser";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "ng-lint-ast-viewer.show-ast",
    async () => {
      const p = parseForESLint(
        vscode.window.activeTextEditor?.document.getText() ?? "",
        {
          suppressParseErrors: true,
          filePath: vscode.window.activeTextEditor?.document.uri.fsPath!,
        },
      );

      const a = await vscode.workspace.openTextDocument({
        language: "json",
        content: JSON.stringify(p.ast, undefined, 2),
      });
      vscode.window.showTextDocument(a, vscode.ViewColumn.Beside);
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
