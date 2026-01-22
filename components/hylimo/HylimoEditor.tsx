"use client";

import { Box } from "@mui/material";
import Split from "react-split";
import { useEffect, useRef } from "react";
import { LanguageClientProxy, setupLanguageClient, language } from "@/components/hylimo/lspPlugin";
import { EditorApp, type EditorAppConfig } from "monaco-languageclient/editorApp";
import type { Disposable } from "vscode-languageserver-protocol";
import { DiagramActionNotification, DiagramOpenNotification } from "@hylimo/diagram-protocol";
import { createContainer, DiagramServerProxy, ResetCanvasBoundsAction, TYPES } from "@hylimo/diagram-ui";
import type { ActionHandlerRegistry, IActionDispatcher } from "sprotty";
import { RequestModelAction, type ActionMessage } from "sprotty-protocol";
import type { ActionHandlerRegistry, IActionDispatcher } from "sprotty";

import "./style.css";
import "@hylimo/diagram-ui/css/hylimo.css";
import "@hylimo/diagram-ui/css/toolbox.css";




let globalLanguageClientPromise: Promise<LanguageClientProxy> | null = null;
function getLanguageClient() {
  if (!globalLanguageClientPromise) {
    globalLanguageClientPromise = setupLanguageClient();
  }
  return globalLanguageClientPromise;
}

export default function HylimoEditor() {
  const editorElement = useRef<HTMLDivElement | null>(null);
  const sprottyWrapper = useRef<HTMLDivElement | null>(null);

  const disposablesRef = useRef<(Disposable)[]>([]);
  const languageClientRef = useRef<Promise<LanguageClientProxy> | null>(null);


  const editorStartedRef = useRef(false);

  useEffect(() => {
    (async () => {

      if (!editorElement.current) return;

      if (editorStartedRef.current) return;
      editorStartedRef.current = true;

      if (!languageClientRef.current) {
        languageClientRef.current = getLanguageClient();
      }

      const currentLanguageClient = await languageClientRef.current;

      const editorAppConfig: EditorAppConfig = {
        editorOptions: {
          language,
          fixedOverflowWidgets: true,
          hover: { above: false },
          suggest: { snippetsPreventQuickSuggestions: false },
          scrollbar: { alwaysConsumeMouseWheel: false },
          glyphMargin: false,
          editContext: false
        },
        codeResources: {
          modified: {
            text: "classDiagram {\n"+
              "    class(\"HelloWorld\") {\n"+
              "        public {\n"+
              "            hello : string\n"+
              "        }\n"+
              "    }\n"+
              "}",
            uri: `diagram.hyl`,
            enforceLanguageId: language
          }
        },
        overrideAutomaticLayout: false
      };

      const editorApp = new EditorApp(editorAppConfig);
      disposablesRef.current.push(editorApp);
      await editorApp.start(editorElement.current!);

      const monacoEditor = editorApp.getEditor()!;
      monacoEditor.layout();


      disposablesRef.current.push(editorApp);

      const uri = monacoEditor.getModel()?.uri?.toString();

      if (uri == undefined) {
        throw new Error("Missing editor or model");
      }
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
          currentLanguageClient.sendNotification(DiagramActionNotification.type, msg);
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
      //actionDispatcher.value = currentActionDispatcher;
      currentActionDispatcher.request(RequestModelAction.create()).then((response) => {
        currentActionDispatcher.dispatch(response);
      });

    })();
    return () => {
      disposablesRef.current.forEach(d => {
        try {
          d.dispose?.();
        } catch {}
      });
      }

  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        "& .split": { display: "flex", height: "100%" },
        "& .gutter": {
          backgroundColor: "action.hover",
          width: "10px !important",
          cursor: "col-resize",
        },
        "& .gutter:hover": { backgroundColor: "primary.main" },
      }}
    >
      <Split className="split" sizes={[50, 50]} minSize={100} gutterSize={10}>
        {/* LEFT: Monaco Editor */}
        <div>
          <div ref={editorElement} className="editor-element" style={{ width: "100%", height: "100%" }} />
        </div>

        {/* RIGHT: Sprotty */}
        <div style={{ height: "100%", width: "100%" }}>
          <div ref={sprottyWrapper} className="sprotty-wrapper">
            <div id="sprotty-container-1"></div>
          </div>
        </div>
      </Split>
    </Box>
  );
}
