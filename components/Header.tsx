import { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";

import styles from "../styles/Header.module.css";

const Header = () => {
    const router = useRouter();
    const isHome = router.pathname === "/";

    const { user } = useContext(AuthContext);

    /**
     * Return to previous page
     * @param event
     */
    const goBack = (event) => {
        event.preventDefault();
        router.back();
    };

    return (
        <div className={styles.nav}>
            <div className={styles.title}>
                <Link href="/">
                    <a>
                        <img src="/polymarket.svg" alt="polymarket logo" />
                    </a>
                </Link>
            </div>

            <div className={styles.auth}>
                {user ? (
                    <div>
                        <Link href="/account">
                            <a>
                                <img src="/user-solid.svg" alt={user.email} />
                            </a>
                        </Link>
                        <p>Live on {process.env.NEXT_PUBLIC_ENVIRONMENT}</p>
                    </div>
                ) : (
                    <Link href="/login">
                        <a>Log In</a>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;
