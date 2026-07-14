"use client";

import { useActionState, useEffect, useState } from "react";
import { LogIn, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { login, logout, register, type AuthState } from "@/app/actions/auth";
import type { AuthCopy } from "@/lib/i18n";

type User = { accountId: string; nickname: string; role: string } | null;

function AuthModal({ mode, close, copy, initialAccountId = "" }: { mode: "login" | "register"; close: () => void; copy: AuthCopy; initialAccountId?: string }) {
  const [tab, setTab] = useState(mode);
  const router = useRouter();
  const initial: AuthState = { message: "", success: false };
  const [loginState, loginAction, loginPending] = useActionState(login, initial);
  const [registerState, registerAction, registerPending] = useActionState(register, initial);
  const state = tab === "login" ? loginState : registerState;

  useEffect(() => { if (state.success) { close(); router.refresh(); } }, [state.success, router, close]);

  return <div className="modal-backdrop" onMouseDown={close}><div className="auth-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={copy.accountAccess}>
    <button className="modal-close" onClick={close} aria-label={copy.close}><X /></button>
    <div className="modal-brand"><span>W</span><h2>WARBORN</h2><p>{copy.tagline}</p></div>
    <div className="auth-tabs"><button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>{copy.signIn}</button><button className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>{copy.createAccount}</button></div>
    {tab === "login" ? <form action={loginAction} className="auth-form">
      <label>{copy.accountId}<input name="accountId" autoComplete="username" minLength={4} maxLength={24} required placeholder={copy.accountPlaceholder} defaultValue={initialAccountId} /></label>
      <label>{copy.password}<input name="password" type="password" autoComplete="current-password" minLength={8} required placeholder={copy.passwordPlaceholder} /></label>
      <button className="submit-auth" disabled={loginPending}>{loginPending ? copy.entering : copy.enterPortal}</button>
    </form> : <form action={registerAction} className="auth-form">
      <div className="form-pair"><label>{copy.accountId}<input name="accountId" autoComplete="username" minLength={4} maxLength={24} pattern="[A-Za-z0-9_]+" required placeholder="warrior01" /></label><label>{copy.characterName}<input name="nickname" minLength={3} maxLength={20} required placeholder={copy.characterPlaceholder} /></label></div>
      <label>{copy.email}<input name="email" type="email" autoComplete="email" required placeholder="player@email.com" /></label>
      <div className="form-pair"><label>{copy.password}<input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.newPasswordPlaceholder} /></label><label>{copy.confirmPassword}<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.confirmPlaceholder} /></label></div>
      <label className="terms"><input type="checkbox" name="terms" value="yes" required /> {copy.terms}</label>
      <button className="submit-auth" disabled={registerPending}>{registerPending ? copy.creating : copy.createFree}</button>
    </form>}
    {state.message && <p className={`auth-message ${state.success ? "success" : "error"}`} aria-live="polite">{state.message}</p>}
    <small className="shared-account-note">{copy.sharedAccount}</small>
  </div></div>;
}

export function AuthPanel({ user = null, variant, copy }: { user?: User; variant: "sidebar" | "register-button"; copy: AuthCopy }) {
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [accountId, setAccountId] = useState("");
  const dialog = modal && <AuthModal mode={modal} close={() => setModal(null)} copy={copy} initialAccountId={accountId} />;
  if (variant === "register-button") return <>{user ? <a href="#data"><UserPlus /><span>{copy.myAccount}</span></a> : <button onClick={() => setModal("register")}><UserPlus /><span>{copy.freeRegistration}</span></button>}{dialog}</>;
  return <div className="login-box">{user ? <div className="logged-user"><span>{copy.welcome}</span><strong>{user.nickname}</strong><small>ID: {user.accountId}</small>{user.role === "admin" && <a className="admin-link" href="/admin/content">CONTENT PANEL</a>}<form action={logout}><button>{copy.logout}</button></form></div> : <><div className="login-fields"><input aria-label={copy.accountId} placeholder={copy.accountId} value={accountId} onChange={(event) => setAccountId(event.target.value)} maxLength={24} /><button type="button" aria-label={copy.signIn} title={copy.signIn} onClick={() => setModal("login")}><LogIn /></button></div><div className="login-links"><button onClick={() => setModal("register")}>{copy.createShort}</button><span>»</span><button onClick={() => setModal("login")}>{copy.recoverPassword}</button></div></>}{dialog}</div>;
}
