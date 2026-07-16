"use client";

import { useActionState, useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login, register, type AuthState } from "@/app/actions/auth";
import type { AuthCopy } from "@/lib/i18n";

type AuthModalProps = {
  mode: "login" | "register";
  onClose: () => void;
  onSuccess?: () => void;
  copy: AuthCopy;
  initialAccountId?: string;
};

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthModal({ mode, onClose, onSuccess, copy, initialAccountId = "" }: AuthModalProps) {
  const mounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [tab, setTab] = useState(mode);
  const closeFromEvent = useEffectEvent(onClose);
  const router = useRouter();
  const initial: AuthState = { message: "", success: false };
  const [loginState, loginAction, loginPending] = useActionState(login, initial);
  const [registerState, registerAction, registerPending] = useActionState(register, initial);
  const state = tab === "login" ? loginState : registerState;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeFromEvent(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!state.success) return;
    onSuccess?.();
    if (!onSuccess) onClose();
    router.refresh();
  }, [state.success, onClose, onSuccess, router]);

  if (!mounted) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={copy.accountAccess}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X /></button>
        <div className="modal-brand"><span className="modal-emblem"><Image src="/assets/warborn-emblem-transparent-256.png" width={256} height={256} alt="" /></span><h2>WARBORN</h2><p>{copy.tagline}</p></div>
        <div className="auth-tabs"><button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>{copy.signIn}</button><button type="button" className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>{copy.createAccount}</button></div>
        {tab === "login" ? <form action={loginAction} className="auth-form">
          <label>{copy.accountId}<input name="accountId" autoComplete="username" minLength={4} maxLength={24} required autoFocus placeholder={copy.accountPlaceholder} defaultValue={initialAccountId} /></label>
          <label>{copy.password}<input name="password" type="password" autoComplete="current-password" minLength={8} required placeholder={copy.passwordPlaceholder} /></label>
          <button className="submit-auth" disabled={loginPending}>{loginPending ? copy.entering : copy.enterPortal}</button>
        </form> : <form action={registerAction} className="auth-form">
          <div className="form-pair"><label>{copy.accountId}<input name="accountId" autoComplete="username" minLength={4} maxLength={24} pattern="[A-Za-z0-9_]+" required autoFocus placeholder="warrior01" /></label><label>{copy.characterName}<input name="nickname" minLength={3} maxLength={20} required placeholder={copy.characterPlaceholder} /></label></div>
          <label>{copy.email}<input name="email" type="email" autoComplete="email" maxLength={50} required placeholder="player@email.com" /></label>
          <div className="form-pair"><label>{copy.password}<input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.newPasswordPlaceholder} /></label><label>{copy.confirmPassword}<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.confirmPlaceholder} /></label></div>
          <label className="terms"><input type="checkbox" name="terms" value="yes" required /> {copy.terms}</label>
          <button className="submit-auth" disabled={registerPending}>{registerPending ? copy.creating : copy.createFree}</button>
        </form>}
        {state.message && <p className={`auth-message ${state.success ? "success" : "error"}`} aria-live="polite">{state.message}</p>}
        <small className="shared-account-note">{copy.sharedAccount}</small>
      </div>
    </div>,
    document.body,
  );
}
