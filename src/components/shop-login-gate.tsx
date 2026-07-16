"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import type { AuthCopy } from "@/lib/i18n";

export function ShopLoginGate({ copy }: { copy: AuthCopy }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  return <section className="shop-access-gate">
    <LockKeyhole />
    <span>MEMBERS ONLY</span>
    <h2>Sign in to enter the Item Mall</h2>
    <p>Your Warborn account protects your points, characters and purchase history.</p>
    <button type="button" onClick={() => setOpen(true)}>SIGN IN</button>
    {open && <AuthModal mode="login" copy={copy} onClose={() => { setOpen(false); router.push("/"); }} onSuccess={() => setOpen(false)} />}
  </section>;
}
