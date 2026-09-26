"use client";

import { useCallback } from "react";
import { useAtom } from "jotai";
import { tokenAtom } from "@/lib/atoms";
import { authApi } from "@/lib/api";

export function useToken() {
	const [accessToken, setAccessToken] = useAtom(tokenAtom);

	const getValidAccessToken = useCallback(async (): Promise<string | null> => {
		console.log({ preserved: accessToken });
		if (accessToken) {
			return accessToken;
		}
		try {
			const { access_token } = await authApi.refresh();

			setAccessToken(access_token);
			return access_token;
		} catch {
			return null;
		}
	}, [accessToken, setAccessToken]);

	return {
		getValidAccessToken,
		accessToken,
		setAccessToken,
	};
}