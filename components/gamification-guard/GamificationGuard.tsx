"use client";
import * as React from "react";
import { useAuth } from "react-oidc-context";

interface GuardProps {
  children: React.ReactNode;
}

export default function GamificationGuard({ children }: GuardProps) {
  const auth = useAuth();
  const displayGamification =
    auth.user?.profile.gamification_type === "gamification";

  if (!displayGamification) return null;

  return <>{children}</>;
}
