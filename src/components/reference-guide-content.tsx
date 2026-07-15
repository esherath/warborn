import Image from "next/image";
import { BookOpen, CheckCircle2, Gem, Shield, Sparkles } from "lucide-react";
import { manualPageAssets, type ManualAsset } from "@/lib/manual-assets";
import type { GenericPage } from "@/lib/page-catalog";

type PageCopy = { overview: string; topics: [string, string, string] };

const manualCopy: Record<string, PageCopy> = {
  "guide/interface": { overview: "The game interface keeps combat information, navigation, communication and character management within immediate reach.", topics: ["Read the status, target and experience displays before entering combat.", "Open the character, inventory, party and guild windows through their menu shortcuts.", "Use the minimap, chat panel and quickslots to react without leaving the battlefield."] },
  "guide/game-options": { overview: "Game Options control general behavior, visual effects, messages and sound directly from the system menu.", topics: ["Choose the general settings that match your preferred play style.", "Reduce optional effects when additional performance is required.", "Balance master, music and environment volume independently."] },
  "guide/controls": { overview: "Warborn combines keyboard movement with mouse targeting and context actions for fast, non-targeted combat.", topics: ["Learn movement, camera rotation and character direction first.", "Use the mouse to select targets, interact with NPCs and manage windows.", "Place frequently used actions on accessible quickslot hotkeys."] },
  "guide/communications": { overview: "Communication tools connect nearby players, parties, guilds and private conversations through separate chat channels.", topics: ["Select the correct channel before sending a message.", "Use private messages and the friend list for direct communication.", "Keep party and guild planning in their dedicated channels."] },
  "guide/items": { overview: "The item interface identifies equipment, consumables, materials, restrictions and the information attached to each object.", topics: ["Compare requirements and attributes before equipping an item.", "Keep consumables and enhancement materials organized in the inventory.", "Check whether an item can be stored, traded, upgraded or discarded."] },
  "guide/combat": { overview: "Combat is built around positioning, attack timing, skill use and reading the state of both your character and the enemy.", topics: ["Select or approach the target required by the chosen attack.", "Combine basic attacks with Skills while monitoring resources and cooldowns.", "Reposition when defenses, status effects or terrain create a disadvantage."] },
  "guide/skills": { overview: "Skills provide the active attacks, support actions and passive improvements that define every Class.", topics: ["Open the Skill window to review learned and available Skills.", "Check level, resource and prerequisite requirements before learning a Skill.", "Place active Skills in quickslots and plan upgrades around your build."] },
  "guide/abilities": { overview: "Abilities permanently strengthen specific character functions and complement the Skills chosen for a build.", topics: ["Review the effect and requirement shown for every Ability.", "Prioritize bonuses that support the role of your Class.", "Confirm the cost before committing limited progression resources."] },
  "guide/quests": { overview: "Quests guide progression through objectives, locations, NPCs and rewards displayed in the quest interface.", topics: ["Accept a quest and read every objective before leaving the NPC.", "Track the marked location, target or required item.", "Return to the indicated NPC to complete the quest and receive rewards."] },
  "guide/character-growth": { overview: "Character Growth covers the path from basic levels to advanced Class development and long-term specialization.", topics: ["Gain experience through quests and combat to raise character level.", "Prepare equipment and Skills for each progression milestone.", "Plan advanced choices before spending limited points or materials."] },
  "guide/trades": { overview: "The Trade window allows two players to exchange Items and currency after both sides confirm the final offer.", topics: ["Select the player and send a trade request.", "Place Items or currency in the correct offer area and inspect the other side.", "Confirm only after every quantity and item attribute has been checked."] },
  "system/party": { overview: "A Party lets players share field objectives, coordinate roles and receive group benefits while adventuring together.", topics: ["Invite nearby players or accept a Party request.", "Use the Party window to monitor members and leadership.", "Stay within the required range for shared objectives and rewards."] },
  "system/guild": { overview: "Guilds create a permanent community with its own members, identity, notices and competitive progression.", topics: ["Meet the creation requirements or receive an invitation from an existing Guild.", "Use ranks and permissions to organize members safely.", "Build Guild activity through cooperation, wars and scheduled objectives."] },
  "system/guild-management": { overview: "Guild Management centralizes member administration, ranks, notices, permissions and Guild information.", topics: ["Assign authority carefully through Guild ranks.", "Keep recruitment and notices updated for all members.", "Review member activity before removing or promoting a character."] },
  "system/duel": { overview: "A Duel is a controlled battle between two players that begins only after a challenge is accepted.", topics: ["Select another player and issue the Duel request.", "Remain inside the Duel boundary until the fight ends.", "Victory is determined by the Duel rules without starting open warfare."] },
  "system/statue-war": { overview: "Statue War is a scheduled faction conflict centered on capturing and defending strategic statues.", topics: ["Enter during the published war schedule and gather with your faction.", "Attack enemy objectives while protecting controlled statues.", "Final ownership and score determine faction rewards and advantages."] },
  "system/guild-war": { overview: "Guild War formalizes combat between Guilds and records the result as a collective achievement.", topics: ["Prepare members and confirm the conditions before declaring war.", "Coordinate targets and battlefield roles through Guild communication.", "The Guild with the stronger result earns the war victory."] },
  "system/guild-fortress": { overview: "Guild Fortress combines ownership, structures, NPC services, upgrades and defense in a persistent Guild base.", topics: ["Develop fortress facilities with the required Guild resources.", "Use the available structures and services to support members.", "Organize defenders before a siege or ownership challenge begins."] },
  "system/upgrade-items": { overview: "Item upgrading improves equipment by consuming materials and applying enhancement, modification or socket systems.", topics: ["Place the correct equipment and material into the upgrade interface.", "Review success conditions and possible failure results before confirming.", "Use sockets and Gems only after planning the final equipment build."] },
  "data/human-classes": { overview: "Human Classes branch from disciplined martial, ranged, magical and support traditions.", topics: ["Warrior and Defender specialize in direct frontline combat.", "Assassin and Archer focus on precision, mobility and ranged pressure.", "Sorcerer, Enchanter, Cleric and Priest provide magic and support roles."] },
  "data/akkan-classes": { overview: "Ak'kan Classes emphasize individual power through Combatant and Officiator specializations.", topics: ["Attacker and Templar dominate close-range engagements.", "Gunner applies physical pressure from a distance.", "Rune, Life and Shadow Officiator paths provide distinct mystical roles."] },
  "data/human-skills": { overview: "Human Skills are organized around common training and the Fighter, Rogue, Mage and Acolyte Class families.", topics: ["Common Skills support the base attributes shared by Human Classes.", "Each advanced Class unlocks its own active and passive Skill path.", "Skill level, prerequisites and available points control progression."] },
  "data/akkan-skills": { overview: "Ak'kan Skills combine common racial training with Combatant and Officiator specializations.", topics: ["Common Skills strengthen the fundamental Ak'kan attributes.", "Combatant paths focus on Attacker, Templar and Gunner combat styles.", "Officiator paths develop Rune, Life and Shadow powers."] },
  "data/upgrade-data": { overview: "Upgrade Data lists the Gems, material grades and socket bonuses used to customize equipment.", topics: ["Gem type determines the attribute added to a compatible socket.", "Material quality and upgrade level influence the final process.", "An item can receive additional socket power after the required modifications."] },
};

