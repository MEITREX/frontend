import competenciesCatalog from "./data/standardized-comptency-catalog.json";

export const IEEE_SKILLS: Record<string, string[]> = {};
export const knowledgeAreaShortTitles: Record<string, string> = {};
  
function extractTitles(data: any): void {
    data.knowledgeAreas.forEach((area: any) => {
        knowledgeAreaShortTitles[area.title] = area.shortTitle;
        IEEE_SKILLS[area.title] = [];
        area.competencies.forEach((competency: any) => {
            IEEE_SKILLS[area.title].push(competency.title);
        });
    });
}
  
extractTitles(competenciesCatalog);