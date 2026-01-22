import type { NotificationHandler, NotificationType, Disposable } from "vscode-languageserver-protocol/browser.js";
import { MonacoLanguageClient } from "monaco-languageclient";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createProtocolConnection
} from "vscode-languageserver-protocol/browser.js";
import { LogLevel } from "@codingame/monaco-vscode-api";
import { useWorkerFactory } from "monaco-languageclient/workerFactory";
import * as monaco from "monaco-editor";
import {
  customDarkTheme,
  customLightTheme,
  languageConfiguration,
  monarchTokenProvider
} from "@hylimo/monaco-editor-support";
import { CloseAction, ErrorAction } from "vscode-languageclient";
import {
  ConfigNotification,
  UpdateEditorConfigNotification,
  RemoteNotification,
  RemoteRequest,
  SetLanguageServerIdNotification
} from "@hylimo/diagram-protocol";
import {
  getEnhancedMonacoEnvironment,
  MonacoVscodeApiWrapper,
  type MonacoVscodeApiConfig
} from "monaco-languageclient/vscodeApiWrapper";

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

/**
 * The language identifier for the SyncScript language.
 */
export const language = "syncscript";

/**
 * Sets up the language client for the SyncScript language.
 *
 * @returns a promise that resolves to a proxy for the language client
 */
export async function setupLanguageClient() {
  const [worker, secondaryWorker] = [0, 1].map(
    () => new Worker(new URL("./languageServer.ts", import.meta.url), { type: "module" })
  );
  const secondaryConnection = createProtocolConnection(
    new BrowserMessageReader(secondaryWorker),
    new BrowserMessageWriter(secondaryWorker)
  );
  secondaryConnection.listen();

  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);

  const vscodeApiConfig: MonacoVscodeApiConfig = {
    $type: "classic",
    viewsConfig: {
      $type: "EditorService"
    },
    logLevel: LogLevel.Warning,
    monacoWorkerFactory: () => {
      const envEnhanced = getEnhancedMonacoEnvironment();
      envEnhanced.getWorker = (workerId, label) => {
        if (label === "editorWorkerService") {
          return new Worker(
            new URL("@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js", import.meta.url),
            { type: "module" }
          );
        } else {
          throw new Error(`Unknown worker label: ${label}`);
        }
      };
    }
  };


  const vscodeApi = new MonacoVscodeApiWrapper(vscodeApiConfig);
  await vscodeApi.start();

  monaco.languages.register({ id: language });
  monaco.languages.setLanguageConfiguration(language, languageConfiguration);
  monaco.languages.setMonarchTokensProvider(language, monarchTokenProvider);
  monaco.editor.defineTheme("custom-light", customLightTheme);
  monaco.editor.setTheme("custom-light");

  const client = new MonacoLanguageClient({
    name: "SyncScript Language Client",
    clientOptions: {
      documentSelector: [{ language }],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      }
    },
    messageTransports: { reader, writer }
  });
  await client.start();

  client.onNotification(RemoteNotification.type, (message) => {
    secondaryConnection.sendNotification(RemoteNotification.type, message);
  });
  secondaryConnection.onNotification(RemoteNotification.type, (message) => {
    client.sendNotification(RemoteNotification.type, message);
  });
  client.onRequest(RemoteRequest.type, async (request) => {
    return secondaryConnection.sendRequest(RemoteRequest.type, request);
  });
  secondaryConnection.onRequest(RemoteRequest.type, (request) => {
    return client.sendRequest(RemoteRequest.type, request);
  });
  await secondaryConnection.sendNotification(SetLanguageServerIdNotification.type, 1);

  await client.sendNotification(ConfigNotification.type, {
    diagramConfig: defaultDiagramConfig,
    editorConfig: defaultEditorConfig,
    settings: {}
  });

  return new LanguageClientProxy(client);
}


/**
 * A proxy for the language client that allows for multiple subscriptions to the same notification type.
 */
export class LanguageClientProxy {
  /**
   * A map of notification handlers for each method.
   */
  private readonly handlers: Map<string, Set<NotificationHandler<any>>> = new Map();

  /**
   * Creates a new LanguageClientProxy with the given client.
   * @param client the language client to proxy to
   */
  constructor(private readonly client: MonacoLanguageClient) {}

  /**
   * @see MonacoLanguageClient.onNotification
   */
  onNotification<P>(type: NotificationType<P>, handler: NotificationHandler<P>): Disposable {
    if (!this.handlers.has(type.method)) {
      this.handlers.set(type.method, new Set());
      this.client.onNotification(type, (params) => {
        this.handlers.get(type.method)?.forEach((handler) => handler(params));
      });
    }
    this.handlers.get(type.method)?.add(handler);
    return {
      dispose: () => {
        this.handlers.get(type.method)?.delete(handler);
      }
    };
  }

  /**
   * @see MonacoLanguageClient.sendNotification
   */
  sendNotification<P>(type: NotificationType<P>, params?: P): Promise<void> {
    return this.client.sendNotification(type, params);
  }
}
