"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { register } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (isRegister && password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register(normalizedEmail, password);
        setRegistered(true);
      } else {
        await login(normalizedEmail, password);
        router.replace("/");
      }
    } catch (submitError) {
      console.error(`Failed to ${mode}:`, submitError);
      if (!(submitError instanceof Error)) {
        setError(t("auth.genericError"));
      } else if (submitError.message === "Invalid email or password") {
        setError(t("auth.invalidCredentials"));
      } else if (submitError.message === "Email already registered") {
        setError(t("auth.emailAlreadyRegistered"));
      } else {
        setError(submitError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-10 text-neutral-900 dark:bg-[#090b12] dark:text-neutral-100 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_32px_100px_-40px_rgba(27,39,94,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/40 md:min-h-[620px] md:grid-cols-[1fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex lg:p-12">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -right-10 -top-6 h-44 w-44 rounded-full border border-white/15" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Sparkles size={22} />
            </span>
            <span className="text-lg font-semibold tracking-tight">AI Chat</span>
          </div>

          <div className="relative max-w-md">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <MessageCircle size={26} />
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              {t("auth.heroTitle")}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
              {t("auth.heroDescription")}
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/75">
              <span className="flex -space-x-2">
                <span className="h-7 w-7 rounded-full border-2 border-violet-500 bg-sky-300" />
                <span className="h-7 w-7 rounded-full border-2 border-violet-500 bg-amber-300" />
                <span className="h-7 w-7 rounded-full border-2 border-violet-500 bg-rose-300" />
              </span>
              <span>{t("auth.heroTagline")}</span>
            </div>
          </div>

          <p className="relative text-xs text-white/55">
            {t("auth.heroFooter")}
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold md:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                  <Sparkles size={18} />
                </span>
                AI Chat
              </div>
              <LanguageSwitcher />
            </div>

            {registered ? (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <Check size={26} />
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                  {t("auth.accountCreated")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t("auth.accountCreatedDescription", {
                    email: email.trim(),
                  })}
                </p>
                <Link
                  href="/login"
                  className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {t("auth.continueToLogin")} <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {isRegister ? t("auth.getStarted") : t("auth.welcomeBack")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  {isRegister ? t("auth.createTitle") : t("auth.loginTitle")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {isRegister
                    ? t("auth.createDescription")
                    : t("auth.loginDescription")}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={t("auth.emailPlaceholder")}
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white/80 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-700 dark:bg-neutral-950/60 dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium"
                    >
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <LockKeyhole
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isRegister ? "new-password" : "current-password"
                        }
                        required
                        minLength={isRegister ? 8 : undefined}
                        maxLength={128}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={
                          isRegister
                            ? t("auth.passwordPlaceholder")
                            : t("auth.currentPasswordPlaceholder")
                        }
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white/80 pl-11 pr-12 text-sm outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-700 dark:bg-neutral-950/60 dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((shown) => !shown)}
                        aria-label={
                          showPassword
                            ? t("auth.hidePassword")
                            : t("auth.showPassword")
                        }
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {isRegister && (
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-sm font-medium"
                      >
                        {t("auth.confirmPassword")}
                      </label>
                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          maxLength={128}
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder={t("auth.confirmPasswordPlaceholder")}
                          className="h-12 w-full rounded-xl border border-neutral-200 bg-white/80 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-700 dark:bg-neutral-950/60 dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 transition hover:-translate-y-0.5 hover:bg-neutral-700 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:shadow-black/20"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900" />
                        {isRegister
                          ? t("auth.creatingAccount")
                          : t("auth.signingIn")}
                      </>
                    ) : (
                      <>
                        {isRegister
                          ? t("auth.createAccount")
                          : t("auth.signIn")}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-7 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {isRegister
                    ? t("auth.alreadyHaveAccount")
                    : t("auth.newToChat")}{" "}
                  <Link
                    href={isRegister ? "/login" : "/register"}
                    className="font-semibold text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
                  >
                    {isRegister ? t("auth.signIn") : t("auth.createAccount")}
                  </Link>
                </p>
                <p className="mt-8 text-center text-xs leading-5 text-neutral-400">
                  {t("auth.responsibleUse")}
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
