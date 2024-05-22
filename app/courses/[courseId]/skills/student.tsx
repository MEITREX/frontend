import { Heading } from "@/components/Heading";
import { SkillLevels } from "@/components/SkillLevels";
import { Grid, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import { studentCourseSkillsQuery } from "@/__generated__/studentCourseSkillsQuery.graphql";

export default function StudentSkills() {
    // Get course id from url
    const { courseId:id } = useParams();
    const { coursesByIds } = useLazyLoadQuery<studentCourseSkillsQuery>(
        graphql`
          query studentCourseSkillsQuery($id: UUID!) {
            coursesByIds(ids: [$id]) {
            id  
            title
              skills {
                    skillName
                    skillLevels {
                    remember {
                      value
                    }
                    understand {
                      value
                    }
                    apply {
                      value
                    }
                    analyze {
                      value
                    }
                    evaluate{
                      value
                    }
                    create{
                      value
                    }
                }
                ...SkillLevelsFragment
              }
            }
          }
        `,
        { id }
      );
    // Extract course
    const course = coursesByIds[0];
    const skills=course.skills;
    const title="Knowledge Status for Course "+course.title;
    return (<main>
        <Heading title={title} backButton />
        <p/>
        <Typography>This pages shows your current knowledge status. Your knowledge status is calculated based on your performances on flashcardsets and quizzes.
          For the calculation a method called M-Elo is used. Elo was originally used to rank chess players, but due to adaptions it can also be used to calculate students 
          knowledge status. After the completion of a flashcardset or a quiz, M-Elo will automatically recalulate your knowledge status of the skills, that were covered by
          the flashcardset or quiz you worked on. Each flashcard and each question has a list with the skills and levels of Blooms Taxonomy, that belong to the flashcard or quiz.
          After the completion of a quiz only the values for the involved skills and the corresponding levels are recalulated. Due to this, this overview only shows the skills and 
          the level of Blooms Taxonomy you have already worked on.
        </Typography>
        <Grid container direction="column" alignItems="center" justifyContent="center">
        {skills.map((skill, index) => (
          skill.skillLevels && <div key={index}>
            <Grid item>
              <Typography variant="body1" align="center"><b>{skill.skillName}</b></Typography>
            </Grid>
            <Grid item>
              <SkillLevels _skill={skill} courseId={course.id}/>
            </Grid>
            <br/>
            </div>

          ))}
        </Grid>
        </main>);
}