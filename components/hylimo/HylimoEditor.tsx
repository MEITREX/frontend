"use client";

import { language, LanguageClientProxy, setupLanguageClient } from "@/components/hylimo/lspPlugin";
import { DiagramActionNotification, DiagramOpenNotification } from "@hylimo/diagram-protocol";
import { createContainer, DiagramServerProxy, TYPES } from "@hylimo/diagram-ui";
import { Box } from "@mui/material";
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
  const disposablesRef = useRef<(Disposable)[]>([]);
  const languageClientRef = useRef<Promise<LanguageClientProxy> | null>(null);
  const editorStartedRef = useRef(false);

  useEffect(() => {
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
          readOnly,
          domReadOnly: readOnly,
          fixedOverflowWidgets: true,
          glyphMargin: false,
          editContext: false
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
      const changeDisposable = monacoEditor.onDidChangeModelContent(() => {
        if (!readOnly) onChange(monacoEditor.getValue());
      });
      disposablesRef.current.push(changeDisposable);

      const uri = monacoEditor.getModel()?.uri?.toString();
      if (!uri) throw new Error("Missing editor or model");

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
          const essentialActions = [
            'requestModel',
            'computedBounds',
            'fitToScreen',
            'center',
            'setViewport'
          ];

          if (!readOnly || essentialActions.includes(actionKind)) {
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

    currentActionDispatcher.request(RequestModelAction.create()).then((response) => {
      currentActionDispatcher.dispatch(response);

      setTimeout(() => {
        currentActionDispatcher.dispatch(FitToScreenAction.create([]));
        monacoEditor.layout();
      }, 200);
  });
    })();

    return () => {
      disposablesRef.current.forEach(d => { try { d.dispose?.(); } catch {} });
      disposablesRef.current = [];
      editorStartedRef.current = false;
    };
  }, [readOnly]);

  return (
    <Box
      sx={{
        height: "100%", width: "100%", overflow: "hidden",
        opacity: readOnly ? 0.95 : 1,
        "& .split": { display: "flex", height: "100%" },
        "& .gutter": { backgroundColor: "action.hover", width: "10px !important", cursor: "col-resize" },
        "& .toolbox-wrapper, & .toolbox-root": {
          display: readOnly ? "none !important" : "block"
        },
        "& .selectable": {
            pointerEvents: readOnly ? "none !important" : "all"
        },
        "& .sprotty-graph": {
            pointerEvents: "all"
        }
      }}
    >
      <Split className="split" sizes={[50, 50]} minSize={100} gutterSize={10}>
        <div ref={editorElement} style={{ width: "100%", height: "100%" }} />
        <div className="sprotty-wrapper" style={{ height: "100%", width: "100%" }}>
           <div id="sprotty-container-1"></div>
        </div>
      </Split>
    </Box>
  );
}