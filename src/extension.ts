import * as vscode from "vscode";
import { parseForESLint } from "@angular-eslint/template-parser";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "ng-lint-ast-viewer.show-ast",
    async () => {
      const angularEslint = parseForESLint(
        vscode.window.activeTextEditor?.document.getText() ?? "",
        {
          suppressParseErrors: true,
          filePath: vscode.window.activeTextEditor?.document.uri.fsPath!,
        }
      );

      const webView = vscode.window.createWebviewPanel(
        "ngLintAst",
        "AST " + vscode.window.activeTextEditor?.document.fileName,
        vscode.ViewColumn.Beside
      );

	  webView.webview.html = JSON.stringify(angularEslint.ast, undefined, 2);      
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
