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

export const defaultDiagramConfig = {
    theme: "dark",
    primaryColor: "#ffffff",
    backgroundColor: "#1e1e1e",
    enableFontSubsetting: true,
    enableExternalFonts: false
};

export const defaultEditorConfig = {
    toolboxEnabled: true,
    snappingEnabled: true,
    gridEnabled: true
};

/**
 * Connects the Main Client (Editor) and the Secondary Worker (Diagram).
 * @param client The already started MonacoLanguageClient (Main)
 * @param secondaryWorker The worker instance for the diagram (Secondary)
 */
export async function setupLSPConnection(client: any, secondaryWorker: Worker) {
    console.log("🔧 Setup LSP Connection (Main <-> Secondary)...");

    // 1. Establish secondary connection
    const reader = new BrowserMessageReader(secondaryWorker);
    const writer = new BrowserMessageWriter(secondaryWorker);
    const secondaryConnection = createProtocolConnection(reader, writer);
    secondaryConnection.listen();

    // 2. Forward Notifications & Requests (The Bridge)
    // Main -> Secondary
    client.onNotification(RemoteNotification.type, (message: any) => {
        secondaryConnection.sendNotification(RemoteNotification.type, message);
    });

    // Secondary -> Main
    secondaryConnection.onNotification(RemoteNotification.type, (message: any) => {
        client.sendNotification(RemoteNotification.type, message);
    });

    // Main -> Secondary (Requests)
    client.onRequest(RemoteRequest.type, async (request: any) => {
        return secondaryConnection.sendRequest(RemoteRequest.type, request);
    });

    // Secondary -> Main (Requests)
    secondaryConnection.onRequest(RemoteRequest.type, (request: any) => {
        return client.sendRequest(RemoteRequest.type, request);
    });

    // 3. Send initial configuration
    secondaryConnection.sendNotification(SetLanguageServerIdNotification.type, 1);

    await client.sendNotification(ConfigNotification.type, {
        diagramConfig: defaultDiagramConfig,
        editorConfig: defaultEditorConfig,
        settings: {}
    });

    console.log("LSP Connection established & Config sent.");
}