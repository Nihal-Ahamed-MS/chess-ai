"use client";
import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VALIDATE_USER_SESSION } from "@/service/ui/auth.service";
import { getCookie } from "@/lib/helper";
import { Spinner } from "@/components/ui/spinner";

// @ts-ignore
const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [isSessionValid, setIsSessionValid] = useState(false);
    const { isLoading: authLoading, refetch: refetchAuth } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const response = await VALIDATE_USER_SESSION();
                const fetchedUser = response?.user ?? response ?? null;
                setUser(fetchedUser);
                setIsSessionValid(true);
                return fetchedUser;
            } catch (error) {
                console.error("Session validation failed:", error);
                setUser(null);
                setIsSessionValid(false);
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (authLoading) return (
        <div className="w-screen h-screen flex justify-center items-center">
            <Spinner />
        </div>
    );

    return (
        <AuthContext.Provider value={{ user, authLoading, setUser, isSessionValid, refetchAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);