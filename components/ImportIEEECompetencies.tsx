import competenciesCatalog from "./data/standardized-comptency-catalog.json";

export const IEEE_SKILLS: Record<string, string[]> = {};
  
function extractTitles(data: any): void {
    data.knowledgeAreas.forEach((area: any) => {
        console.log(`Knowledge Area: ${area.title}`);
        IEEE_SKILLS[area.title] = [];
        area.competencies.forEach((competency: any) => {
            console.log(`Title: ${competency.title}`);
            IEEE_SKILLS[area.title].push(competency.title);
        });
    });
}
  
extractTitles(competenciesCatalog);