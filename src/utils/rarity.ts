import { type CardRarity } from "@prisma/client";

interface RarityItem {
  background: string;
  onBackground: string;
  label: string;
  value: CardRarity;
}

export const rarity: RarityItem[] = [
  {
    background: "lime",
    onBackground: "rgb(29, 143, 29)",
    label: "Common",
    value: "COMMON",
    // chance: 0.7992,
  },
  {
    background: "mediumaquamarine",
    onBackground: "rgb(58, 113, 95)",
    label: "Uncommon",
    value: "UNCOMMON",
    // chance: 0.1598,
  },
  {
    background: "hotpink",
    onBackground: "rgb(131, 53, 92)",
    label: "Rare",
    value: "RARE",
    // chance: 0.032,
  },
  // {
  //   background: "red",
  //   onBackground: "rgb(142, 1, 1)",
  //   label: "Unique",
  //   value: "UNIQUE",
  //   // chance: 0.0064
  // },
  {
    background: "gold",
    onBackground: "rgb(133, 112, 0)",
    label: "Extinct",
    value: "EXTINCT",
    // chance: 0.0026,
  },
  {
    background: "color(srgb 0.498 0.3216 1)",
    onBackground: "color(srgb 0.2633 0.1696 0.53)",
    label: "Impossible",
    value: "IMPOSSIBLE",
    // chance: 0.013,
  },
];
