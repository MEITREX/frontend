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
 * This function corresponds to the logic part of 'setupLanguageClient' from the original Vue file.
 * It connects the Main Client (Editor) and the Secondary Worker (Diagram).
 * * @param client The already started MonacoLanguageClient (Main)
 * @param secondaryWorker The worker instance for the diagram (Secondary)
 */
export async function setupLSPConnection(client: any, secondaryWorker: Worker) {
    console.log("🔧 Setup LSP Connection (Main <-> Secondary)...");

    // 1. Establish secondary connection
    // (Exactly like in Vue: setupLanguageClient line 166)
    const reader = new BrowserMessageReader(secondaryWorker);
    const writer = new BrowserMessageWriter(secondaryWorker);
    const secondaryConnection = createProtocolConnection(reader, writer);
    secondaryConnection.listen();

    // 2. Forward Notifications & Requests (The Bridge)
    // (Exactly like in Vue: setupLanguageClient lines 199 - 210)

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
    // (Exactly like in Vue: setupLanguageClient line 212 + Config logic)

    secondaryConnection.sendNotification(SetLanguageServerIdNotification.type, 1);

    // We simulate the 'watchThrottled' behavior from Vue here
    // by sending the config directly once during setup.
    await client.sendNotification(ConfigNotification.type, {
        diagramConfig: defaultDiagramConfig,
        editorConfig: defaultEditorConfig,
        settings: {}
    });

    console.log("✅ LSP Connection established & Config sent.");
}