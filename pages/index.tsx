import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useContext, useState, useEffect } from 'react';

import AuthContext from '../context/AuthContext';

import styles from '../styles/Home.module.css';

export default function Home({ products }) {
    const { user, logoutUser, getToken } = useContext(AuthContext);

    return (
        <div>
            <Head>
                <title>Build an Ecommerce with NextJS, Magic, Strapi and Stripe</title>
                <meta
                    name="description"
                    content="Learn how to build a FullStack Ecommerce in this 2 hours and a half free video sponsored by Magic"
                />
            </Head>

            <h1>
              Hello universe
            </h1>
        </div>
    );
}