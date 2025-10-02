"use client";
import * as React from "react";


interface GuardProps {
  children: React.ReactNode;
}

export default function GamificationGuard({ children }: GuardProps) {
  const displayGamification = false;

  if(!displayGamification) return null;

  return <>{children}</>
  }