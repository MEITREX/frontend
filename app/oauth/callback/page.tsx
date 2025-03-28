"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();
  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      console.error("Missing state or code");
      return;
    }

    router.replace(localStorage.getItem("returnTo" ) + "?code=" + code || "/");
  }, []);

  return <></>;
}
