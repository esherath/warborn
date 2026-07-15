import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckSquare, Download, Info } from "lucide-react";
import { GettingStartedContent } from "@/components/getting-started-content";
import { InteriorLayout } from "@/components/interior-layout";
import { ReferenceGuideContent } from "@/components/reference-guide-content";
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

function GenericGuideContent({ entry }: { entry: GenericPage }) {
  const isGettingStarted = entry.section === "start";
  const hasManualReference = entry.section === "guide" || entry.section === "system" || entry.section === "data";
  return <>
    <div className="guide-page-banner"><div><span>WARBORN PLAYER GUIDE</span><strong>{entry.title}</strong><small>Official game information</small></div></div>
    {isGettingStarted ? <GettingStartedContent slug={entry.slug} /> : hasManualReference ? <ReferenceGuideContent entry={entry} /> : <>
      <p className="guide-lead">{entry.summary}</p>
      <section className="guide-section"><h2><CheckSquare /> Important Information</h2><ul>{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></section>
      <section className="guide-section"><h2><Info /> Overview</h2><p>This page contains introductory information about <strong>{entry.title}</strong>. The current text is a structured placeholder and can be replaced with final game data, screenshots, tables and detailed instructions when those materials are available.</p><p>Players should review the information carefully before changing account settings, upgrading equipment or entering competitive game modes. Requirements and values may change between game versions.</p></section>
      <section className="guide-note"><strong>Notice</strong><p>Game terminology, Classes and Items retain their canonical English names in every supported language.</p></section>
    </>}
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
