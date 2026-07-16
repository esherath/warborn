export type ItemCategory = "premium" | "potion" | "supply" | "skillbook" | "abilitybook" | "function" | "equipment" | "limited";

export type MallItem = {
  id: string;
  name: string;
  category: ItemCategory;
  race: "All Race" | "Human Race" | "Ak'kan Race";
  amount: number;
  points: number;
  description: string;
  icon: "chest" | "potion" | "orb" | "shield" | "scroll" | "mount" | "book" | "weapon";
};

export const itemCategories: { id: ItemCategory; label: string }[] = [
  { id: "premium", label: "Premium" }, { id: "potion", label: "Potion" },
  { id: "supply", label: "Supply" }, { id: "skillbook", label: "SkillBook" },
  { id: "abilitybook", label: "AbilityBook" }, { id: "function", label: "Function" },
  { id: "equipment", label: "Weapon/Armor" }, { id: "limited", label: "Limited-time Item" },
];

export const mallItems: MallItem[] = [
  { id: "gold-box-30", name: "Gold Box", category: "premium", race: "All Race", amount: 1, points: 1490, description: "Increases earned experience points and item drop rate by 50% for 30 days.", icon: "chest" },
  { id: "white-tiger", name: "Trained White Tiger", category: "premium", race: "Human Race", amount: 1, points: 990, description: "A trained mount for Humans. Equip it in the Mount slot and press P to mount or dismount.", icon: "mount" },
  { id: "iguanadon", name: "Trained Iguanadon", category: "premium", race: "Ak'kan Race", amount: 1, points: 990, description: "A trained mount for Ak'kans. Equip it in the Mount slot and press P to mount or dismount.", icon: "mount" },
  { id: "holy-healing", name: "Holy Potion of Healing", category: "potion", race: "All Race", amount: 30, points: 190, description: "Restore HP by 70% instantly.", icon: "potion" },
  { id: "almighty-healing", name: "Almighty Potion of Healing", category: "potion", race: "All Race", amount: 30, points: 290, description: "Restore HP by 100% instantly.", icon: "potion" },
  { id: "holy-mana", name: "Holy Potion of Mana", category: "potion", race: "All Race", amount: 30, points: 190, description: "Restore MP by 70% instantly.", icon: "potion" },
  { id: "almighty-mana", name: "Almighty Potion of Mana", category: "potion", race: "All Race", amount: 30, points: 290, description: "Restore MP by 100% instantly.", icon: "potion" },
  { id: "experience-orb", name: "Holy Orb of Experience", category: "supply", race: "All Race", amount: 30, points: 290, description: "Increases earned experience points by 30% for 1 hour.", icon: "orb" },
  { id: "luck-orb", name: "Holy Orb of Luck", category: "supply", race: "All Race", amount: 30, points: 290, description: "Increases item drop rate by 30% for 1 hour.", icon: "orb" },
  { id: "mineal-protection", name: "Mineal Protection", category: "supply", race: "All Race", amount: 30, points: 290, description: "Protection supplies intended for combat in Almighty Land.", icon: "shield" },
  { id: "return-scroll", name: "Return Stone", category: "function", race: "All Race", amount: 10, points: 190, description: "Return to your saved resurrection location.", icon: "scroll" },
  { id: "skill-reset", name: "Skill Reset Book", category: "skillbook", race: "All Race", amount: 1, points: 690, description: "Resets learned skill points. Review all restrictions before use.", icon: "book" },
  { id: "ability-reset", name: "Ability Reset Book", category: "abilitybook", race: "All Race", amount: 1, points: 690, description: "Resets allocated ability points. Review all restrictions before use.", icon: "book" },
  { id: "warborn-blade", name: "Warborn Ceremonial Blade", category: "equipment", race: "All Race", amount: 1, points: 1290, description: "A ceremonial weapon appearance for veteran warriors.", icon: "weapon" },
  { id: "founder-chest", name: "Founder Chest", category: "limited", race: "All Race", amount: 1, points: 1990, description: "A limited collection of launch cosmetics and convenience items.", icon: "chest" },
];

export const shopSectionItems = [
  { label: "Item List", href: "/item-mall/items" },
  { label: "Charge Points", href: "/item-mall/charge-points" },
  { label: "Purchase History", href: "/item-mall/purchase-history" },
];
