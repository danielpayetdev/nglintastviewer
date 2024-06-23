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
        vscode.ViewColumn.Beside,
        {
          enableScripts: true
        }
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
			list-style-type: none;
		}
		</style>
	`;
};

const keyOrder: Record<string, number> = {
  type: 0,
  branches: 1,
  children: 1,
  expression: 2,
  expressions: 2,
  expressionAlias: 3,
  i18n: 4,
};

const buildTree = (ast: Record<string, any>): string => {
  return (
    "<ul'>" +
    Object.keys(ast)
      .sort((key1, key2) => {
        const key1Order = keyOrder[key1] ?? 100;
        const key2Order = keyOrder[key2] ?? 100;
        return key1Order - key2Order;
      })
      .map((key) => {
        return `
		<li style='padding:.5rem;border-left:1px solid grey;' onmouseover="this.style.borderLeftColor='white'" onmouseout="this.style.borderLeftColor='grey'" >
			${
        ast[key] &&
        typeof ast[key] === "object" &&
        (Array.isArray(ast[key]) ? ast[key].length : true)
          ? `
			<details>
				<summary>${key}: ${getNodeValue(ast[key])}</summary>
				${buildSubTree(ast[key])}
			</details>`
          : ast[key] &&
              typeof ast[key] === "string" &&
              (ast[key] as string).includes("<")
            ? `
			<details>
				<summary>${key}: ${escapeHTML(getNodeValue(ast[key])).slice(0, 100)}...</summary>
				<code>
          ${escapeHTML(ast[key])}
        </code>
			</details>`
            : `${key}: ${getNodeValue(ast[key])}`
      }
			
		</li>`;
      })
      .join("") +
    "</ul>"
  );
};

const escapeHTML = (html: string): string => {
  return html
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&#39;")
    .replaceAll('"', "&quot;");
};

const buildSubTree = (node: any) => {
  return `
	<div style="margin-left:.5rem">
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
