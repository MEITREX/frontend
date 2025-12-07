"use client";

import * as monaco from "@codingame/monaco-vscode-editor-api";
import { Root } from "@hylimo/diagram-common";
import {
  DiagramActionNotification,
  DiagramOpenNotification,
  PublishDocumentRevealNotification,
} from "@hylimo/diagram-protocol";
import {
  createContainer,
  DiagramServerProxy,
  ResetCanvasBoundsAction,
  TYPES,
} from "@hylimo/diagram-ui";
import {
  EditorApp,
  type EditorAppConfig,
} from "monaco-languageclient/editorApp";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Split from "react-split"; // Equivalent to splitpanes for React
import "reflect-metadata";
import type { ActionHandlerRegistry, IActionDispatcher } from "sprotty";
import { RequestModelAction } from "sprotty-protocol";
import type { Disposable } from "vscode-languageserver-protocol";
import {
  customLightTheme,
  languageConfiguration,
  monarchTokenProvider,
} from "./language";

// --- Types & Interfaces ---

interface DiagramEditorProps {
  horizontal?: boolean;
  code: string; // React uses explicit props instead of v-model
  onCodeChange: (newCode: string) => void;
  onUpdateDiagram?: (diagram: Root) => void;
  onSave?: () => void;
  // isDark prop removed as it is no longer used
}

// Mocking the context structure based on the Vue injection keys
// In your real app, you would export these from your context definition file
interface DiagramContextType {
  languageClient: Promise<any>; // Replace 'any' with actual LanguageClient type
  languageServerConfig: {
    diagramConfig: {
      lightBackgroundColor: string;
      darkBackgroundColor: string;
    };
  };
  diagramIdProvider: () => string;
}

// Create a context (You should wrap your app with this Provider)
export const DiagramEditorContext = createContext<DiagramContextType | null>(
  null
);

// --- Constants ---

enum TransactionState {
  None,
  InProgress,
  Committed,
}

const language = "syncscript";

// --- Component ---

