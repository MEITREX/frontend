import { StudentSectionFragment$key } from "@/__generated__/StudentSectionFragment.graphql";
import { every, orderBy, some } from "lodash";
import { Fragment } from "react";
import { graphql, useFragment } from "react-relay";
import { Section, SectionContent, SectionHeader } from "./Section";
import { StageBarrier } from "./Stage";
import { StudentStage } from "./StudentStage";

export function StudentSection({
  _section,
}: {
  _section: StudentSectionFragment$key;
}) {
  const section = useFragment(
    graphql`
      fragment StudentSectionFragment on Section {
        id
        name
        stages {
          id
          position
          requiredContentsProgress
          ...StudentStageFragment
        }
      }
    `,
    _section
  );

  const stages = orderBy(section.stages, (stage) => stage.position);

  const stageComplete = stages.map(
    (stage) => stage.requiredContentsProgress === 100
  );
  const stageDisabled = stages.map((_, i) =>
    some(stages.slice(0, i), (_, idx) => !stageComplete[idx])
  );
  const sectionComplete = every(stages, (_, idx) => stageComplete[idx]);

  return (
    <Section done={sectionComplete}>
      <SectionHeader>{section.name}</SectionHeader>
      <SectionContent>
        {stages.map((stage, i) => (
          <Fragment key={stage.id}>
            {/* Show barrier if this is the first non-complete stage */}
            {(i == 0
              ? false
              : !stageComplete[i - 1] && !stageDisabled[i - 1]) && (
              <StageBarrier />
            )}
            <StudentStage
              key={stage.id}
              _stage={stage}
              disabled={stageDisabled[i]}
            />
          </Fragment>
        ))}
      </SectionContent>
    </Section>
  );
}
