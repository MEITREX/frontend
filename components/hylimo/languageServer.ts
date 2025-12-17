import { LanguageServer } from "@hylimo/language-server";
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from "vscode-languageserver/browser.js";

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

class customLanguageServer extends LanguageServer {
    onOpenDiagram(onOpenDiagram:any) {
        console.log(onOpenDiagram);
        console.log("test");
        try {
        super.onOpenDiagram(onOpenDiagram);
        } catch(error:any) {
            console.log(error)
        }
        console.log(this.diagramServerManager.diagramServers);

    }

    // Sollte ausgeführt werden sobald languageServer vom dokument erfährt
    onDidOpenTextDocument(test:any) {
        console.log(test);
        console.log(super.onDidOpenTextDocument(test));
    }


}

const languageServer = new customLanguageServer({
    defaultConfig: {
        diagramConfig: {
            theme: "dark",
            primaryColor: "#ffffff",
            backgroundColor: "#1e1e1e",
            enableFontSubsetting: true,
            enableExternalFonts: false
        },
        settings: {},
        editorConfig: {
            toolboxEnabled: true,
            snappingEnabled: true,
            gridEnabled: true
        }
    },
    connection,
    additionalInterpreterModules: [],
    maxExecutionSteps: 1000000
});
languageServer.listen();