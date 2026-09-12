"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sword } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Window, WindowTitle } from "@/components/ui";
import { Toaster } from "@/components/toaster";
import { useGameStore } from "@/lib/game/store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "At least 8 characters."),
});
const signupSchema = loginSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(1, "Every hero needs a name.")
    .max(24, "24 characters max."),
});

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const pushToast = useGameStore((s) => s.pushToast);
  const [serverError, setServerError] = useState<string | null>(null);
  const isSignup = mode === "signup";

  const login = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });
  const signup = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: loginBusy },
  } = login;
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isSubmitting: signupBusy },
  } = signup;

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setServerError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : "/quests");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(msg);
      pushToast("danger", msg);
    }
  }

  async function onSignup(values: z.infer<typeof signupSchema>) {
    setServerError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { display_name: values.displayName } },
      });
      if (error) throw error;
      pushToast("success", "Character created! Welcome to the guild.");
      router.replace("/quests");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(msg);
      pushToast("danger", msg);
    }
  }

  const busy = isSignup ? signupBusy : loginBusy;

  return (
    <div className="page-field flex min-h-[100dvh] flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* logo */}
          <Link
            href="/"
            className="pixel-text mb-6 block text-center text-base text-gold transition-opacity hover:opacity-80"
          >
            Life<span className="text-ink">Quest</span>
          </Link>

          <Window className="overflow-hidden">
            <WindowTitle>{isSignup ? "Create Character" : "Welcome Back"}</WindowTitle>

            <form
              onSubmit={isSignup ? handleSubmitSignup(onSignup) : handleSubmitLogin(onLogin)}
              className="flex flex-col gap-4 p-5 sm:p-7"
              noValidate
            >
              {isSignup && (
                <div>
                  <label htmlFor="displayName" className="mb-1 block text-xs font-semibold text-ink-dim">
                    Hero name
                  </label>
                  <input
                    id="displayName"
                    className="input-jrpg"
                    autoComplete="nickname"
                    maxLength={24}
                    placeholder="Aerith"
                    {...registerSignup("displayName")}
                  />
                  {signupErrors.displayName && (
                    <p role="alert" className="mt-1.5 text-xs text-danger">
                      {signupErrors.displayName.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold text-ink-dim">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-jrpg"
                  autoComplete="email"
                  placeholder="hero@quest.dev"
                  {...(isSignup ? registerSignup("email") : registerLogin("email"))}
                />
                {(isSignup ? signupErrors.email : loginErrors.email) && (
                  <p role="alert" className="mt-1.5 text-xs text-danger">
                    {(isSignup ? signupErrors.email : loginErrors.email)?.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold text-ink-dim">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-jrpg"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  {...(isSignup ? registerSignup("password") : registerLogin("password"))}
                />
                {(isSignup ? signupErrors.password : loginErrors.password) && (
                  <p role="alert" className="mt-1.5 text-xs text-danger">
                    {(isSignup ? signupErrors.password : loginErrors.password)?.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p role="alert" className="rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-jrpg btn-primary mt-1 w-full px-6 py-3 text-[11px]"
              >
                {busy
                  ? "Consulting the scribes…"
                  : isSignup
                    ? "Begin Adventure"
                    : "Enter the Guild"}
              </button>

              <p className="mt-2 text-center text-sm text-ink-faint font-body">
                {isSignup ? "Already a member? " : "New here? "}
                <Link
                  href={isSignup ? "/login" : "/signup"}
                  className="font-semibold text-gold underline-offset-4 hover:underline"
                >
                  {isSignup ? "Log in" : "Create a character"}
                </Link>
              </p>
            </form>
          </Window>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink-faint font-body">
            <Sword size={13} weight="duotone" aria-hidden="true" />
            Your stats live on the guild server, not your browser.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
