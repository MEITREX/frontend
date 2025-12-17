"use client";
import { DiagramActionNotification, DiagramOpenNotification } from '@hylimo/diagram-protocol';
import { createContainer, DiagramServerProxy, TYPES } from "@hylimo/diagram-ui";
import React, { useEffect, useRef } from 'react';
import "reflect-metadata";
import { ActionHandlerRegistry, IActionDispatcher } from "sprotty";
import { RequestModelAction } from "sprotty-protocol";
import "./hylimo.css";
import "./sprotty.css";
import "./toolbox.css";


interface SprottyDiagramProps { languageClient: any; id?: string; }

const SprottyDiagram: React.FC<SprottyDiagramProps> = ({ languageClient, id = '1' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initiatedRef = useRef(false);

    useEffect(() => {
        if (!languageClient || !containerRef.current || initiatedRef.current) return;

        const uri = `diagram-1.hyl`;
        console.log(`Start Sprotty für: ${uri}`);

        class LspDiagramServerProxy extends DiagramServerProxy {
            override clientId = uri;
            override initialize(registry: ActionHandlerRegistry): void {
                super.initialize(registry);

                languageClient.onNotification(DiagramActionNotification.type, (msg: any) => {
                    if (msg.clientId === this.clientId) this.messageReceived(msg);
                });
            }
            protected override sendMessage(msg: any): void {
                languageClient.sendNotification(DiagramActionNotification.type, msg);
            }
            protected handleUndo(): void {}
            protected handleRedo(): void {}
            protected handleTransactionStart(): void {}
            protected handleTransactionCommit(): void {}
        }

        const container = createContainer(`sprotty-container-${id}`);
        container.bind(LspDiagramServerProxy).toSelf().inSingletonScope();
        container.bind(TYPES.ModelSource).toService(LspDiagramServerProxy);

        const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher);

        languageClient.sendNotification(DiagramOpenNotification.type, { clientId: uri, diagramUri: uri });
        setTimeout(() => {
            dispatcher.request(RequestModelAction.create()).catch(console.error);
        }, 2000);

        initiatedRef.current = true;
    }, [languageClient, id]);

    return (
        <div className="sprotty-wrapper" style={{ height: '100%', width: '100%', backgroundColor: 'white', overflow: 'hidden' }}>
            <div id={`sprotty-container-${id}`} ref={containerRef} style={{height: '100%'}} />
        </div>
    );
};
export default SprottyDiagram;