const humanClasses = ["Warrior", "Defender", "Assassin", "Archer", "Sorcerer", "Enchanter", "Cleric", "Priest"];
const akkanClasses = ["Attacker", "Templar", "Gunner", "Rune Officiator", "Life Officiator", "Shadow Officiator"];

function ManualFigure({ asset, featured = false }: { asset: ManualAsset; featured?: boolean }) {
  return <figure className={`reference-shot ${featured ? "featured" : ""}`}>
    <Image src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} sizes={featured ? "(max-width: 700px) 92vw, 620px" : "(max-width: 700px) 44vw, 280px"} />
  </figure>;
}

function ClassCatalog({ assets, names }: { assets: ManualAsset[]; names: string[] }) {
  return <section className="class-catalog">{assets.map((asset, index) => <article key={asset.src}>
    <div><Image src={asset.src} alt={names[index]} width={asset.width} height={asset.height} /></div>
    <h3>{names[index]}</h3><p>Review this Class&apos;s role, available equipment and progression path before creating your build.</p>
  </article>)}</section>;
}

function IconCatalog({ assets, kind }: { assets: ManualAsset[]; kind: "skill" | "gem" }) {
  return <section className={`manual-icon-catalog ${kind}`} aria-label={`${kind} reference`}>
    {assets.map((asset) => <span key={asset.src} title={asset.alt}><Image src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} /></span>)}
  </section>;
}

export function ReferenceGuideContent({ entry }: { entry: GenericPage }) {
  const key = `${entry.section}/${entry.slug}`;
  const copy = manualCopy[key];
  const assets = manualPageAssets[key] ?? [];
  if (!copy) return null;
  const isClasses = key === "data/human-classes" || key === "data/akkan-classes";
  const isSkills = key === "data/human-skills" || key === "data/akkan-skills";
  const isGems = key === "data/upgrade-data";

  return <div className="reference-guide-content">
    <p className="reference-lead">{copy.overview}</p>

    {!isClasses && !isSkills && !isGems && assets[0] && <ManualFigure asset={assets[0]} featured />}

    <section className="reference-overview">
      <h2><BookOpen /> Important Information</h2>
      <div>{entry.highlights.map((title, index) => <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{copy.topics[index]}</p></div></article>)}</div>
    </section>

    {isClasses && <><h2 className="reference-section-title"><Shield /> Class Reference</h2><ClassCatalog assets={assets} names={key.includes("human") ? humanClasses : akkanClasses} /></>}
    {isSkills && <><h2 className="reference-section-title"><Sparkles /> Skill Reference</h2><IconCatalog assets={assets} kind="skill" /><p className="reference-caption">Skill icons are grouped by common training and their canonical Class paths. Classes and Skills retain their English names.</p></>}
    {isGems && <><h2 className="reference-section-title"><Gem /> Gem Reference</h2><IconCatalog assets={assets} kind="gem" /><div className="upgrade-tier-grid"><span>Small Gem</span><span>Gem Chip</span><span>Fine Gem</span><span>Perfect Gem</span></div></>}

    {!isClasses && !isSkills && !isGems && assets.length > 1 && <section className="reference-gallery"><h2><CheckCircle2 /> Visual Guide</h2><div>{assets.slice(1).map((asset) => <ManualFigure asset={asset} key={asset.src} />)}</div></section>}

    <section className="guide-note"><strong>Notice</strong><p>Values and requirements may vary with future game versions. Classes, Skills and Items keep their canonical English names.</p></section>
  </div>;
}
