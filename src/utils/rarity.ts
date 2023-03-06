export const rarity = [
  {
    background: "lime",
    text: "rgb(29, 143, 29)",
    name: "Common",
    chance: 0.7992,
  },
  {
    background: "mediumaquamarine",
    text: "rgb(58, 113, 95)",
    name: "Uncommon",
    chance: 0.1598,
  },
  {
    background: "hotpink",
    text: "rgb(131, 53, 92)",
    name: "Rare",
    chance: 0.032,
  },
  { background: "red", text: "rgb(142, 1, 1)", name: "Unique", chance: 0.0064 },
  {
    background: "gold",
    text: "rgb(133, 112, 0)",
    name: "Extinct",
    chance: 0.0026,
  },
  {
    background: "color(srgb 0.498 0.3216 1)",
    text: "color(srgb 0.2633 0.1696 0.53)",
    name: "Impossible",
    chance: 0.013,
  },
] as const;

export type RarityName = (typeof rarity)[number]["name"];
