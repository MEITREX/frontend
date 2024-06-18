import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Form, FormSection } from "./Form";
import { useState,useEffect } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { ItemFormSectionCourseSkillsQuery } from "@/__generated__/ItemFormSectionCourseSkillsQuery.graphql";
import { BloomLevel,SkillInput } from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import { Add } from "@mui/icons-material";

const bloomLevelLabel: Record<BloomLevel, string> = {
    CREATE:"Create",
    EVALUATE:"Evaluate",
    ANALYZE: "Analyze",
    APPLY: "Apply",
    REMEMBER: "Remember",
    UNDERSTAND: "Understand",
    "%future added value": "Unknown",
};
export function ItemFormSection({
    onChange ,
    item,
    courseId,
    useEffectNecessary,
  }: {
    onChange: (item: ItemData| null,newSkillAdded?:boolean) => void;
    item: ItemData ;
    courseId: string;
    useEffectNecessary?:boolean;
  }) {
    const [bloomLevels, setBloomLevels] = useState<BloomLevel[]>(item?.associatedBloomLevels ?? []);; 
    const[skills,setSkills]=useState<Skill[]>(item?.associatedSkills??[]);
    const[itemId,setItemId]=useState(item?.id)
    const valid =bloomLevels.length>0 && skills.length>0;
    const[newSkillAdded,setNewSkillAdded]=useState(false);
    const { coursesByIds } = useLazyLoadQuery<ItemFormSectionCourseSkillsQuery>(
      graphql`
        query ItemFormSectionCourseSkillsQuery($id: UUID!) {
          coursesByIds(ids: [$id]) {
          id  
          title
            skills {
                  id
                  skillName
            }
          }
        }
      `,
      {id:courseId }
    );

    const[availableSkills,setAvailableSkills]=useState(coursesByIds[0].skills);
    const [newSkill, setNewSkill] = useState(""); // new state variable for the new skill
    function handleAddSkill() {
      if (newSkill) {
	const isAlreadyAvailable=availableSkills.some(skill=>skill.skillName===newSkill)
	if(!isAlreadyAvailable){
	setAvailableSkills([...availableSkills, { skillName: newSkill,id:null}]);
          setNewSkill("");
          setNewSkillAdded(true);
	}
         else{
		alert("The skill is already available!");
	}
      }
	
    }
    function checkIfAvailableSkillIsPartOfSkills(skillToTest:SkillInput){
console.log(skills);
      if(skills.length>0){
        for(let i=0;i< skills.length;i++){
          if(skills[i].skillName==skillToTest.skillName){
            return true;
          }
        }
      }
      return false;
    }
    function handleSkillChange(e: React.ChangeEvent<HTMLInputElement>, skill:Skill) {
        if (e.target.checked) {
          setSkills([...skills,skill]);
        } else {
          let newSkillSet=skills.filter(s => s.id !== skill.id);
          setSkills(newSkillSet);

        }
      }
 


      useEffect(() => {
          onChange(
            valid
              ? {
                  id: itemId,
                  associatedBloomLevels: bloomLevels,
                  associatedSkills: skills,
                }
              : null,
            newSkillAdded
          );
      }, [bloomLevels, skills]);
    return(
          <FormSection title="Item Information">
            <FormControl variant="outlined">
            <InputLabel htmlFor="assessmentBloomLevelsInput">Levels of Blooms Taxonomy</InputLabel>

                <Select
                className="min-w-[16rem] "
                label="Bloom Level"
                labelId="assessmentBloomLevelsLabel"
                value={bloomLevels ?? []}
                onChange={({ target: { value } }) =>
                setBloomLevels(
                (typeof value === "string"
                    ? value.split(",")
                    : value) as BloomLevel[]
                )
                }
                renderValue={(selected) =>
                    selected.map((x) => bloomLevelLabel[x]).join(", ")
                }
                inputProps={{ id: "assessmentBloomLevelsInput" }}
                required
                multiple
                >
                {(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE","EVALUATE","CREATE"] as const).map(
                (val, i) => (
                <MenuItem value={val} key={i}>
                    <Checkbox checked={(bloomLevels?? []).indexOf(val) > -1} />

                    <ListItemText>{bloomLevelLabel[val]}</ListItemText>
                </MenuItem>
                )
                )}
                </Select>
            </FormControl>
            <FormGroup >
            <InputLabel htmlFor="">Associated Skills:</InputLabel>
                {availableSkills.map((availableSkill:SkillInput) => (
                <div  key={availableSkill.id}>
                    <FormControlLabel
                    sx={{ cursor: "default" }}
                    control={
                        <Checkbox
                        sx={{ cursor: "default" }}
                        disableRipple
                        checked={checkIfAvailableSkillIsPartOfSkills(availableSkill)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSkillChange(e, availableSkill)}
                        key={availableSkill.id}
                    />
                    }
                    label={
                         availableSkill.skillName
                    }
                    />
                    </div>
                ),)}
              </FormGroup>
              <FormSection title="Add New Skill">
              <Button onClick={handleAddSkill} startIcon={<Add />}>Add Skill</Button>
              <TextField
                label="New Skill"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
            />
            <p/>
            </FormSection>
          </FormSection>
        );
  }

  export type ItemData = {
    associatedBloomLevels: BloomLevel[];
    associatedSkills: SkillInput[];
    id?:string;
  }; 
  export type Skill={
    skillName: string,
    id?: string | null;
  };