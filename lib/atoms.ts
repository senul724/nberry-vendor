import { atom } from "jotai";

export interface User {
    id: string;
    name: string;
    email: string;
}

export const userAtom = atom<User | null>(null);
export const tokenAtom = atom<string | null>(null);
