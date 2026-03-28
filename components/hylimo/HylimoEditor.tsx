"use client";

import { language, LanguageClientProxy, setupLanguageClient } from "@/components/hylimo/lspPlugin";
import type { Root } from "@hylimo/diagram-common";
import { DiagramActionNotification, DiagramCloseNotification, DiagramOpenNotification } from "@hylimo/diagram-protocol";
import { createContainer, DiagramServerProxy, ResetCanvasBoundsAction, TYPES } from "@hylimo/diagram-ui";
import { Box } from "@mui/material";
import type * as monaco from "monaco-editor";
import { EditorApp, type EditorAppConfig } from "monaco-languageclient/editorApp";
import { useEffect, useRef, useState } from "react";
import Split from "react-split";
import type { ActionHandlerRegistry, IActionDispatcher, IActionHandler } from "sprotty";
import { FitToScreenAction, RequestModelAction } from "sprotty-protocol";
import type { Disposable } from "vscode-languageserver-protocol";
import { DiagramDownload } from "./DownloadDigram";

import "@hylimo/diagram-ui/css/hylimo.css";
import "@hylimo/diagram-ui/css/toolbox.css";
import "./style.css";

enum TransactionState {
    None,
    InProgress,
    Committed
}

let globalLanguageClientPromise: Promise<LanguageClientProxy> | null = null;
function getLanguageClient() {
  if (!globalLanguageClientPromise) {
    globalLanguageClientPromise = setupLanguageClient();
  }
  return globalLanguageClientPromise;
}

