import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useContext, useState, useEffect } from 'react';

import AuthContext from '../context/AuthContext';

import styles from '../styles/Home.module.css';
import { Market } from '../models/Market';
import { Question } from '../models/Question';

export default function Home() {
    const { user } = useContext(AuthContext);
    const [question, setQuestion] = useState(new Question())

    const handleChangeQuestion = (e: any) => {
        const { name, value } = e.target
        setQuestion(question => ({...question, [name]: value}))
    }

    const handleClick = (e: any) => {
        console.log(question)
    }

    return (
        <div>
            <Head>
                <title>Build an Ecommerce with NextJS, Magic, Strapi and Stripe</title>
                <meta
                    name="description"
                    content="Learn how to build a FullStack Ecommerce in this 2 hours and a half free video sponsored by Magic"
                />
            </Head>

            {!user &&
                <h1>
                    hello universe
                </h1>
            } 

            {user && 
            <>
                <h2> Insert a question </h2>
                 <input
                 type="text"
                 value={question.title}
                 name='title'
                 onChange={handleChangeQuestion} />

                <input
                 type="text"
                 value={question.description}
                 name='description'
                 onChange={handleChangeQuestion} /> 

                <h2> Insert outcomes </h2>

                 <button onClick={handleClick}>
                     Salva
                 </button>
            </>
            }
        </div>
    );
}