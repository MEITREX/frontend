import { HylimoEditor } from "@/components/uml-assessment/HylimoEditor";
import { HylimoWrapper } from "@/components/uml-assessment/HylimoWrapper";

export default function UmlAssessment() {
  return(
  <>
    <HylimoWrapper code={"Hello World"} onCodeChange={function (newCode: string): void {
       console.log("newCode");
     } }>

    </HylimoWrapper>
  </>
  );
}
