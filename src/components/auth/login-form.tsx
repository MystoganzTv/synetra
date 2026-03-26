"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { Button, tactilePressClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roleLabels: Record<string, string> = {
  "Platform Admin": "Platform Admin",
  "Revenue Operations": "Revenue Operations",
  TCM: "Care Manager / TCM",
};

const demoPasswordsByEmail: Record<string, string> = {
  "admin@synetra.app": "SynetraDemo!",
  "ops@synetra.app": "SynetraOps!",
  "enrique@synetra.app": "SynetraTCM!",
};

type DemoUser = {
  email: string;
  name: string;
  role: string;
};

export function LoginForm({
  error,
  showDemoAccess,
  demoUsers,
}: {
  error: boolean;
  showDemoAccess: boolean;
  demoUsers: DemoUser[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <form
        action="/api/auth/login"
        method="post"
        className="space-y-4"
        onSubmit={() => setIsSubmitting(true)}
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@synetra.app"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {showDemoAccess
              ? "That email or password does not match this demo workspace."
              : "That email or password does not match this workspace."}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="h-12 w-full cursor-pointer rounded-2xl bg-[linear-gradient(180deg,#4060ff_0%,#2c49d8_100%)] shadow-[0_16px_32px_-18px_rgba(36,63,178,0.75),inset_0_1px_0_rgba(255,255,255,0.24)] transition-[transform,box-shadow,filter] duration-150 hover:brightness-[1.03] hover:shadow-[0_18px_34px_-18px_rgba(36,63,178,0.82),inset_0_1px_0_rgba(255,255,255,0.26)] active:translate-y-[2px] active:scale-[0.992] active:brightness-95 active:shadow-[0_8px_18px_-14px_rgba(20,34,87,0.8),inset_0_4px_10px_rgba(15,27,88,0.34)] disabled:translate-y-0 disabled:scale-100 disabled:cursor-wait disabled:opacity-100 disabled:brightness-100"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {isSubmitting ? (
          <p className="text-center text-xs text-muted-foreground">
            We are validating your credentials and preparing your workspace.
          </p>
        ) : null}
      </form>

      {showDemoAccess ? (
        <div className="rounded-[24px] border border-border bg-accent/50 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Demo access
          </p>
          <div className="mt-4 space-y-3">
            {demoUsers.map((user) => (
              <div key={user.email} className="rounded-[20px] border border-border bg-white/80 p-4">
                <p className="font-semibold text-foreground">
                  {roleLabels[user.role] ?? user.role}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{user.name}</p>
                <p className="mt-3 text-sm text-foreground">{user.email}</p>
                <p className="text-sm text-foreground">
                  {demoPasswordsByEmail[user.email] ?? "Protected credential"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-border bg-accent/50 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Workspace access
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            If you need a new account or a credential reset, contact your Synetra workspace administrator.
          </p>
        </div>
      )}

      <Link
        href="/"
        className={`flex items-center justify-center gap-2 rounded-[18px] border border-[#cdd9ff] bg-[#eef3ff] px-4 py-3 text-sm font-semibold text-[#1b2b67] transition-colors hover:border-[#b8c8ff] hover:bg-[#e6edff] hover:text-[#142257] ${tactilePressClassName}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </>
  );
}