export const HylimoEditor: React.FC<DiagramEditorProps> = ({
  horizontal = false,
  code,
  onCodeChange,
  onUpdateDiagram,
  onSave,
}) => {
  // Context
  const context = useContext(DiagramEditorContext);
  if (!context)
    throw new Error(
      "HylimoEditor must be used within a DiagramEditorContext.Provider"
    );

  const {
    languageClient: languageClientPromise,
    languageServerConfig,
    diagramIdProvider,
  } = context;

  // Refs (State that doesn't trigger re-renders or DOM access)
  const editorElementRef = useRef<HTMLDivElement>(null);
  const sprottyWrapperRef = useRef<HTMLDivElement>(null);
  const sprottyContainerRef = useRef<HTMLDivElement>(null);

  // Logic Refs (Mutable state needed inside callbacks/effects)
  const idRef = useRef<string>(diagramIdProvider());
  const editorAppRef = useRef<EditorApp | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorModelRef = useRef<monaco.editor.ITextModel | null>(null);
  const actionDispatcherRef = useRef<IActionDispatcher | undefined>(undefined);
  const transactionStateRef = useRef<TransactionState>(TransactionState.None);
  const isUpdatingModelRef = useRef(false);

  // State
  const [hideMainContent, setHideMainContent] = useState(true);

  // Computed Styles
  const diagramBackground = useMemo(() => {
    const config = languageServerConfig.diagramConfig;
    // Always use light background color
    return config.lightBackgroundColor;
  }, [languageServerConfig]);

  // --- Effects ---

  // 1. Sync Prop Changes to Editor (One-way binding: Parent -> Editor)
  useEffect(() => {
    const model = editorModelRef.current;
    if (model && code !== model.getValue()) {
      isUpdatingModelRef.current = true;
      model.setValue(code);
      isUpdatingModelRef.current = false;
    }
  }, [code]);

  // 2. Main Initialization Logic (Equivalent to onMounted)
  useEffect(() => {
    let disposables: Disposable[] = [];
    let isMounted = true;

    const init = async () => {
      if (!editorElementRef.current || !sprottyContainerRef.current) return;

      const currentLanguageClient = await languageClientPromise;

      // Register Language and Theme
      if (!monaco.languages.getLanguages().some((l) => l.id === language)) {
        monaco.languages.register({ id: language });
        monaco.languages.setMonarchTokensProvider(
          language,
          monarchTokenProvider
        );
        monaco.languages.setLanguageConfiguration(
          language,
          languageConfiguration
        );
        monaco.editor.defineTheme("hylimo-light", customLightTheme);
      }

      // Configuration
      const editorAppConfig: EditorAppConfig = {
        editorOptions: {
          language,
          theme: "hylimo-light",
          fixedOverflowWidgets: true,
          hover: { above: false },
          suggest: { snippetsPreventQuickSuggestions: false },
          scrollbar: { alwaysConsumeMouseWheel: false },
          glyphMargin: false,
          editContext: false,
        },
        codeResources: {
          modified: {
            text: code,
            uri: `diagram-${idRef.current}.hyl`,
            enforceLanguageId: language,
          },
        },
        overrideAutomaticLayout: false,
      };

      // Initialize EditorApp
      const editorApp = new EditorApp(editorAppConfig);
      editorAppRef.current = editorApp;
      disposables.push(editorApp);

      await editorApp.start(editorElementRef.current);
      if (!isMounted) return;

      const monacoEditor = editorApp.getEditor()!;
      monacoEditor.layout();
      editorRef.current = monacoEditor;
      setHideMainContent(false);

      const modelValue = monacoEditor.getModel()!;
      editorModelRef.current = modelValue;

      // Undo/Redo Transaction Logic
      const originalPushStackElement =
        modelValue.pushStackElement.bind(modelValue);
      modelValue.pushStackElement = () => {
        if (transactionStateRef.current === TransactionState.None) {
          originalPushStackElement();
        }
      };

      // Content Change Listener
      const changeDisposable = modelValue.onDidChangeContent(() => {
        if (!isUpdatingModelRef.current) {
          const newValue = monacoEditor.getValue();
          onCodeChange(newValue);
        }

        if (transactionStateRef.current === TransactionState.Committed) {
          transactionStateRef.current = TransactionState.None;
        }
      });
      disposables.push(changeDisposable);

      // Notification Handlers
      const uri = modelValue.uri.toString();

      const revealHandler = currentLanguageClient.onNotification(
        PublishDocumentRevealNotification.type,
        (message: any) => {
          if (monacoEditor && message.uri === uri) {
            const range = message.range;
            const editorRange = {
              startLineNumber: range.start.line + 1,
              startColumn: range.start.character + 1,
              endLineNumber: range.end.line + 1,
              endColumn: range.end.character + 1,
            };
            monacoEditor.setSelection(editorRange);
            monacoEditor.revealRange(editorRange);
          }
        }
      );
      disposables.push(revealHandler);

      // Send Open Notification
      currentLanguageClient.sendNotification(DiagramOpenNotification.type, {
        clientId: uri,
        diagramUri: uri,
      });

      // Define Proxy Class (Inside effect to capture closure variables safely)
      class LspDiagramServerProxy extends DiagramServerProxy {
        override clientId = uri;

        override initialize(registry: ActionHandlerRegistry): void {
          super.initialize(registry);
          const handler = currentLanguageClient.onNotification(
            DiagramActionNotification.type,
            (message: any) => {
              if (
                "newRoot" in message.action &&
                message.action.newRoot !== undefined &&
                message.clientId === this.clientId
              ) {
                if (onUpdateDiagram)
                  onUpdateDiagram(message.action.newRoot as Root);
              }
              this.messageReceived(message);
            }
          );
          disposables.push(handler);
        }

        protected override sendMessage(message: any): void {
          currentLanguageClient.sendNotification(
            DiagramActionNotification.type,
            message
          );
        }

        protected override handleUndo(): void {
          monacoEditor.focus();
          monacoEditor.trigger("diagram", "undo", {});
        }

        protected override handleRedo(): void {
          monacoEditor.focus();
          monacoEditor.trigger("diagram", "redo", {});
        }

        protected override handleTransactionStart(): void {
          editorModelRef.current?.pushStackElement();
          transactionStateRef.current = TransactionState.InProgress;
        }

        protected override handleTransactionCommit(): void {
          transactionStateRef.current = TransactionState.Committed;
        }
      }

      // Sprotty Container Setup
      const containerId = `sprotty-container-${idRef.current}`;
      // Ensure the div has the ID before Sprotty looks for it
      if (sprottyContainerRef.current)
        sprottyContainerRef.current.id = containerId;

      const container = createContainer(containerId);
      container.bind(LspDiagramServerProxy).toSelf().inSingletonScope();
      container.bind(TYPES.ModelSource).toService(LspDiagramServerProxy);

      const currentActionDispatcher = container.get<IActionDispatcher>(
        TYPES.IActionDispatcher
      );
      actionDispatcherRef.current = currentActionDispatcher;

      currentActionDispatcher
        .request(RequestModelAction.create())
        .then((response) => {
          currentActionDispatcher.dispatch(response);
        });
    };

    init();

    // Cleanup (onBeforeUnmount)
    return () => {
      isMounted = false;
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch (e) {
          console.error(e);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array = run once on mount

  // 3. Resize Observers
  useEffect(() => {
    if (!editorElementRef.current || !sprottyWrapperRef.current) return;

    const editorObserver = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    editorObserver.observe(editorElementRef.current);

    const sprottyObserver = new ResizeObserver(() => {
      actionDispatcherRef.current?.dispatch({
        kind: ResetCanvasBoundsAction.KIND,
      } as ResetCanvasBoundsAction);
    });
    sprottyObserver.observe(sprottyWrapperRef.current);

    return () => {
      editorObserver.disconnect();
      sprottyObserver.disconnect();
    };
  }, []);

  // 4. Keyboard Shortcuts (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault(); // Prevent browser save
        if (onSave) onSave();
      }
    };

    const element = editorElementRef.current;
    element?.addEventListener("keydown", handleKeyDown);
    return () => element?.removeEventListener("keydown", handleKeyDown);
  }, [onSave]);

  // --- Render ---

  return (
    <div
      className={`editor-container ${hideMainContent ? "hidden" : ""}`}
      style={{
        width: "100%",
        height: "100%",
        display: hideMainContent ? "none" : "block",
      }}
    >
      <Split
        className={`split-container ${
          horizontal ? "split-horizontal" : "split-vertical"
        }`}
        direction={horizontal ? "vertical" : "horizontal"}
        sizes={[50, 50]}
        minSize={100}
        gutterSize={4}
        cursor="col-resize"
      >
        {/* Pane 1: Monaco Editor */}
        <div className="pane">
          <div
            ref={editorElementRef}
            className="editor-element"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Pane 2: Sprotty Diagram */}
        <div className="pane">
          <div
            ref={sprottyWrapperRef}
            className="sprotty-wrapper"
            style={{
              width: "100%",
              height: "100%",
              // CSS Variable injection for the diagram background
              // @ts-ignore
              "--diagram-background": diagramBackground,
            }}
          >
            <div
              ref={sprottyContainerRef}
              id={`sprotty-container-${idRef.current}`}
            ></div>
          </div>
        </div>
      </Split>

      {/* Global/Local CSS for the split functionality */}
      <style>{`
                .split-container {
                    display: flex;
                    flex-direction: row;
                    height: 100%;
                }
                .split-horizontal {
                    flex-direction: column;
                }
                .gutter {
                    background-color: transparent;
                    background-repeat: no-repeat;
                    background-position: 50%;
                    z-index: 5;
                    position: relative;
                }
                .gutter:hover {
                    background-color: #007fd4;
                    transition: background-color 0s 0.25s;
                }
                .split-container.split-horizontal > .gutter {
                    height: 4px;
                    cursor: row-resize;
                    margin-top: -2px;
                    margin-bottom: -2px;
                }
                .split-container.split-vertical > .gutter {
                    width: 4px;
                    cursor: col-resize;
                    margin-left: -2px;
                    margin-right: -2px;
                }
                /* Pane Separators styling */
                .pane {
                    position: relative;
                    overflow: hidden; /* Ensure content doesn't spill during resize */
                }
            `}</style>
    </div>
  );
};
