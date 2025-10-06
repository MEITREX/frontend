"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "react-oidc-context";
import PageLoading from "@/app/loading"; // Stell sicher, dass du eine Ladekomponente hast

interface Props {
  children: React.ReactNode;
}

export function GamificationRouteGuard({ children }: Props) {
  const auth = useAuth();
  const router = useRouter();
  const path = usePathname();

  const protectedRoutes = [
    "/items",
    "/achievements",
    "/leaderboard",
    "/badges",
  ];

  const hasAccess =
    auth.isAuthenticated &&
    auth.user?.profile.gamification_type === "none";
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  useEffect(() => {
    if (!auth.isLoading && isProtectedRoute && hasAccess) {
      router.replace("/");
    }
  }, [auth.isLoading, isProtectedRoute, hasAccess, router, path]);

  if (auth.isLoading) {
    return <PageLoading />;
  }

  if (isProtectedRoute && !hasAccess) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
