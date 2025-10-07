"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "react-oidc-context";
import PageLoading from "@/app/loading";

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

  const gamificationDisabled = auth.user?.profile?.gamification_type === "none";

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  useEffect(() => {
    if (isProtectedRoute && gamificationDisabled) {
      router.replace("/");
    }
  }, [isProtectedRoute, gamificationDisabled, router]);

  if (isProtectedRoute && gamificationDisabled) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
