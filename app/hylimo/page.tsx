"use client";

import SprottyDiagram from "@/components/hylimo/SprottyDiagram";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";
import Split from "react-split";

const MonacoEditor = dynamic(() => import('../../components/hylimo/MonacoEditor'), {
  ssr: false,
  loading: () => <p>Lade Editor...</p>
});


const HyLiMoEditor: React.FC = () => {

  const [languageClient, setLanguageClient] = useState<any>(null);

  const handleClientReady = (client: any) => {
      console.log("✅ [DEBUG Step 1 SUCCESS] HyLiMoEditor has received the client object!", client);
      setLanguageClient(client);
  };

    const handleOnDiagramUpdate = (msg: any) => {
      console.log(msg)
  };

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
        <div style={{ height: "100%", overflow: "hidden" }}>
          <MonacoEditor onClientReady={handleClientReady}/>
        </div>

        {/* RIGHT: Sprotty */}
        <div style={{ height: "100%", overflow: "hidden" }}>
          <SprottyDiagram languageClient={languageClient} />
        </div>
      </Split>
    </Box>
  );
};

export default HyLiMoEditor;
