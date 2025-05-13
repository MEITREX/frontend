import { BloomLevel } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { LightTooltip } from "@/components/LightTooltip";
import { Chip, Divider, Stack } from "@mui/material";
import { CreateItem, getStandardizedCompetencies } from "./ItemFormSection";

export type ItemFormSectionPreviewProps = {
  item: CreateItem;
};

const ItemFormSectionPreview = ({ item }: ItemFormSectionPreviewProps) => {
  const skillsSelected = item.associatedSkills;

  const {
    staticSkillCategorySkillMap: SKILL_CATALOGUE,
    staticSkillCategoryTitleShortNameMap: SKILL_CATEGORY_ABBREVIATION,
  } = getStandardizedCompetencies();

  return (
    <Stack
      id="skills-selected"
      direction="row"
      alignItems="center"
      minWidth="250px"
      sx={{
        alignItems: "start",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {item.associatedBloomLevels.map((level) => (
        <Chip
          key={level}
          sx={{
            backgroundColor: BLOOM_TAXONOMY_COLORS[level] + "45",
            border: `solid 1px ${BLOOM_TAXONOMY_COLORS[level] + "48"}`,
          }}
          label={level[0].toUpperCase() + level.slice(1).toLowerCase()}
          title="Bloom Taxonomy"
        />
      ))}
      <Divider
        flexItem
        orientation="vertical"
        sx={{ margin: "0 4px", height: "32px" }}
      />
      {skillsSelected.map((skill) => (
        <LightTooltip
          title={
            <>
              <p>
                <strong>{skill.skillCategory + ":"}</strong>
              </p>
              <p>
                <strong>{skill.skillName}</strong>
              </p>
            </>
          }
          placement="top"
        >
          <Chip
            key={`${skill.skillCategory}-${skill.skillName}`}
            sx={{
              maxWidth: "200px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            label={
              (SKILL_CATEGORY_ABBREVIATION[skill.skillCategory] ||
                skill.skillCategory) +
              ": " +
              skill.skillName
            }
          />
        </LightTooltip>
      ))}
    </Stack>
  );
};

export default ItemFormSectionPreview;

// colors/ difficulty in inspiration of https://en.wikipedia.org/wiki/Bloom%27s_taxonomy
const BLOOM_TAXONOMY_COLORS: Record<BloomLevel, string> = {
  REMEMBER: "#00FF7F",
  UNDERSTAND: "#00FF00",
  APPLY: "#7FFF00",
  ANALYZE: "#FFFF00",
  CREATE: "#FF7F00",
  EVALUATE: "#FF0000",
  "%future added value": "#FFFFFF",
} as const;
