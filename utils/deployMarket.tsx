import { ethers } from "ethers";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import { Market } from "../models/Market";

import abi from "./abi/ConditionalTokens.json";

/**
 * Returns the questionId hashing title and description
 * @param title
 * @param description
 */
const getQuestionId = (title: string, description: string): string => {
    return solidityKeccak256(["string", "string"], [title, description]);
};

/**
 * Return the signer if dev or production mode
 * @param signer
 */
const getSigner = (signer: ethers.Signer) => {
    if (process.env.NEXT_PUBLIC_NETWORK === "test") {
        const wallet = new ethers.Wallet(
            process.env.NEXT_PUBLIC_PRIVATE_KEY_ACCOUNT,
        );
        const connectedWallet = wallet.connect(
            new ethers.providers.JsonRpcProvider("http://localhost:8545"),
        );

        return connectedWallet;
    }
    return signer;
};

/**
 * Given a contract and a market returns the condition prepared
 * @param conditionalTokensContract
 * @param market
 */
const prepareCondition = async (
    conditionalTokensContract: ethers.Contract,
    market: Market,
): Promise<any> => {
    const { condition, question } = market;
    const oracleAddress = process.env.NEXT_PUBLIC_ORACLE;
    const questionId = getQuestionId(question.title, question.description);
    const numOutcomes = condition.outcomes.length;

    return conditionalTokensContract.prepareCondition(
        oracleAddress,
        questionId,
        numOutcomes,
    );
};

/**
 * Given a market and a signer deploys the market
 * @param market
 * @param provider
 */
export const deployMarket = async (market: Market, signer: ethers.Signer) => {
    const contractSigner = getSigner(signer);

    const conditionalTokens = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT,
        abi,
        contractSigner,
    );

    console.log("Preparing Condition...");
    const prepareTx = await prepareCondition(conditionalTokens, market);
    await prepareTx.wait();
    // console.log("Deploying Market...");
    // const deployTx = await deployPolymarket(marketFactory, conditionalTokens.address, USDC_ADDRESS, market);
};

/**
 * Deploys the market on polymarket
 * @param polymarketMarketMakerFactory
 * @param conditionalTokensAddress
 * @param collateralTokenAddress
 * @param market
 */
const deployPolymarket = async (
    polymarketMarketMakerFactory: ethers.Contract,
    conditionalTokensAddress: string,
    collateralTokenAddress: string,
    market: Market,
): Promise<any> => {
    const questionObject = {
        question: market.question,
        conditions: [market.condition],
    };
    const fee = ethers.utils.parseEther(market.fee.toString());
    return polymarketMarketMakerFactory.createPolymarketFixedProductMarketMaker(
        conditionalTokensAddress,
        collateralTokenAddress,
        questionObject,
        fee,
    );
};
