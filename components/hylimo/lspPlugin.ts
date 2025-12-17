import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection
} from "vscode-languageserver-protocol/browser";

import {
    ConfigNotification,
    RemoteNotification,
    RemoteRequest,
    SetLanguageServerIdNotification
} from "@hylimo/diagram-protocol";

import {
    customLightTheme,
    languageConfiguration,
    monarchTokenProvider
} from "@hylimo/monaco-editor-support";
import type * as monaco from "monaco-editor";
import { MonacoLanguageClient } from "monaco-languageclient/.";
import type { Disposable, NotificationHandler, NotificationType } from "vscode-languageserver-protocol/browser.js";


export const defaultDiagramConfig = {
    theme: "light",
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    enableFontSubsetting: true,
    enableExternalFonts: false
};

export const defaultEditorConfig = {
    toolboxEnabled: true,
    snappingEnabled: true,
    gridEnabled: true
};

export const LANGUAGE_ID = 'syncscript';


/**
 * Connects the Main Client (Editor) and the Secondary Worker (Diagram).
 * @param client The already started MonacoLanguageClient
 * @param secondaryWorker The worker instance for the diagram (Secondary)
 */
export async function setupLanguageClientConnection(client: any, secondaryWorker: Worker) {
    console.log("Setup LSP Connection (Client <-> Secondary)");

    // Establish secondary connection
    const reader = new BrowserMessageReader(secondaryWorker);
    const writer = new BrowserMessageWriter(secondaryWorker);
    const secondaryConnection = createProtocolConnection(reader, writer);
    secondaryConnection.listen();

    // A: Worker 0 (Monaco) -> Worker 1 (Sprotty)
    client.onNotification(RemoteNotification.type, (message: any) => {
        secondaryConnection.sendNotification(RemoteNotification.type, message);
    });

    // B: Worker 1 (Sprotty) -> Worker 0 (Monaco)
    secondaryConnection.onNotification(RemoteNotification.type, (message: any) => {
        client.sendNotification(RemoteNotification.type, message);
    });

    // A: Worker 0 (Monaco) -> Worker 1 (Sprotty)
    client.onRequest(RemoteRequest.type, async (request: any) => {
        return secondaryConnection.sendRequest(RemoteRequest.type, request);
    });

    // B: Worker 1 (Sprotty) -> Worker 0 (Monaco)
    secondaryConnection.onRequest(RemoteRequest.type, (request: any) => {
        return client.sendRequest(RemoteRequest.type, request);
    });

    // Set differend ID for secondaryWorker
    secondaryConnection.sendNotification(SetLanguageServerIdNotification.type, 1);

    await client.sendNotification(ConfigNotification.type, {
        diagramConfig: defaultDiagramConfig,
        editorConfig: defaultEditorConfig,
        settings: {}
    });

    console.log("LSP Connection established");
}


/**
 * Activates Syntax Highlighting, Theme, ...
 * @param monacoInstance The already started Monaco Instance
 */
export const setupLanguageSupport = (monacoInstance: typeof monaco) => {
    monacoInstance.languages.register({ id: LANGUAGE_ID });
    monacoInstance.languages.setLanguageConfiguration(LANGUAGE_ID, languageConfiguration as any);
    monacoInstance.languages.setMonarchTokensProvider(LANGUAGE_ID, monarchTokenProvider as any);
    monacoInstance.editor.defineTheme("custom-light", customLightTheme as any);
    monacoInstance.editor.setTheme("custom-light");
};



/**
 * A proxy for the language client that allows for multiple subscriptions to the same notification type.
 */
export class LanguageClientProxy {
    private readonly handlers: Map<string, Set<NotificationHandler<any>>> = new Map();

    constructor(private readonly client: MonacoLanguageClient) {}

    onNotification<P>(type: NotificationType<P>, handler: NotificationHandler<P>): Disposable {
        if (!this.handlers.has(type.method)) {
            this.handlers.set(type.method, new Set());
            this.client.onNotification(type, (params) => {
                this.handlers.get(type.method)?.forEach((h) => h(params));
            });
        }
        this.handlers.get(type.method)?.add(handler);
        return {
            dispose: () => {
                this.handlers.get(type.method)?.delete(handler);
            }
        };
    }

    sendNotification<P>(type: NotificationType<P>, params?: P): Promise<void> {
        return this.client.sendNotification(type, params);
    }

    sendRequest<P, R>(type: any, params?: P): Promise<R> {
        return this.client.sendRequest(type, params);
    }
}