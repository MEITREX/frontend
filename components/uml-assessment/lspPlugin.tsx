import { LogLevel } from "@codingame/monaco-vscode-api";
import type {
    DynamicLanguageServerConfig,
    EditorConfig,
    SharedSettings,
} from "@hylimo/diagram-protocol";
import {
    ConfigNotification,
    RemoteNotification,
    RemoteRequest,
    SetLanguageServerIdNotification,
    UpdateEditorConfigNotification,
} from "@hylimo/diagram-protocol";
import * as monaco from "monaco-editor";
import { MonacoLanguageClient } from "monaco-languageclient";
import {
    MonacoVscodeApiWrapper,
    type MonacoVscodeApiConfig,
} from "monaco-languageclient/vscodeApiWrapper";
import { useWorkerFactory } from "monaco-languageclient/workerFactory";
import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { CloseAction, ErrorAction } from "vscode-languageclient/browser.js";
import type {
    Disposable,
    NotificationHandler,
    NotificationType,
} from "vscode-languageserver-protocol/browser.js";
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection,
} from "vscode-languageserver-protocol/browser.js";

// Imports from your project structure
import {
    defaultDiagramConfig,
    defaultEditorConfig,
    defaultSharedSettings,
} from "./defaultSettings"; // Assumed existing
import {
    customDarkTheme,
    customLightTheme,
    languageConfiguration,
    monarchTokenProvider,
} from "./language"; // Updated path to match previous file

// --- Types ---

export interface DiagramConfig {
  lightPrimaryColor: string;
  lightBackgroundColor: string;
  darkPrimaryColor: string;
  darkBackgroundColor: string;
  enableFontSubsetting: boolean;
  enableExternalFonts: boolean;
}

export interface LanguageServerConfig {
  settings: SharedSettings;
  diagramConfig: DiagramConfig;
  editorConfig: EditorConfig;
}

export const language = "syncscript";

// --- Context Definition ---

interface LspContextType {
  languageClient: Promise<LanguageClientProxy>;
  languageServerConfig: DynamicLanguageServerConfig; // The computed config sent to server
  diagramIdProvider: () => string;
  // Exposed state setters for UI settings panels
  setSharedSettings: (settings: SharedSettings) => void;
  setDiagramConfig: (config: DiagramConfig) => void;
  setEditorConfig: (config: EditorConfig) => void;
}

export const LspContext = createContext<LspContextType | null>(null);

