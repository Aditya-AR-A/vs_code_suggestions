import { getGeneratedSuggestion, setGeneratedSuggestion, getCompletion } from './suggestionUpdater';
import vscode from 'vscode';
let lastKeyPressTime = 0;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
    try {
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: '*' }, {
            provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken) {
                try {
                    const linePrefix = document.lineAt(position).text.substr(0, position.character);
                    if (linePrefix.endsWith(' ')) {
                        return {
                            items: [
                                new vscode.InlineCompletionItem(getGeneratedSuggestion())
                            ]
                        };
                    }
                    return { items: [] };
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Error providing inline completion items: ${error.message}`);
                    return { items: [] };
                }
            }
        }));

        let disposable = vscode.commands.registerCommand('trial.insertMultilineText', function () {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const currentTime = new Date().getTime();
                    const timeSinceLastKeyPress = currentTime - lastKeyPressTime;
                    vscode.window.showInformationMessage(`Time since last key press: ${timeSinceLastKeyPress}ms`);
                    if (timeSinceLastKeyPress < 2000) {
                        // Less than two seconds since last key press, insert tab
                        vscode.window.showInformationMessage('Inserting tab');
                        editor.insertSnippet(new vscode.SnippetString('\t'));
                    } else {
                        // More than two seconds, insert multiline text
                        vscode.window.showInformationMessage('Inserting multiline text');
                        const position = editor.selection.active;
                        const snippet = new vscode.SnippetString(getGeneratedSuggestion());
                        editor.insertSnippet(snippet, position);
                    }
                    lastKeyPressTime = currentTime;
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error inserting multiline text: ${error.message}`);
            }
        });
        context.subscriptions.push(disposable);

        // Add an event listener for text document changes
        vscode.workspace.onDidChangeTextDocument(async event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                const changes = event.contentChanges;
                if (changes.length > 0) {
                    const change = changes[0];
                    if (change.text.includes('\n')) {
                        const position = editor.selection.active;
                        const textBeforeCursor = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), position));
                        const groqCompletion = await getCompletion(textBeforeCursor);
                        setGeneratedSuggestion(groqCompletion);
                    }
                }
            }
        });
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error activating extension: ${error.message}`);
    }
}

exports.activate = activate;

function deactivate() {}


module.exports = {
    activate,
    deactivate
};
