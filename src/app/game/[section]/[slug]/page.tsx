import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckSquare, Download, Info, ShieldCheck } from "lucide-react";
import { InteriorLayout } from "@/components/interior-layout";
import { genericPages, getGenericPage, getSectionItems, getSectionTitle, type GenericPage, type MenuSection } from "@/lib/page-catalog";
import { getLocale, getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ section: string; slug: string }>;

export function generateStaticParams() {
  return genericPages.map(({ section, slug }) => ({ section, slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section, slug } = await params;
  const entry = getGenericPage(section, slug);
  return entry ? { title: `${entry.title} — Warborn`, description: entry.summary } : {};
}

function RequirementsTable() {
  return <section className="guide-requirements"><h2><ShieldCheck /> System Requirements</h2><div><table><thead><tr><th /><th>Minimum Requirement</th><th>Recommended Requirement</th></tr></thead><tbody>
    <tr><th>OS</th><td>Windows 10 64-bit</td><td>Windows 11 64-bit</td></tr>
    <tr><th>CPU</th><td>Intel Core i3 or equivalent</td><td>Intel Core i5 or higher</td></tr>
    <tr><th>RAM</th><td>4 GB</td><td>8 GB or higher</td></tr>
    <tr><th>Graphic Card</th><td>DirectX 11 compatible</td><td>Dedicated GPU, 4 GB VRAM</td></tr>
    <tr><th>Storage</th><td>15 GB available</td><td>SSD with 20 GB available</td></tr>
    <tr><th>Network</th><td>Broadband connection</td><td>Stable low-latency connection</td></tr>
  </tbody></table></div></section>;
}

function GenericGuideContent({ entry }: { entry: GenericPage }) {
  return <>
    <div className="guide-page-banner"><div><span>WARBORN PLAYER GUIDE</span><strong>{entry.title}</strong><small>Official game information</small></div></div>
    <p className="guide-lead">{entry.summary}</p>
    {entry.section === "start" && entry.slug === "getting-ready" && <RequirementsTable />}
    <section className="guide-section"><h2><CheckSquare /> Important Information</h2><ul>{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></section>
    <section className="guide-section"><h2><Info /> Overview</h2><p>This page contains introductory information about <strong>{entry.title}</strong>. The current text is a structured placeholder and can be replaced with final game data, screenshots, tables and detailed instructions when those materials are available.</p><p>Players should review the information carefully before changing account settings, upgrading equipment or entering competitive game modes. Requirements and values may change between game versions.</p></section>
    <section className="guide-note"><strong>Notice</strong><p>Game terminology, Classes and Items retain their canonical English names in every supported language.</p></section>
    {entry.section === "downloads" && <Link className="generic-download" href="/#download"><Download /><span><strong>DOWNLOAD WARBORN CLIENT</strong><small>Installer information will be added later.</small></span></Link>}
  </>;
}

export default async function GenericGamePage({ params }: { params: Params }) {
  const { section, slug } = await params;
  const entry = getGenericPage(section, slug);
  if (!entry) notFound();
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const messages = getMessages(locale);
  const sectionKey = entry.section as MenuSection;
  const href = `/game/${sectionKey}/${entry.slug}`;

  return <InteriorLayout locale={locale} messages={messages} user={user} sectionTitle={getSectionTitle(sectionKey, messages)} sectionItems={getSectionItems(sectionKey, messages)} activeHref={href} pageTitle={entry.title.toUpperCase()}>
    <GenericGuideContent entry={entry} />
  </InteriorLayout>;
}
