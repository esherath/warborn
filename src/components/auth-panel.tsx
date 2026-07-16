"use client";

import { useState } from "react";
import { Coins, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { AuthModal } from "@/components/auth-modal";
import type { AuthCopy } from "@/lib/i18n";

type User = { accountId: string; nickname: string; role: string; points: number } | null;

export function AuthPanel({ user = null, variant, copy }: { user?: User; variant: "sidebar" | "register-button"; copy: AuthCopy }) {
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [accountId, setAccountId] = useState("");
  const dialog = modal && <AuthModal mode={modal} onClose={() => setModal(null)} copy={copy} initialAccountId={accountId} />;

  if (variant === "register-button") return <>{user ? <a href="#data"><UserPlus /><span>{copy.myAccount}</span></a> : <button type="button" onClick={() => setModal("register")}><UserPlus /><span>{copy.freeRegistration}</span></button>}{dialog}</>;

  return <div className="login-box">{user ? <div className="logged-user"><span>{copy.welcome}</span><strong>{user.nickname}</strong><small>ID: {user.accountId}</small><span className="profile-points"><Coins aria-hidden="true" /><b>{user.points.toLocaleString("en-US")}</b> POINTS</span>{user.role === "admin" && <Link className="admin-link" href="/admin">ADMIN PANEL</Link>}<form action={logout}><button>{copy.logout}</button></form></div> : <><form className="login-fields" onSubmit={(event) => { event.preventDefault(); setModal("login"); }}><input aria-label={copy.accountId} autoComplete="username" placeholder={copy.accountId} value={accountId} onChange={(event) => setAccountId(event.target.value)} maxLength={24} /><button type="submit" aria-label={copy.signIn} title={copy.signIn}><LogIn /></button></form><div className="login-links"><button type="button" onClick={() => setModal("register")}>{copy.createShort}</button><span>&raquo;</span><button type="button" onClick={() => setModal("login")}>{copy.recoverPassword}</button></div></>}{dialog}</div>;
}
