"use client";

import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as vscode from 'vscode';
import { setupLSPConnection } from './lspPlugin';

configureDefaultWorkerFactory();

interface MonacoEditorProps {
    code?: string;
    id?: string;
    onCodeChange?: (newCode: string) => void;
    onEditorReady?: (client: any, editor: any, model: any) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    code = '',
    id = '1',
    onCodeChange,
    onEditorReady
}) => {
    // Refs for the workers
    const mainWorkerRef = useRef<Worker | null>(null);
    const secondaryWorkerRef = useRef<Worker | null>(null);

    const [workersReady, setWorkersReady] = useState(false);

    // Initialize Web Workers
    useEffect(() => {
        if (!mainWorkerRef.current) {
            // A. Start Main Worker (for Editor / Syntax)
            mainWorkerRef.current = new Worker(
                new URL('./languageServer.ts', import.meta.url),
                { type: 'module' }
            );

            // B. Start Secondary Worker (for Diagram / Sprotty)
            secondaryWorkerRef.current = new Worker(
                new URL('./languageServer.ts', import.meta.url),
                { type: 'module' }
            );

            setWorkersReady(true);
        }

        // Cleanup
        return () => {
            mainWorkerRef.current?.terminate();
            secondaryWorkerRef.current?.terminate();
            mainWorkerRef.current = null;
            secondaryWorkerRef.current = null;
        };
    }, []);

    // Configuration for MonacoEditorReactComp
    const { vscodeApiConfig, editorAppConfig, languageClientConfig } = useMemo(() => {
        // Wait until workers are ready
        if (!workersReady || !mainWorkerRef.current) {
            return {} as any;
        }

        const languageId = 'syncscript';
        const uriString = `diagram-${id}.hyl`;
        const codeUri = `/workspace/${uriString}`;

        const vscodeApiConfig: MonacoVscodeApiConfig = {
            $type: 'extended',
            viewsConfig: { $type: 'EditorService' },
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
                    $type: 'WorkerDirect',
                    worker: mainWorkerRef.current
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
                hover: { above: false },
                suggest: { snippetsPreventQuickSuggestions: false },
                scrollbar: { alwaysConsumeMouseWheel: false },
                glyphMargin: false,
                editContext: false,
                automaticLayout: true,
            },
            codeResources: {
                modified: {
                    text: code,
                    uri: codeUri,
                    enforceLanguageId: languageId,
                }
            },
            overrideAutomaticLayout: false
        };

        return { vscodeApiConfig, editorAppConfig, languageClientConfig };
    }, [id, workersReady]);


    if (!workersReady) {
        return <div style={{color: 'white'}}>Loading Language Server...</div>;
    }

    return (
        <div style={{ backgroundColor: '#1f1f1f', height: '100%', width: '100%' }}>
            <MonacoEditorReactComp
                vscodeApiConfig={vscodeApiConfig}
                editorAppConfig={editorAppConfig}
                languageClientConfig={languageClientConfig}
                style={{ height: '100%', width: '100%' }}

                onEditorStartDone={(editorApp) => {}}

                // Establish Connection
                onLanguageClientsStartDone={async (manager) => {
                    console.log("✅ Client Manager connected. Setting up Hylimo...");

                    const client = await manager.getLanguageClient('syncscript');

                    if (client && secondaryWorkerRef.current) {
                        await setupLSPConnection(client, secondaryWorkerRef.current);

                        console.log("🚀 Hylimo System fully operational.");
                    }
                }}

                onError={(e) => console.error("Editor Error:", e)}
            />
        </div>
    );
};

export default MonacoEditor;