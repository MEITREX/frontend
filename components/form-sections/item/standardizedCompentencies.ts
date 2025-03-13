interface IEEEStandardizedCompetencies {
  knowledgeAreas: KnowledgeArea[];
  sources: Source[];
}
interface KnowledgeArea {
  title: string;
  shortTitle: string;
  competencies: Competence[];
}
interface Competence {
  title: string;
  description: string;
  taxonomy: string;
  version: string;
  sourceId: number;
}
interface Source {
  id: number;
  title: string;
  author: string;
  uri: string;
}

export type MappedSkillType = {
  skillName: string;
  bloomTaxonomy: string;
  description: string;
  isCustomSkill: boolean;
};

export const processStandardizedCompetencies = (
  standardizedCompetenciesRaw: IEEEStandardizedCompetencies
): {
  staticSkillCategorySkillMap: Record<string, MappedSkillType[]>;
  staticSkillCategoryTitleShortNameMap: Record<string, string>;
} => {
  const staticSkillCategorySkillMap =
    standardizedCompetenciesRaw.knowledgeAreas.reduce((acc, knowledgeArea) => {
      const skills = knowledgeArea.competencies.map((competence) => ({
        skillName: competence.title,
        bloomTaxonomy: competence.taxonomy,
        description: competence.description,
        isCustomSkill: false,
      }));
      return {
        ...acc,
        [knowledgeArea.title]: skills,
      };
    }, {});
  const staticSkillCategoryTitleShortNameMap =
    standardizedCompetenciesRaw.knowledgeAreas.reduce((acc, knowledgeArea) => {
      return {
        ...acc,
        [knowledgeArea.title]: knowledgeArea.shortTitle,
      };
    }, {} as Record<string, string>);

  return {
    staticSkillCategorySkillMap,
    staticSkillCategoryTitleShortNameMap,
  };
};
