import type { getMessages } from "@/lib/i18n";

type Messages = ReturnType<typeof getMessages>;
export type MenuSection = "start" | "guide" | "system" | "data" | "forum" | "downloads" | "shop";

export type GenericPage = {
  section: MenuSection;
  slug: string;
  title: string;
  summary: string;
  highlights: string[];
};

const page = (section: MenuSection, slug: string, title: string, summary: string, highlights: string[]): GenericPage => ({ section, slug, title, summary, highlights });

export const genericPages: GenericPage[] = [
  page("start", "getting-ready", "Getting Ready", "Prepare your computer and account before entering the world of Warborn.", ["Review the minimum system requirements", "Create and secure your game account", "Install the latest graphics drivers"]),
  page("start", "installation", "Installation", "Download and install the Warborn game client safely.", ["Download the official client package", "Choose an installation directory", "Allow the launcher to download current files"]),
  page("start", "launcher", "Launcher", "Learn how to start, update and repair the game through the launcher.", ["Check official news and server status", "Select the correct game server", "Use File Check if game files are damaged"]),
  page("start", "client-setting", "Client Setting", "Configure language, resolution, audio and performance preferences.", ["Choose display resolution and screen mode", "Balance visual quality and performance", "Save settings before launching the game"]),
  page("start", "login", "Login", "Access the game with the same account used on the Warborn website.", ["Enter your Account ID and password", "Select an available server", "Never share your password with another player"]),
  page("start", "create-character", "Create a Character", "Create your first hero and begin the Warborn campaign.", ["Choose a faction and class", "Select a unique character name", "Review appearance and starting attributes"]),

  page("guide", "interface", "Interface", "Understand the heads-up display and the most important interface windows.", ["Status, target and experience bars", "Inventory, skills and character panels", "Chat, minimap and shortcut bars"]),
  page("guide", "game-options", "Game Options", "Adjust gameplay, display, sound and control options.", ["Video and performance settings", "Sound and background music", "Interface and notification preferences"]),
  page("guide", "controls", "Controls", "Learn the default keyboard and mouse controls used in Warborn.", ["Movement and camera controls", "Combat shortcuts and targeting", "Customizable action hotkeys"]),
  page("guide", "communications", "Communications", "Use chat channels, private messages and community tools.", ["General, party and guild channels", "Private messages and friend list", "Blocking and reporting players"]),
  page("guide", "items", "Items", "Learn about equipment, consumables, materials and item grades.", ["Equipment requirements and durability", "Consumables and enhancement materials", "Storage, trading and item restrictions"]),
  page("guide", "combat", "Combat", "Master targeting, damage, defense and battlefield positioning.", ["Basic and skill attacks", "Damage types and defensive values", "Defeat, revival and combat status"]),
  page("guide", "skills", "Skills", "Develop your character through active and passive skills.", ["Learning and upgrading skills", "Resource costs and cooldowns", "Skill combinations and specialization"]),
  page("guide", "abilities", "Abilities", "Understand core attributes and their effect on your character.", ["Primary and secondary attributes", "Offensive and defensive statistics", "Equipment and buff modifiers"]),
  page("guide", "quests", "Quests", "Follow story, regional and repeatable quests to earn rewards.", ["Quest markers and objectives", "Party progress and shared credit", "Experience, currency and item rewards"]),
  page("guide", "character-growth", "Character Growth", "Plan your progress from a new recruit to a veteran warrior.", ["Level progression and unlocks", "Equipment and skill milestones", "Advanced progression systems"]),
  page("guide", "trades", "Trades", "Exchange items and currency safely with other players.", ["Direct player trading", "Market and pricing basics", "Account and item restrictions"]),

  page("system", "party", "Party", "Create a party and cooperate with other players in the field.", ["Inviting and removing members", "Party leadership and loot rules", "Shared objectives and party benefits"]),
  page("system", "guild", "Guild", "Join or create a guild and build a permanent community.", ["Guild creation requirements", "Ranks, permissions and membership", "Guild progression and benefits"]),
  page("system", "guild-management", "Guild Management", "Manage ranks, members, announcements and guild resources.", ["Member roles and permissions", "Guild notices and recruitment", "Activity and contribution management"]),
  page("system", "duel", "Duel", "Challenge another player to a controlled one-on-one battle.", ["Sending and accepting challenges", "Duel boundaries and victory rules", "Restrictions and safe conduct"]),
  page("system", "statue-war", "Statue War", "Compete for strategic statues during scheduled faction warfare.", ["Participation schedule and entry", "Objectives, scoring and control", "Victory rewards and territory benefits"]),
  page("system", "guild-war", "Guild War", "Fight organized battles between rival guilds.", ["War declaration and preparation", "Battle objectives and scoring", "Guild ranking and rewards"]),
  page("system", "guild-fortress", "Guild Fortress", "Develop and defend your guild fortress.", ["Fortress ownership and upgrades", "Defensive structures and resources", "Siege preparation and rewards"]),
  page("system", "upgrade-items", "Upgrade Items", "Improve equipment through enhancement and upgrade systems.", ["Required materials and currency", "Success rates and protection items", "Upgrade limits and equipment grades"]),

  page("data", "human-classes", "Human Classes", "Browse the combat roles available to the Human faction.", ["Warrior and defensive paths", "Ranged and support paths", "Class identity and party roles"]),
  page("data", "akkan-classes", "Ak'kan Classes", "Browse the combat roles available to the Ak'kan faction.", ["Frontline and offensive paths", "Mystic and ranged paths", "Class identity and party roles"]),
  page("data", "human-skills", "Human Skills", "Reference the skill families available to Human Classes.", ["Active combat skills", "Passive bonuses and mastery", "Skill requirements and progression"]),
  page("data", "akkan-skills", "Ak'kan Skills", "Reference the skill families available to Ak'kan Classes.", ["Active combat skills", "Passive bonuses and mastery", "Skill requirements and progression"]),
  page("data", "upgrade-data", "Upgrade Data", "Review generic equipment enhancement values and requirements.", ["Upgrade levels and material tiers", "Success and failure behavior", "Recommended preparation checklist"]),

  page("forum", "screenshots", "Screenshots", "View and share memorable moments from the Warborn community.", ["Battle and siege galleries", "Character and guild showcases", "Community screenshot guidelines"]),
  page("downloads", "client-download", "Client Download", "Download the latest official Warborn client.", ["Full client installation package", "Current version and file information", "Installation and troubleshooting links"]),
  page("shop", "charge-points", "Charge Points", "Add premium points to your Warborn account through supported methods.", ["Choose a point package", "Confirm account and payment details", "Review processing status and safety notices"]),
  page("shop", "purchase-history", "Purchase History", "Review premium point charges and Item Mall purchases.", ["Point transaction history", "Purchased item records", "Support information for missing purchases"]),
  page("shop", "item-list", "Item List", "Browse the generic catalog of premium services and convenience items.", ["Account services", "Convenience and cosmetic items", "Purchase restrictions and delivery information"]),
];

