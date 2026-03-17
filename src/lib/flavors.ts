export interface FlavorProfile {
  id: string;
  label: string;
  keywords: string[];
}

export const FLAVOR_PROFILES: FlavorProfile[] = [
  { id: "spicy", label: "Spicy", keywords: ["spicy", "hot &", "hot and"] },
  { id: "chicken", label: "Chicken", keywords: ["chicken"] },
  { id: "beef", label: "Beef", keywords: ["beef"] },
  { id: "pork", label: "Pork", keywords: ["pork", "tonkotsu"] },
  { id: "seafood", label: "Seafood", keywords: ["seafood", "shrimp", "crab", "lobster", "prawn"] },
  { id: "curry", label: "Curry", keywords: ["curry"] },
  { id: "miso", label: "Miso", keywords: ["miso"] },
  { id: "cheese", label: "Cheese", keywords: ["cheese"] },
  { id: "kimchi", label: "Kimchi", keywords: ["kimchi"] },
  { id: "tomyum", label: "Tom Yum", keywords: ["tom yum"] },
  { id: "vegetable", label: "Vegetable", keywords: ["vegetable", "veggie", "vegan"] },
  { id: "mushroom", label: "Mushroom", keywords: ["mushroom"] },
  { id: "sesame", label: "Sesame", keywords: ["sesame"] },
  { id: "laksa", label: "Laksa", keywords: ["laksa"] },
  { id: "garlic", label: "Garlic", keywords: ["garlic"] },
  { id: "coconut", label: "Coconut", keywords: ["coconut"] },
  { id: "duck", label: "Duck", keywords: ["duck"] },
];

/** Returns the set of flavor IDs that match a variety string */
export function getFlavorTags(variety: string): Set<string> {
  const lower = variety.toLowerCase();
  const tags = new Set<string>();
  for (const profile of FLAVOR_PROFILES) {
    for (const kw of profile.keywords) {
      if (lower.includes(kw)) {
        tags.add(profile.id);
        break;
      }
    }
  }
  return tags;
}
