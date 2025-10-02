import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export function GamificationRouteGuard({ children }: Props) {
  const displayGamification = true;
  const router = useRouter();
  const path = usePathname();
  const protectedRoutes = ["/items", "/essen"];

  useEffect(() => {
    if (!displayGamification && protectedRoutes.some(route => path.includes(route))) {
      router.replace("/");
    }
  }, [router, displayGamification]);

  return <>{children}</>;
}
