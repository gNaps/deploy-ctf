import { createContext, useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { MAGIC_PUBLIC_KEY } from "../utils/urls";

import { User } from "../models/User";

interface AuthContext {
    user: User;
    loginUser: (email: string) => void;
    logoutUser: () => void;
    checkUserLoggedIn: () => void;
    getToken: () => void;
    provider: ethers.providers.Web3Provider;
}

const AuthContext = createContext<AuthContext>({
    user: null,
    loginUser: (email: string) => null,
    logoutUser: () => null,
    checkUserLoggedIn: () => null,
    getToken: () => null,
    provider: null,
});

let magic;

/**
 * Return the magic metwork if dev or production mode
 */
const getNetwork = () => {
    let network: any;
    if (process.env.NEXT_PUBLIC_NETWORK === "test") {
        network = { rpcUrl: "http://127.0.0.1:8545", chainId: 1337 };
    } else {
        network = { rpcUrl: "https://rpc-mainnet.matic.network", chainId: 137 };
    }

    return network;
};

export const AuthProvider = (props) => {
    const [user, setUser] = useState(null);
    const [provider, setProvider] = useState(null);
    const router = useRouter();

    /**
     * Log the user out
     */
    const logoutUser = async () => {
        try {
            await magic.user.logout();
            setUser(null);
            router.push("/");
        } catch (err) {
            setUser(user);
        }
    };

    /**
     * Log the user in
     * @param {string} email
     */
    const loginUser = async (email) => {
        try {
            await magic.auth.loginWithMagicLink({ email });
            setUser({ email });
            router.push("/");
        } catch (err) {
            logoutUser();
        }
    };

    /**
     * Retrieve Magic Issued Bearer Token
     * This allows User to make authenticated requests
     */
    const getToken = async () => {
        let token: string;

        try {
            token = await magic.user.getIdToken();
            localStorage.setItem("token", token);
        } catch (err) {
            logoutUser();
        }

        return token;
    };

    /**
     * If user is logged in, get data and display it
     */
    const checkUserLoggedIn = async () => {
        try {
            const isLoggedIn = await magic.user.isLoggedIn();

            if (isLoggedIn) {
                const { email } = await magic.user.getMetadata();
                setUser({ email });
            }
        } catch (err) {
            logoutUser();
        }
    };

    /**
     * Reload user login on app refresh
     */
    useEffect(() => {
        magic = new Magic(MAGIC_PUBLIC_KEY, {
            network: getNetwork(),
        });
        setProvider(new ethers.providers.Web3Provider(magic.rpcProvider));

        checkUserLoggedIn();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                logoutUser,
                loginUser,
                checkUserLoggedIn,
                getToken,
                provider,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
