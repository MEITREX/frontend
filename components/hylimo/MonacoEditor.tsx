import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import { useMemo } from 'react';
import * as vscode from 'vscode';

configureDefaultWorkerFactory();

interface MonacoEditorProps {
    code?: string;
    id?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    code = '',
    id = '1'
}) => {

    const { vscodeApiConfig, editorAppConfig, languageClientConfig } = useMemo(() => {
        const languageId = 'syncscript';
        const uriString = `diagram-${id}.hyl`;
        const codeUri = `/workspace/${uriString}`;

        const vscodeApiConfig: MonacoVscodeApiConfig = {
            $type: 'extended',
            viewsConfig: {
                $type: 'EditorService'
            },
            userConfiguration: {
                json: JSON.stringify({
                    'workbench.colorTheme': 'Default Dark Modern',
                    'editor.wordBasedSuggestions': 'off'
                })
            }
        };

        const languageClientConfig: LanguageClientConfig = {
            languageId,
            connection: {
                options: {
                    $type: 'WebSocketUrl',
                    url: 'ws://localhost:30000/myLangLS'
                }
            },
            clientOptions: {
                documentSelector: [languageId],
                workspaceFolder: {
                    index: 0,
                    name: 'workspace',
                    uri: vscode.Uri.file('/workspace')
                }
            }
        };

        const editorAppConfig: EditorAppConfig = {
            editorOptions: {
                language: languageId,
                fixedOverflowWidgets: true,
                hover: {
                    above: false
                },
                suggest: {
                    snippetsPreventQuickSuggestions: false
                },
                scrollbar: {
                    alwaysConsumeMouseWheel: false
                },
                glyphMargin: false,
                editContext: false,
            },
            codeResources: {

                [codeUri]: {
                    text: code,
                    uri: codeUri,
                    enforceLanguageId: languageId,
                },
            },
            overrideAutomaticLayout: false,
        };

        return { vscodeApiConfig, editorAppConfig, languageClientConfig };
    }, []);

    return (
        <div style={{ backgroundColor: '#1f1f1f', height: '100%', width: '100%' }}>
            <MonacoEditorReactComp
                vscodeApiConfig={vscodeApiConfig}
                editorAppConfig={editorAppConfig}
                languageClientConfig={languageClientConfig}
                style={{ height: '100%', width: '100%' }}
                onError={(e) => {
                    console.error('Editor Error:', e);
                }}
            />
        </div>
    );
};

export default MonacoEditor;