import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

import AuthContext from "../context/AuthContext";

import styles from "../styles/Account.module.css";

const Account = () => {
    const { user, logoutUser, getToken } = useContext(AuthContext);

    if (!user) {
        return (
            <div>
                <p>Please Login or Register before accessing this page</p>
                <Link href="/">
                    <a>Go Back</a>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <Head>
                <title>Your Account</title>
                <meta name="description" content="Your account page" />
            </Head>
            <h2>Account Page</h2>

            <p>Logged in as {user.email}</p>
            <p>Connected on {process.env.NEXT_PUBLIC_ENVIRONMENT}</p>

            <button onClick={logoutUser} className={styles.button}>
                Logout
            </button>
        </div>
    );
};

export default Account;
