import { InterpreterModule } from "@hylimo/core";
import {
  DiagramEngine,
  type LayoutedDiagram,
  type RenderErrors,
} from "@hylimo/diagram";
import type { DiagramConfig } from "@hylimo/diagram-common";
import type { Graph } from "./HyLiMoTypes";
import { SemanticAnalyzer } from "./semanticAnalyzer";

export class SemanticEvaluator extends DiagramEngine {
  constructor(
    additionalInterpreterModules: InterpreterModule[] = [],
    maxExecutionSteps: number = 1000000
  ) {
    super(additionalInterpreterModules, maxExecutionSteps);
  }

  async analyze(source: string): Promise<AnalysisResult> {
    const config: DiagramConfig = {
      theme: "dark",
      primaryColor: "#000000",
      backgroundColor: "#ffffff",
      enableExternalFonts: false,
      enableFontSubsetting: false,
    };
    const result = await this.renderInternal(
      source,
      config,
      async (layoutWithRoot) => {
        let layoutedDiagram: LayoutedDiagram;
        try {
          layoutedDiagram = await this.layoutEngine.layout(
            layoutWithRoot,
            config,
            false
          );
        } catch (e) {
          return {
            errors: this.generateErrors({ layoutErrors: [e as Error] }),
          };
        }

        const result = new SemanticAnalyzer(
          layoutWithRoot.layout,
          layoutWithRoot.root,
          layoutedDiagram
        ).graph;
        return { errors: this.generateErrors({}), result };
      }
    );
    return { errors: result.errors, graph: result.result };
  }
}

export interface AnalysisResult {
  errors: RenderErrors;
  graph: Graph | undefined;
}
