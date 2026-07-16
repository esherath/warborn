"use client";

import { useState } from "react";
import { BookOpen, Box, Gem, Gift, Package, Shield, ShoppingCart, Sparkles, Swords, X } from "lucide-react";
import Image from "next/image";
import { itemCategories, type ItemCategory, type MallItem } from "@/lib/item-mall";

const itemIcons = { chest: Gift, potion: Sparkles, orb: Gem, shield: Shield, scroll: Package, mount: Swords, book: BookOpen, weapon: Swords };

export function ItemMallCatalog({ nickname, balance, announcement, catalog }: { nickname: string; balance: number; announcement: string; catalog: MallItem[] }) {
  const [category, setCategory] = useState<ItemCategory>("premium");
  const [selected, setSelected] = useState<MallItem | null>(null);
  const items = catalog.filter((item) => item.category === category);

  return <div className="mall-catalog">
    <header className="mall-welcome"><Image src="/assets/warborn-emblem-transparent-256.png" width={256} height={256} alt="" /><div><span>WARBORN ITEM MALL</span><h2>Welcome, {nickname}</h2><p>{balance.toLocaleString("en-US")} points available · {announcement}</p></div></header>
    <nav className="mall-category-tabs" aria-label="Item categories">{itemCategories.map((item) => <button type="button" aria-pressed={category === item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)} key={item.id}>{item.label}</button>)}</nav>
    <div className="mall-toolbar"><div><strong>Item List</strong><small>{items.length} items in this category</small></div><label>Select Character<select disabled aria-label="Select Character"><option>Character sync pending</option></select></label></div>
    <div className="mall-item-list">{items.map((item) => {
      const Icon = itemIcons[item.icon];
      return <article className="mall-item-card" key={item.id}><div className={`mall-item-icon ${item.icon}`}><Icon /></div><div className="mall-item-info"><h3>{item.name}</h3><dl><div><dt>Class Limit</dt><dd>{item.race}</dd></div><div><dt>Amount</dt><dd>{item.amount}</dd></div><div><dt>Point</dt><dd>{item.points.toLocaleString("en-US")}</dd></div></dl><p>{item.description}</p></div><button type="button" className="mall-buy" onClick={() => setSelected(item)}><ShoppingCart /> BUY</button></article>;
    })}</div>
    {selected && <div className="mall-dialog-backdrop" onMouseDown={() => setSelected(null)}><section className="mall-purchase-dialog" onMouseDown={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="purchase-title"><button type="button" className="mall-dialog-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button><span>PURCHASE PREVIEW</span><h2 id="purchase-title">{selected.name}</h2><div className="purchase-summary"><Box /><p><strong>{selected.points.toLocaleString("en-US")} Points</strong><small>{selected.amount} item(s) · {selected.race}</small></p></div><p>Selecting and delivering items will be enabled after the character, point balance and inventory procedures are mapped in SQL Server.</p><button type="button" onClick={() => setSelected(null)}>UNDERSTOOD</button></section></div>}
  </div>;
}
