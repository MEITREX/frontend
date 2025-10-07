"use client";
import * as React from "react";
import { useAuth } from "react-oidc-context";

interface GuardProps {
  children: React.ReactNode;
}

export default function GamificationGuard({ children }: GuardProps) {
  const auth = useAuth();
  const isGamificationDisabled =
    auth.user?.profile?.gamification_type === "none";

  if (isGamificationDisabled) return null;

  return <>{children}</>;
}
