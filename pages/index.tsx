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
    const [outcomes, setOutcomes] = useState([])
    const [outcome, setOutcome] = useState('')
    const [fee, setFee] = useState(0)
    const [oracle, setOracle] = useState('')

    /**
     * On change of inputs update the question
     * @param e 
     */
    const handleChangeQuestion = (e: any) => {
        const { name, value } = e.target
        setQuestion(question => ({...question, [name]: value}))
    }

    /**
     * On change of inputs update the outcome
     * @param e 
     */
    const handleChangeOutcome = (e: any) => {
        setOutcome(e.target.value)
    }

    /**
     * On change of inputs update the fee
     * @param e 
     */
    const handleChangeFee = (e: any) => {
        setFee(e.target.value)
    }

    /**
     * Add the outcome to array outcomes
     * @param e 
     */
    const handleClickOutcome = () => {
        outcomes.push(outcome)
        setOutcomes(outcomes)
        setOutcome('')
    }

    /**
     * On change of inputs update the oracle
     * @param e 
     */
    const handleChangeOracle = (e: any) => {
        setOracle(e.target.value)
    }

    /**
     * Delete the outcome selected to outcomes
     * @param e 
     */
    const deleteOutcome = (outcome) => {
        const newOutcomes = [...outcomes]
        const index = outcomes.findIndex(out => out === outcome)

        if(index > -1) {
            newOutcomes.splice(index, 1)
        }

        setOutcomes(newOutcomes)
    }

    /**
     * Save the market
     * @param e 
     */
    const handleClick = (e: any) => {
        const market: Market = new Market()
        market.question = question
        market.condition = {outcomes: outcomes, oracle: oracle}
        market.fee = fee
        
        console.log('Market => ', market)
    }

    return (
        <div>
            <Head>
                <title>NextJS Magic template</title>
                <meta
                    name="description"
                    content="Nextjs Magic template"
                />
            </Head>

            {!user &&
                <h1>
                    Please login with Magic!
                </h1>
            } 

            {user && 
            <>
                <h3> Question </h3>

                <h6>Title</h6>
                <input
                    type="text"
                    value={question.title}
                    name='title'
                    onChange={handleChangeQuestion} />

                <h6>Description</h6>
                <textarea
                    value={question.description}
                    name='description'
                    onChange={handleChangeQuestion} /> 

                <h3> Outcomes </h3>
                <input
                    type="text"
                    value={outcome}
                    name='outcome'
                    onChange={handleChangeOutcome} /> 

                <button onClick={handleClickOutcome}>
                    Add
                </button>

                {outcomes &&
                    <div className={styles.table}>
                        {outcomes.map((outcome) => (
                            <div 
                                className={styles.element} 
                                key={outcome}
                                onClick={() => deleteOutcome(outcome)}>
                                <img src={'/times-solid.svg'} />
                                <p>{outcome}</p>
                            </div>
                        ))}
                    </div>
                }

                <h3> Oracle </h3>
                <input
                    type="text"
                    value={oracle}
                    name='oracle'
                    onChange={handleChangeOracle} /> 

                <h3> Fee </h3>
                <input
                    type="number"
                    value={fee}
                    name='fee'
                    onChange={handleChangeFee} /> 

                <button onClick={handleClick}>
                    Save
                </button>
            </>
            }
        </div>
    );
}