"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { decodeJwt, type JWTPayload } from "jose";
import { userAtom, type User } from "@/lib/atoms";

function getUserFromSessionCookie(): User | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)session_token=([^;]+)/);
  if (!match || !match[1]) return null;

  try {
    const rawToken = decodeURIComponent(match[1]);
    const claims = decodeJwt<JWTPayload & { name?: string; email?: string }>(rawToken);

    return {
      id: claims.sub ?? "",
      name: claims.name ?? "",
      email: claims.email ?? "",
    };
  } catch (error) {
    console.error("Failed to decode session_token with jose:", error);
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useAtom(userAtom);

  const getUser = () => {
    if (user) {
      return user
    }
    const decodedUser = getUserFromSessionCookie();
    setUser(decodedUser);
    return decodedUser;
  }

  return { getUser };
}
