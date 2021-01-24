import Head from "next/head";
import { useContext, useState, FormEvent } from "react";

import AuthContext from "../context/AuthContext";
import { deployMarket } from "../utils/deployMarket";
import Confirm from "../components/Confirm";

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
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);

    /**
     * On change of inputs update the question
     * @param e
     */
    const handleChangeQuestion = (
        e: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.currentTarget;
        setQuestion((element) => ({ ...element, [name]: value }));
    };

    /**
     * On change of inputs update the outcome
     * @param e
     */
    const handleChangeOutcome = (e: FormEvent<HTMLInputElement>) => {
        setOutcome(e.currentTarget.value);
    };

    /**
     * On change of inputs update the fee
     * @param e
     */
    const handleChangeFee = (e: FormEvent<HTMLInputElement>) => {
        setFee(parseFloat(e.currentTarget.value));
    };

    /**
     * Add the outcome to array outcomes
     */
    const handleClickOutcome = (e: FormEvent<HTMLButtonElement>) => {
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
    const handleChangeOracle = (e: FormEvent<HTMLInputElement>) => {
        setOracle(e.currentTarget.value);
    };

    /**
     * Delete the outcome selected to outcomes
     * @param outcome
     */
    const deleteOutcome = (outcomeToDelete: string) => {
        const newOutcomes = [...outcomes];
        const index = outcomes.findIndex((out) => out === outcomeToDelete);

        if (index > -1) {
            newOutcomes.splice(index, 1);
        }

        setOutcomes(newOutcomes);
    };

    /**
     * Requires confirm to save Markets
     * @param e
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const invalidTitle = question.title === "";
        const invalidDescription = question.description === "";

        setCheckTitle(invalidTitle);
        setCheckDescription(invalidDescription);

        if (!invalidTitle && !invalidDescription) {
            setConfirm(true);
        } else {
            setLoading(false);
        }
    };

    /**
     * Deploy the market
     */
    const deploy = async () => {
        setLoading(true);

        const condition = new Condition(outcomes, oracle);
        const market: Market = new Market(question, condition, fee);
        const signer = provider.getSigner();

        const deployRes = await deployMarket(market, signer);

        setConfirm(false);
        setLoading(false);
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
                            {outcomes.map((out) => (
                                <div
                                    className={styles.element}
                                    key={out}
                                    onClick={() => deleteOutcome(out)}
                                >
                                    <img src="/times-solid.svg" alt="delete" />
                                    <p>{out}</p>
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

            {confirm && (
                <Confirm
                    yes={deploy}
                    no={() => {
                        setConfirm(false);
                        setLoading(false);
                    }}
                    loading={loading}
                />
            )}
        </div>
    );
}
