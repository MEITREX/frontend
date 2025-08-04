import decorationsData from "./../itemSchema.json";

type DecorationCategory = keyof typeof decorationsData;

type DecorationItem = {
  id: string;
  [key: string]: any; // Damit auch weitere Eigenschaften erlaubt sind
};

export default function parseDecorations(
  ids: string[],
  category: DecorationCategory
): DecorationItem[] {
  const categoryArray = decorationsData[category];

  console.log("decoParser", categoryArray)
  console.log("IDSSSS", ids)

  if (!Array.isArray(categoryArray)) {
    console.warn(`Category "${category}" is not an array`);
    return [];
  }

  console.log(ids.flatMap((id) => {
    const match = categoryArray.find((item: DecorationItem) => item.id === id);
    return match ? [match] : []}), "whoa")

  return ids.flatMap((id) => {
    const match = categoryArray.find((item: DecorationItem) => item.id === id);
    return match ? [match] : [];
  });
}
