"use client";

import { language, LanguageClientProxy, setupLanguageClient } from "@/components/hylimo/lspPlugin";
import { DiagramActionNotification, DiagramOpenNotification } from "@hylimo/diagram-protocol";
import { createContainer, DiagramServerProxy, ResetCanvasBoundsAction, TYPES } from "@hylimo/diagram-ui";
import { Box } from "@mui/material";
import type * as monaco from "monaco-editor";
import { EditorApp, type EditorAppConfig } from "monaco-languageclient/editorApp";
import { useEffect, useRef } from "react";
import Split from "react-split";
import type { ActionHandlerRegistry, IActionDispatcher } from "sprotty";
import { FitToScreenAction, RequestModelAction } from "sprotty-protocol";
import type { Disposable } from "vscode-languageserver-protocol";

import "@hylimo/diagram-ui/css/hylimo.css";
import "@hylimo/diagram-ui/css/toolbox.css";
import "./style.css";

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
  const editorElement = useRef<HTMLDivElement | null>(null);
  const sprottyWrapperRef = useRef<HTMLDivElement | null>(null);
  const disposablesRef = useRef<(Disposable)[]>([]);
  const languageClientRef = useRef<Promise<LanguageClientProxy> | null>(null);
  const editorStartedRef = useRef(false);

  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const readOnlyRef = useRef(readOnly);
  const isUpdatingModelRef = useRef(false);
  const actionDispatcherRef = useRef<IActionDispatcher | null>(null);

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

    (async () => {
      if (!editorElement.current || editorStartedRef.current) return;
      editorStartedRef.current = true;

      if (!languageClientRef.current) {
        languageClientRef.current = getLanguageClient();
      }
      const currentLanguageClient = await languageClientRef.current;

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
            uri: `file:///diagram.hyl`,
            enforceLanguageId: language
          }
        },
        overrideAutomaticLayout: false
      };

      const editorApp = new EditorApp(editorAppConfig);
      disposablesRef.current.push(editorApp);
      await editorApp.start(editorElement.current!);

      const monacoEditor = editorApp.getEditor()!;
      monacoEditorRef.current = monacoEditor;

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
          onChange(monacoEditor.getValue());
        }
      });
      disposablesRef.current.push(changeDisposable);

      const uri = monacoEditor.getModel()?.uri?.toString();
      if (!uri) return;

      await currentLanguageClient.sendNotification(DiagramOpenNotification.type, {
        clientId: uri,
        diagramUri: uri
      });

      class LspDiagramServerProxy extends DiagramServerProxy {
        override clientId = uri!;
        override initialize(registry: ActionHandlerRegistry): void {
          super.initialize(registry);
          currentLanguageClient.onNotification(DiagramActionNotification.type, (msg: any) => {
            if (msg.clientId === this.clientId) this.messageReceived(msg);
          });
        }
        protected override sendMessage(msg: any): void {
          const actionKind = msg.action?.kind || msg.kind;
          const essential = ['requestModel', 'computedBounds', 'fitToScreen', 'center', 'setViewport'];
          if (!readOnlyRef.current || essential.includes(actionKind)) {
            msg.clientId = this.clientId;
            currentLanguageClient.sendNotification(DiagramActionNotification.type, msg);
          }
        }
        protected handleUndo(): void {}
        protected handleRedo(): void {}
        protected handleTransactionStart(): void {}
        protected handleTransactionCommit(): void {}
      }

      const container = createContainer(`sprotty-container-1`);
      container.bind(LspDiagramServerProxy).toSelf().inSingletonScope();
      container.bind(TYPES.ModelSource).toService(LspDiagramServerProxy);

      const currentActionDispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher);

      actionDispatcherRef.current = currentActionDispatcher;

      resizeObserver = new ResizeObserver(() => {
        monacoEditor.layout();
        currentActionDispatcher.dispatch({ kind: ResetCanvasBoundsAction.KIND } as ResetCanvasBoundsAction);
      });

      if (editorElement.current) resizeObserver.observe(editorElement.current);
      if (sprottyWrapperRef.current) resizeObserver.observe(sprottyWrapperRef.current);

      currentActionDispatcher.request(RequestModelAction.create()).then((response) => {
        currentActionDispatcher.dispatch(response);
        setTimeout(() => {
          currentActionDispatcher.dispatch(FitToScreenAction.create([]));
          monacoEditor.layout();
        }, 200);
      });
    })();

    return () => {
      disposablesRef.current.forEach(d => d.dispose?.());
      disposablesRef.current = [];
      editorStartedRef.current = false;
      actionDispatcherRef.current = null;
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <Box
      sx={{
        height: "100%", width: "100%", overflow: "hidden",
        "& .split": { display: "flex", height: "100%" },
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
      <Split className="split" sizes={[50, 50]} minSize={100} gutterSize={10}>
        <div
          ref={editorElement}
          className={readOnly ? "readonly-mode" : ""}
          style={{ width: "100%", height: "100%" }}
        />
        <div className="sprotty-wrapper" ref={sprottyWrapperRef} style={{ height: "100%", width: "100%" }}>
           <div id="sprotty-container-1"></div>
        </div>
      </Split>
    </Box>
  );
}