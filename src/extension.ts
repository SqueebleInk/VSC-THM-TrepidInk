import * as vscode from 'vscode';
import { GetConfig, CommentType } from './lib/config';
import { Parser } from './lib/parser';

let activeEditor: vscode.TextEditor;
let parser: Parser = new Parser();
let timeOut: NodeJS.Timeout;

const InitEventListeners = (context: vscode.ExtensionContext) =>
{
	if (vscode.window.activeTextEditor) {
		activeEditor = vscode.window.activeTextEditor;

		parser.SetRegex(activeEditor.document.languageId);

		TriggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			activeEditor = editor;

			parser.SetRegex(activeEditor.document.languageId);

			TriggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			TriggerUpdateDecorations();
		}
	}, null, context.subscriptions);
};

const TriggerUpdateDecorations = () =>
{
	if (timeOut) {
		clearTimeout(timeOut);
	}

	timeOut = setTimeout(UpdateDecorations, 100);
};

const UpdateDecorations = () =>
{
	if (!activeEditor) { return; }
	if (!parser.supportedLanguage) { return; }

	const commentSettings = GetConfig().enabled;
	if (
		commentSettings === CommentType.AllLines ||
		commentSettings === CommentType.SingleLine
	) {
		parser.FindSingleLineComments(activeEditor);
	}

	if (
		commentSettings === CommentType.AllLines ||
		commentSettings === CommentType.MultiLines
	) {
		parser.FindBlockComments(activeEditor);
		parser.FindJSDocComments(activeEditor);
	}

	parser.ApplyStyle(activeEditor);
};

// This method is called when vs code is activated
const activate = (context: vscode.ExtensionContext) =>
{
	const commentSettings = GetConfig().enabled;
	if (
		commentSettings === CommentType.AllLines ||
		commentSettings === CommentType.SingleLine ||
		commentSettings === CommentType.MultiLines
	) {
		vscode.window.showInformationMessage('Trepid Ink Comment Higligher Enabled');
		InitEventListeners(context);
	}
};

const deactivate = () => {};

export { activate, deactivate };