export default function HylimoEditor({
  initialValue,
  onChange,
  readOnly = false
}: {
  initialValue: string;
  onChange (value: string): void;
  readOnly?: boolean;
}) {
  const [sourceCode, setSourceCode] = useState(initialValue);
  const [diagram, setDiagram] = useState<Root | undefined>();
  const editorElement = useRef<HTMLDivElement | null>(null);
  const sprottyWrapperRef = useRef<HTMLDivElement | null>(null);
  const disposablesRef = useRef<(Disposable)[]>([]);
  const languageClientRef = useRef<Promise<LanguageClientProxy> | null>(null);
  const editorStartedRef = useRef(false);

  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const readOnlyRef = useRef(readOnly);
  const isUpdatingModelRef = useRef(false);
  const actionDispatcherRef = useRef<IActionDispatcher | null>(null);
  const modelUriRef = useRef(`file:///diagram-${Math.random().toString(36).slice(2)}.hyl`);
  const sprottyContainerIdRef = useRef(`sprotty-container-${Math.random().toString(36).slice(2)}`);
  const fitTimeoutRef = useRef<number | null>(null);

  // 1. Sync and Update
  useEffect(() => {
    readOnlyRef.current = readOnly;
    const editor = monacoEditorRef.current;

    if (editor) {
      editor.updateOptions({
        readOnly: readOnly,
        domReadOnly: readOnly,
      });

      const currentModel = editor.getModel();
      if (currentModel && currentModel.getValue() !== initialValue) {
        isUpdatingModelRef.current = true;
        currentModel.setValue(initialValue);
        isUpdatingModelRef.current = false;

        if (actionDispatcherRef.current) {
          setTimeout(() => {
            actionDispatcherRef.current?.dispatch(FitToScreenAction.create([]));
            editor.layout();
          }, 250);
        }
      }
    }
  }, [readOnly, initialValue]);

  // 2. Init
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let isDisposed = false;

    (async () => {
        if (!editorElement.current || editorStartedRef.current) return;
        editorStartedRef.current = true;

        if (!languageClientRef.current) {
            languageClientRef.current = getLanguageClient();
        }
        const currentLanguageClient = await languageClientRef.current;
      if (isDisposed) return;

        const editorAppConfig: EditorAppConfig = {
            editorOptions: {
                language,
                readOnly: readOnlyRef.current,
                domReadOnly: readOnlyRef.current,
                fixedOverflowWidgets: true,
                glyphMargin: false,
                editContext: false,
            },
            codeResources: {
                modified: {
                    text: initialValue,
                uri: modelUriRef.current,
                    enforceLanguageId: language
                }
            },
            overrideAutomaticLayout: false
        };

        const editorApp = new EditorApp(editorAppConfig);
        disposablesRef.current.push(editorApp);
        await editorApp.start(editorElement.current!);
        if (isDisposed) return;

        const monacoEditor = editorApp.getEditor()!;
        monacoEditorRef.current = monacoEditor;

        const editorModel = monacoEditor.getModel()!;
        const transactionStatus = { state: TransactionState.None };

        const originalPushStackElement = editorModel.pushStackElement.bind(editorModel);

        editorModel.pushStackElement = () => {
            if (transactionStatus.state === TransactionState.None) {
                originalPushStackElement();
            }
        };

        const keyDownDisposable = monacoEditor.onKeyDown((e) => {
            if (readOnlyRef.current) {
                const isCopy = (e.ctrlKey || e.metaKey) && e.keyCode === 33;
                const isNavKey = [1, 2, 15, 16, 17, 18, 19, 20].includes(e.keyCode);
                if (!isCopy && !isNavKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
        disposablesRef.current.push(keyDownDisposable);

        const changeDisposable = monacoEditor.onDidChangeModelContent(() => {
            if (!readOnlyRef.current && !isUpdatingModelRef.current) {
                const newValue = monacoEditor.getValue();
                onChange(newValue);
                setSourceCode(newValue);

                if (transactionStatus.state === TransactionState.Committed) {
                    transactionStatus.state = TransactionState.None;
                }
            }
        });
        disposablesRef.current.push(changeDisposable);

        const uri = monacoEditor.getModel()?.uri?.toString() ?? modelUriRef.current;
        if (!uri) return;

        await currentLanguageClient.sendNotification(DiagramOpenNotification.type, {
            clientId: uri,
            diagramUri: uri
        });

        class LspDiagramServerProxy extends DiagramServerProxy {
            clientId = uri!;
            initialize(registry: ActionHandlerRegistry): void {
                super.initialize(registry);
                registry.register('toolboxEditPredictionResponseAction', { handle: () => {} } as IActionHandler);
            const notificationDisposable = currentLanguageClient.onNotification(DiagramActionNotification.type, (msg: any) => {
                    // Extract diagram from action if available (similar to Hylimo Vue version)
                    if (msg.action?.newRoot !== undefined && msg.clientId === this.clientId) {
                        setDiagram(msg.action.newRoot as Root);
                    }
                    if (msg.clientId === this.clientId) this.messageReceived(msg);
                });
            disposablesRef.current.push(notificationDisposable);
            }
            protected sendMessage(msg: any): void {
                const actionKind = msg.action?.kind || msg.kind;
                const essential = ['requestModel', 'computedBounds', 'fitToScreen', 'center', 'setViewport'];
                if (!readOnlyRef.current || essential.includes(actionKind)) {
                    msg.clientId = this.clientId;
                    currentLanguageClient.sendNotification(DiagramActionNotification.type, msg);
                }
            }
            protected handleUndo(): void {
                monacoEditor.focus();
                monacoEditor.trigger("diagram", "undo", {});
            }

            protected handleRedo(): void {
                monacoEditor.focus();
                monacoEditor.trigger("diagram", "redo", {});
            }

            protected handleTransactionStart(): void {
                originalPushStackElement();
                transactionStatus.state = TransactionState.InProgress;
            }

            protected handleTransactionCommit(): void {
                transactionStatus.state = TransactionState.Committed;
            }
        }

        const container = createContainer(sprottyContainerIdRef.current);
        container.bind(LspDiagramServerProxy).toSelf().inSingletonScope();
        container.bind(TYPES.ModelSource).toService(LspDiagramServerProxy);

        const currentActionDispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher);
        actionDispatcherRef.current = currentActionDispatcher;

        const scheduleFit = (delay = 120) => {
          if (fitTimeoutRef.current !== null) {
            window.clearTimeout(fitTimeoutRef.current);
          }
          fitTimeoutRef.current = window.setTimeout(() => {
            if (isDisposed) return;
            currentActionDispatcher.dispatch({ kind: ResetCanvasBoundsAction.KIND } as ResetCanvasBoundsAction);
            currentActionDispatcher.dispatch(FitToScreenAction.create([]));
            monacoEditor.layout();
          }, delay);
        };

        resizeObserver = new ResizeObserver(() => {
            monacoEditor.layout();
          scheduleFit(120);
        });

        if (editorElement.current) resizeObserver.observe(editorElement.current);
        if (sprottyWrapperRef.current) resizeObserver.observe(sprottyWrapperRef.current);

        currentActionDispatcher.request(RequestModelAction.create()).then((response: any) => {
          if (isDisposed) return;
            currentActionDispatcher.dispatch(response);
          requestAnimationFrame(() => scheduleFit(0));
            setTimeout(() => {
            if (isDisposed) return;
            scheduleFit(0);
            }, 200);
          setTimeout(() => {
            if (isDisposed) return;
            scheduleFit(0);
          }, 500);
        });
    })();

    return () => {
        isDisposed = true;
        const uri = monacoEditorRef.current?.getModel()?.uri?.toString() ?? modelUriRef.current;
        const languageClientPromise = languageClientRef.current;
        if (languageClientPromise) {
          void languageClientPromise.then((client) => {
            client.sendNotification(DiagramCloseNotification.type, uri);
          });
        }
        if (fitTimeoutRef.current !== null) {
            window.clearTimeout(fitTimeoutRef.current);
            fitTimeoutRef.current = null;
        }
        disposablesRef.current.forEach(d => d.dispose?.());
        disposablesRef.current = [];
        editorStartedRef.current = false;
        actionDispatcherRef.current = null;
        monacoEditorRef.current = null;
        if (resizeObserver) resizeObserver.disconnect();
    };
}, []);

  return (
    <Box
      sx={{
        height: "100%", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column",
        "& .split": { display: "flex", height: "100%", flex: 1 },
        "& .gutter": { backgroundColor: "action.hover", width: "10px !important", cursor: "col-resize" },
        "& .toolbox-wrapper, & .toolbox-root": {
          display: readOnly ? "none !important" : "block"
        },
        "& .selectable": {
          pointerEvents: readOnly ? "none !important" : "all"
        },
        "& .readonly-mode .monaco-editor .view-lines": {
          userSelect: "text !important",
          cursor: "text !important"
        }
      }}
    >
      <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <DiagramDownload
          diagram={diagram}
          fileName="diagram"
          sourceCode={sourceCode}
          variant="icon"
        />
      </Box>
      <Split className="split" sizes={[50, 50]} minSize={100} gutterSize={10}>
        <div
          ref={editorElement}
          className={readOnly ? "readonly-mode" : ""}
          style={{ width: "100%", height: "100%" }}
        />
        <div className="sprotty-wrapper" ref={sprottyWrapperRef} style={{ height: "100%", width: "100%" }}>
           <div id={sprottyContainerIdRef.current}></div>
        </div>
      </Split>
    </Box>
  );
}