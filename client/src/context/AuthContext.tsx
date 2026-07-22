

import { createContext, useState } from "react";
import { User } from "../types/User";

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;

    fetchUser: Promise<void>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User | null>(null);

    async function fetchUser(){

    }

    function login(user: User) {
        setUser(user);
    }

    function logout() {
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}