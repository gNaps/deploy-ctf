import Head from "next/head";
import { useContext, useState } from "react";

import AuthContext from "../context/AuthContext";
import { getEth, deployMarket } from "../utils/deployMarket";

import styles from "../styles/Home.module.css";
import { Market } from "../models/Market";
import { Question } from "../models/Question";
import { Condition } from "../models/Condition";

export default function Home() {
    const { user, provider } = useContext(AuthContext);
    const [question, setQuestion] = useState(new Question());
    const [outcomes, setOutcomes] = useState([]);
    const [outcome, setOutcome] = useState("");
    const [fee, setFee] = useState(0);
    const [oracle, setOracle] = useState("");
    const [checkTitle, setCheckTitle] = useState(false);
    const [checkDescription, setCheckDescription] = useState(false);

    /**
     * On change of inputs update the question
     * @param e
     */
    const handleChangeQuestion = (e: any) => {
        const { name, value } = e.target;
        setQuestion((element) => ({ ...element, [name]: value }));
    };

    /**
     * On change of inputs update the outcome
     * @param e
     */
    const handleChangeOutcome = (e: any) => {
        setOutcome(e.target.value);
    };

    /**
     * On change of inputs update the fee
     * @param e
     */
    const handleChangeFee = (e: any) => {
        setFee(e.target.value);
    };

    /**
     * Add the outcome to array outcomes
     */
    const handleClickOutcome = (e) => {
        e.preventDefault();

        if (outcome && outcome !== "") {
            outcomes.push(outcome);
            setOutcomes(outcomes);
            setOutcome("");
        }
    };

    /**
     * On change of inputs update the oracle
     * @param e
     */
    const handleChangeOracle = (e: any) => {
        setOracle(e.target.value);
    };

    /**
     * Delete the outcome selected to outcomes
     * @param outcome
     */
    const deleteOutcome = (outcomeToDelete) => {
        const newOutcomes = [...outcomes];
        const index = outcomes.findIndex((out) => out === outcomeToDelete);

        if (index > -1) {
            newOutcomes.splice(index, 1);
        }

        setOutcomes(newOutcomes);
    };

    /**
     * Save the market
     * @param e
     */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        let flagTitle = false;
        let flagDescription = false;

        if (question.title === "") {
            setCheckTitle(true);
            flagTitle = true;
        } else {
            setCheckTitle(false);
            flagTitle = false;
        }

        if (question.description === "") {
            setCheckDescription(true);
            flagDescription = true;
        } else {
            setCheckDescription(false);
            flagDescription = false;
        }

        if (!flagDescription && !flagTitle) {
            const condition = new Condition(outcomes, oracle);
            const market: Market = new Market(question, condition, fee);

            console.log("Market => ", market);

            await deployMarket(market, provider);
        }
    };

    return (
        <div>
            <Head>
                <title>NextJS Magic template</title>
                <meta name="description" content="Nextjs Magic template" />
            </Head>

            {!user && <h1>Please login with Magic!</h1>}

            {user && (
                <form onSubmit={handleSubmit} className={styles.form_market}>
                    <h3> Question </h3>

                    <h6>Title</h6>
                    <input
                        type="text"
                        value={question.title}
                        name="title"
                        onChange={handleChangeQuestion}
                        className={checkTitle ? styles.check_input : ""}
                    />

                    {checkTitle && <p className={styles.check_p}> Required </p>}

                    <h6>Description</h6>
                    <textarea
                        value={question.description}
                        name="description"
                        onChange={handleChangeQuestion}
                        className={checkDescription ? styles.check_input : ""}
                    />

                    {checkDescription && (
                        <p className={styles.check_p}> Required </p>
                    )}

                    <h3> Outcomes </h3>
                    <input
                        type="text"
                        value={outcome}
                        name="outcome"
                        onChange={handleChangeOutcome}
                    />

                    <button
                        onClick={handleClickOutcome}
                        style={{ marginTop: "10px" }}
                    >
                        Add
                    </button>

                    {outcomes && (
                        <div className={styles.table}>
                            {outcomes.map((outcome) => (
                                <div
                                    className={styles.element}
                                    key={outcome}
                                    onClick={() => deleteOutcome(outcome)}
                                >
                                    <img src="/times-solid.svg" />
                                    <p>{outcome}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3> Oracle </h3>
                    <input
                        type="text"
                        value={oracle}
                        name="oracle"
                        onChange={handleChangeOracle}
                    />

                    <h3> Fee </h3>
                    <input
                        type="number"
                        value={fee}
                        name="fee"
                        onChange={handleChangeFee}
                    />

                    <div className={styles.submit}>
                        <button type="submit">Save Market</button>
                    </div>
                </form>
            )}
        </div>
    );
}
