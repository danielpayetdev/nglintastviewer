import * as vscode from "vscode";
import { parse } from "@angular-eslint/template-parser";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "ng-lint-ast-viewer.show-ast",
    async () => {
      const ast = parse(
        vscode.window.activeTextEditor?.document.getText() ?? "",
        {
          suppressParseErrors: true,
          filePath: vscode.window.activeTextEditor?.document.uri.fsPath!,
        }
      );

      const webView = vscode.window.createWebviewPanel(
        "ngLintAst",
        "AST " +
          path.parse(vscode.window.activeTextEditor?.document.fileName ?? "")
            .base,
        vscode.ViewColumn.Beside
      );

      webView.webview.html = buildHtml(ast);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

const buildHtml = (ast: Record<string, any>): string => {
  return `
		<html>
		<head>
		${getGlobalStyle()}
		</head>
		<body>${buildTree(ast)}</body>
		</html>
		`;
};

const getGlobalStyle = (): string => {
  return `
		<style>
		body {
			font-size: '14px';
			font-family: monospace;
		}
		li {
			cursor: pointer;
		}
		</style>
	`;
};

const getScript = () => {
  return `
	deploy(index) {

	}
	`;
};

let globalTreeID = 0;
const keyOrder: Record<string, number> = {
  type: 0,
  branches: 1,
  children: 1,
  expression: 2,
  expressionAlias: 3,
  i18n: 4,
};

const buildTree = (ast: Record<string, any>): string => {
  return (
    "<ul>" +
    Object.keys(ast)
      .sort((key1, key2) => {
        const key1Order = keyOrder[key1] ?? 100;
        const key2Order = keyOrder[key2] ?? 100;
        return key1Order - key2Order;
      })
      .map((k, index) => {
        const treeID = `${globalTreeID++}_${index}`;
        return `
		<li>
			<a id="${treeID}" onclick="show(treeID)">${k}: ${getNodeValue(ast[k])}</a>
			${ast[k] && typeof ast[k] === "object" ? buildSubTree(ast[k]) : ""}
		</li>`;
      })
      .join("") +
    "</ul>"
  );
};

const buildSubTree = (node: any) => {
  return `
	<div style="display:block;margin-left:1rem">
		${buildTree(node)}
	</div>
	`;
};

const getNodeValue = (node: any): string => {
  if (node && typeof node === "object") {
    if (Array.isArray(node)) {
      return gerArrayValue(node);
    }
    return "Object";
  }
  return node;
};

const gerArrayValue = (arrayNode: any[]): string => {
  let value = "";
  if (arrayNode.length > 0) {
    value = `${arrayNode.length} element${arrayNode.length > 1 ? "" : "s"}`;
  }
  return `[${value}]`;
};
