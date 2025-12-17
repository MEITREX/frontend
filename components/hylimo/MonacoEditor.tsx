"use client";

import { ConfigNotification } from '@hylimo/diagram-protocol';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import * as monaco from "monaco-editor";
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { useWorkerFactory } from 'monaco-languageclient/workerFactory';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LogLevel } from 'vscode';
import { CloseAction, ErrorAction } from "vscode-languageclient";
import { LanguageClientProxy, setupLanguageClientConnection, setupLanguageSupport } from './lspPlugin';

const defaultDiagramConfig = {
    theme: "light",
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    enableFontSubsetting: true,
    enableExternalFonts: false
};

const defaultEditorConfig = {
    toolboxEnabled: true,
    snappingEnabled: true,
    gridEnabled: true
};


interface MonacoEditorProps {
    code?: string;
    id?: string;
    onCodeChange?: (newCode: string) => void;
    onEditorReady?: (client: any, editor: any, model: any) => void;
    onClientReady: (client: any) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    code = '',
    id = '1',
    onCodeChange,
    onEditorReady,
    onClientReady
}) => {
    // Refs for the workers
    const worker = useRef<Worker | null>(null);
    const secondaryWorker = useRef<Worker | null>(null);

    const [workersReady, setWorkersReady] = useState(false);
    const languageId = 'syncscript';

    /* Initialize two Web Workers*/
    useEffect(() => {
        if (!worker.current) {
            // A. worker: Monaco
            worker.current = new Worker(
                new URL('./languageServer.ts', import.meta.url),
                { type: 'module' }
            );

            // B. secondaryWorker: Sprotty
            secondaryWorker.current = new Worker(
                new URL('./languageServer.ts', import.meta.url),
                { type: 'module' }
            );

            setWorkersReady(true);
        }

        // Cleanup
        return () => {
            worker.current?.terminate();
            secondaryWorker.current?.terminate();
            worker.current = null;
            secondaryWorker.current = null;
        };
    }, []);

    // Configuration for MonacoEditorReactComp
    const { vscodeApiConfig, editorAppConfig, languageClientConfig } = useMemo(() => {
        // Wait until workers are ready
        if (!workersReady || !worker.current) {
            return {} as any;
        }

        const uriString = `diagram-${id}.hyl`;
        const codeUri = `diagram-1.hyl`;



        const vscodeApiConfig: MonacoVscodeApiConfig = {
            $type: 'classic',
            viewsConfig: {
                $type: 'EditorService'
            },
            logLevel: LogLevel.Warning,
            monacoWorkerFactory: () => {
                useWorkerFactory({
                    workerLoaders: {
                        TextEditorWorker:() => new Worker(
                            new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url)
                        )
                    }
                })
            }
        };


        const languageClientConfig: LanguageClientConfig = {
            languageId,
            connection: {
                options: {
                    $type: 'WorkerDirect',
                    worker: worker.current
                }
            },

            clientOptions: {
                documentSelector: [languageId],
                   errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart })
                },
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
    }, [id, workersReady, code]);


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

                onEditorStartDone={async (editorApp) => {
                    setupLanguageSupport(monaco);
                    console.log(editorApp?.getEditor()?.getModel());
                }}

                // Establish Connection
                onLanguageClientsStartDone={async (manager) => {
                    console.log("Client Manager connected. Setting up Hylimo");

                    const client = await manager.getLanguageClient(languageId);

                    if (client && secondaryWorker.current) {
                        await setupLanguageClientConnection(client, secondaryWorker.current);

                        client.sendNotification(ConfigNotification.type, {
                            diagramConfig: defaultDiagramConfig,
                            editorConfig: defaultEditorConfig,
                            settings: {}
                        });

                        const proxy = new LanguageClientProxy(client as any);
                        onClientReady(proxy);

                        console.log("Hylimo System fully operational.");
                    }
                }}

                onError={(e) => console.error("Editor Error:", e)}
            />
        </div>
    );
};

export default MonacoEditor;