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
      {item.associatedBloomLevels
        // NOTE: can't grasp why this value was added here...
        .filter((bloom) => bloom !== "%future added value")
        .map((level) => (
          <Chip
            key={level}
            sx={{
              backgroundColor: (theme) =>
                theme.palette.bloomsTaxonomy[level] + "65",
              border: (theme) =>
                `solid 1px ${theme.palette.bloomsTaxonomy[level] + "75"}`,
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
          key={skill.skillCategory + "-" + skill.skillName}
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
          sx={{
            "& > .MuiTooltip-tooltipPlacementTop": {
              backgroundColor: "surfaceA.30",
              color: "text.secondary",
            },
          }}
        >
          <Chip
            key={`${skill.skillCategory}-${skill.skillName}`}
            sx={{
              backgroundColor: "surfaceA.30",
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
