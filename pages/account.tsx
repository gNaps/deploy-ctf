import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

import AuthContext from "../context/AuthContext";

export default () => {
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
                <meta
                    name="description"
                    content="Your orders will be shown here"
                />
            </Head>
            <h2>Account Page</h2>

            <hr />
            <p>Logged in as {user.email}</p>
            <p>
                <a href="#" onClick={logoutUser}>
                    Logout
                </a>
            </p>
        </div>
    );
};
