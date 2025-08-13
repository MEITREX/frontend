import decorationsData from "./../itemSchema.json";

type DecorationCategory = keyof typeof decorationsData;

type DecorationItem = {
  id: string;
  [key: string]: any;
};

export default function parseDecorations(
  ids: string[],
  category: DecorationCategory
): DecorationItem[] {
  const categoryArray = decorationsData[category];

  if (!Array.isArray(categoryArray)) {
    console.warn(`Category "${category}" is not an array`);
    return [];
  }

  return ids.flatMap((id) => {
    const match = categoryArray.find((item: DecorationItem) => item.id === id);
    return match ? [match] : [];
  });
}