const slugs: Record<MenuSection, string[]> = {
  start: ["getting-ready", "installation", "launcher", "client-setting", "login", "create-character"],
  guide: ["interface", "game-options", "controls", "communications", "items", "combat", "skills", "abilities", "quests", "character-growth", "trades"],
  system: ["party", "guild", "guild-management", "duel", "statue-war", "guild-war", "guild-fortress", "upgrade-items"],
  data: ["human-classes", "akkan-classes", "human-skills", "akkan-skills", "upgrade-data"],
  forum: ["latest-news", "update-news", "general-discussion", "trade", "tip-and-tech", "bug-reports", "screenshots"],
  downloads: ["client-download"],
  shop: ["charge-points", "purchase-history", "item-list"],
};

const forumHrefs = ["/news?kind=news", "/news?kind=update", "/forum?category=general", "/forum?category=trade", "/forum?category=tips", "/forum?category=bugs", "/game/forum/screenshots"];

export function getMenuHref(section: MenuSection, index: number) {
  if (section === "forum") return forumHrefs[index] ?? "/forum";
  return `/game/${section}/${slugs[section][index]}`;
}

export function getSectionItems(section: MenuSection, messages: Messages) {
  return messages.menus[section].map((label, index) => ({ label, href: getMenuHref(section, index) }));
}

export function getSectionTitle(section: MenuSection, messages: Messages) {
  const titles = { start: messages.nav.start, guide: messages.nav.guide, system: messages.nav.system, data: messages.nav.data, forum: messages.nav.forum, downloads: messages.nav.downloads, shop: messages.nav.shop };
  return titles[section];
}

export function getGenericPage(section: string, slug: string) {
  return genericPages.find((item) => item.section === section && item.slug === slug) ?? null;
}
