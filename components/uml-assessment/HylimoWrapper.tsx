import React, { useContext, useMemo } from "react";
// Pass die Pfade ggf. an deine Ordnerstruktur an
import { LspContext } from "./lspPlugin";
import { DiagramEditorContext, HylimoEditor } from "./HylimoEditor";

interface HylimoWrapperProps {
  code: string;
  onCodeChange: (newCode: string) => void;
}

export const HylimoWrapper: React.FC<HylimoWrapperProps> = ({ code, onCodeChange }) => {
  const lspContext = useContext(LspContext);

  // Wir nutzen useMemo, damit das Objekt nicht bei jedem Render neu erstellt wird
  const editorContextValue = useMemo(() => {
    if (!lspContext) return null;

    // Zugriff auf die aktuelle Config vom Server
    // Wir nutzen 'as any', um sicherzugehen, dass wir auf 'backgroundColor' zugreifen können,
    // falls der Typ aus der Library das nicht explizit anzeigt.
    const currentConfig = lspContext.languageServerConfig.diagramConfig as any;

    // Die aktuelle Farbe (entweder hell oder dunkel, je nach Theme)
    const activeBgColor = currentConfig.backgroundColor || "#ffffff";

    return {
      languageClient: lspContext.languageClient,
      diagramIdProvider: lspContext.diagramIdProvider,

      // HIER IST DER FIX: Wir bauen die Struktur so nach, wie HylimoEditor sie will.
      languageServerConfig: {
        diagramConfig: {
          // Der Editor will 'lightBackgroundColor' lesen?
          // Wir geben ihm einfach die aktuell aktive Farbe!
          lightBackgroundColor: activeBgColor,
          darkBackgroundColor: activeBgColor // Fallback
        }
      }
    };
  }, [lspContext]);

  if (!lspContext || !editorContextValue) {
    return <div>Lade Diagramm-Dienste...</div>;
  }

  return (
    <DiagramEditorContext.Provider value={editorContextValue}>
      <HylimoEditor
         code={code}
         onCodeChange={onCodeChange}
         horizontal={false}
      />
    </DiagramEditorContext.Provider>
  );
};