// --- Hooks (Replicating VueUse behavior) ---

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Merge defaults if object
      if (item) {
        const parsed = JSON.parse(item);
        if (typeof initialValue === "object" && initialValue !== null) {
          return { ...initialValue, ...parsed };
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function useThrottledEffect(callback: () => void, delay: number, deps: any[]) {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => {
      if (Date.now() - lastRan.current >= delay) {
        callback();
        lastRan.current = Date.now();
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          callback();
          lastRan.current = Date.now();
        }, delay - (Date.now() - lastRan.current));
      }
    };
    handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// --- Provider Component ---

interface LspProviderProps {
  children: React.ReactNode;
  isDark?: boolean; // React usually passes theme via props or separate context
}

export const LspProvider: React.FC<LspProviderProps> = ({
  children,
  isDark = false,
}) => {
  // 1. State Management (Persisted)
  const [sharedSettings, setSharedSettings] = useLocalStorage<SharedSettings>(
    "sharedSettings",
    defaultSharedSettings
  );
  const [diagramConfig, setDiagramConfig] = useLocalStorage<DiagramConfig>(
    "diagramConfig",
    defaultDiagramConfig
  );
  const [editorConfig, setEditorConfig] = useLocalStorage<EditorConfig>(
    "editorConfig",
    defaultEditorConfig
  );

  // 2. Computed Configuration (Memoized)
  const languageServerConfig = useMemo<DynamicLanguageServerConfig>(() => {
    return {
      diagramConfig: {
        theme: isDark ? "dark" : "light",
        primaryColor: isDark
          ? diagramConfig.darkPrimaryColor
          : diagramConfig.lightPrimaryColor,
        backgroundColor: isDark
          ? diagramConfig.darkBackgroundColor
          : diagramConfig.lightBackgroundColor,
        enableFontSubsetting: diagramConfig.enableFontSubsetting,
        enableExternalFonts: diagramConfig.enableExternalFonts,
      },
      settings: sharedSettings,
      editorConfig: editorConfig,
    };
  }, [isDark, sharedSettings, diagramConfig, editorConfig]);

  // 3. Client Initialization
  const clientPromiseRef = useRef<Promise<LanguageClientProxy> | null>(null);
  const idCounterRef = useRef(1);

  // Initialize client once
  if (!clientPromiseRef.current) {
    clientPromiseRef.current = setupLanguageClient(isDark);
  }

  // 4. Update Theme when isDark changes
  useEffect(() => {
    monaco.editor.setTheme(isDark ? "custom-dark" : "custom-light");
  }, [isDark]);

  // 5. Handle Server Notifications (Update Editor Config from Server)
  useEffect(() => {
    clientPromiseRef.current?.then((proxy) => {
      proxy.onNotification(UpdateEditorConfigNotification.type, (config) => {
        setEditorConfig(config);
      });
    });
  }, [setEditorConfig]);

  // 6. Send Config Updates to Server (Throttled)
  useThrottledEffect(
    () => {
      const currentConfig = languageServerConfig;
      clientPromiseRef.current?.then((proxy) => {
        proxy.sendNotification(ConfigNotification.type, {
          diagramConfig: currentConfig.diagramConfig,
          settings: currentConfig.settings,
          editorConfig: currentConfig.editorConfig,
        });
      });
    },
    500,
    [languageServerConfig]
  );

  // 7. Context Values
  const diagramIdProvider = useCallback(() => {
    return (idCounterRef.current++).toString();
  }, []);

  const contextValue: LspContextType = {
    languageClient: clientPromiseRef.current!,
    languageServerConfig,
    diagramIdProvider,
    setSharedSettings,
    setDiagramConfig,
    setEditorConfig,
  };

  return (
    <LspContext.Provider value={contextValue}>{children}</LspContext.Provider>
  );
};

// --- Language Client Setup Logic ---

export class LanguageClientProxy {
  private readonly handlers: Map<string, Set<NotificationHandler<any>>> =
    new Map();

  constructor(private readonly client: MonacoLanguageClient) {}

  onNotification<P>(
    type: NotificationType<P>,
    handler: NotificationHandler<P>
  ): Disposable {
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
      },
    };
  }

  sendNotification<P>(type: NotificationType<P>, params?: P): Promise<void> {
    return this.client.sendNotification(type, params);
  }
}

async function setupLanguageClient(isDark: boolean) {
  // Note: React usage of import.meta.url for Workers depends on your bundler (Vite supports this)
  const [worker, secondaryWorker] = [0, 1].map(
    () =>
      new Worker(new URL("./languageServer.ts", import.meta.url), {
        type: "module",
      })
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
      $type: "EditorService",
    },
    logLevel: LogLevel.Warning,
    monacoWorkerFactory: () => {
      useWorkerFactory({
        workerLoaders: {
          //              TextEditorWorker: () => new monacoEditorWorker()
        },
      });
    },
  };

  const vscodeApi = new MonacoVscodeApiWrapper(vscodeApiConfig);
  await vscodeApi.start();

  // Register languages and themes
  if (!monaco.languages.getLanguages().some((l) => l.id === language)) {
    monaco.languages.register({ id: language });
    monaco.languages.setLanguageConfiguration(language, languageConfiguration);
    monaco.languages.setMonarchTokensProvider(language, monarchTokenProvider);
    monaco.editor.defineTheme("custom-light", customLightTheme);
    monaco.editor.defineTheme("custom-dark", customDarkTheme);
  }

  monaco.editor.setTheme(isDark ? "custom-dark" : "custom-light");

  const client = new MonacoLanguageClient({
    name: "SyncScript Language Client",
    clientOptions: {
      documentSelector: [{ language }],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    messageTransports: { reader, writer },
  });
  await client.start();

  // Setup Proxy Communication
  client.onNotification(RemoteNotification.type, (message: any) => {
    secondaryConnection.sendNotification(RemoteNotification.type, message);
  });
  secondaryConnection.onNotification(
    RemoteNotification.type,
    (message: any) => {
      client.sendNotification(RemoteNotification.type, message);
    }
  );
  client.onRequest(RemoteRequest.type, async (request: any) => {
    return secondaryConnection.sendRequest(RemoteRequest.type, request);
  });
  secondaryConnection.onRequest(RemoteRequest.type, (request: any) => {
    return client.sendRequest(RemoteRequest.type, request);
  });
  secondaryConnection.sendNotification(SetLanguageServerIdNotification.type, 1);

  return new LanguageClientProxy(client);
}
