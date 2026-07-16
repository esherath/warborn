import type { Metadata } from "next";
import { CreditCard, History, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { InteriorLayout } from "@/components/interior-layout";
import { ItemMallCatalog } from "@/components/item-mall-catalog";
import { ShopLoginGate } from "@/components/shop-login-gate";
import { getLocale, getMessages } from "@/lib/i18n";
import { getAccountPointBalance, getManagedMallItems, getSiteSettings } from "@/lib/admin-data";
import { shopSectionItems } from "@/lib/item-mall";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ section: string }>;
const sections = ["items", "charge-points", "purchase-history"];
export const metadata: Metadata = { title: "Item Mall — Warborn", description: "Warborn premium item catalog and purchase history." };

export function generateStaticParams() { return sections.map((section) => ({ section })); }

export default async function ItemMallSectionPage({ params }: { params: Params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const messages = getMessages(locale);
  const [catalog, balance, rawSettings] = user ? await Promise.all([getManagedMallItems({ activeOnly: true }), getAccountPointBalance(user.id), getSiteSettings()]) : [[], 0, {}];
  const settings = rawSettings as Record<string, string>;
  const title = section === "items" ? "ITEM LIST" : section === "charge-points" ? "CHARGE POINTS" : "PURCHASE HISTORY";

  return <InteriorLayout locale={locale} messages={messages} user={user} sectionTitle="Item Mall" sectionItems={shopSectionItems} activeHref={`/item-mall/${section}`} pageTitle={title}>
    {!user ? <ShopLoginGate copy={messages.auth} /> : settings.item_mall_enabled === "false" ? <section className="mall-service-page"><ShieldCheck /><span>ITEM MALL</span><h2>Store temporarily unavailable</h2><p>The Item Mall has been disabled by an administrator. Your points and account remain safe.</p></section> : section === "items" ? <ItemMallCatalog nickname={user.nickname} balance={balance} announcement={settings.mall_announcement ?? "Welcome to the Warborn Item Mall."} catalog={catalog} /> : section === "charge-points" ? <section className="mall-service-page"><CreditCard /><span>ACCOUNT SERVICES</span><h2>Charge Warborn Points</h2><p>Point packages and payment providers will appear here after the payment gateway is selected. No payment information is collected by this preview.</p><div className="mall-service-notice"><ShieldCheck /><div><strong>Protected account billing</strong><small>Current balance: {balance.toLocaleString("en-US")} points · ID: {user.account_id}</small></div></div><button type="button" disabled>PAYMENT SETUP PENDING</button></section> : <section className="mall-service-page"><History /><span>ACCOUNT RECORDS</span><h2>Purchase History</h2><p>Completed point charges and delivered Item Mall purchases will be listed here.</p><div className="mall-empty-history"><strong>No purchases yet</strong><small>Your point balance is {balance.toLocaleString("en-US")}. Purchase delivery will be synchronized after the game bridge is enabled.</small></div></section>}
  </InteriorLayout>;
}
