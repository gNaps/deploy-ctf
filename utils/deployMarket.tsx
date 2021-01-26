import { ethers } from "ethers";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import { Market } from "../models/Market";
import {
    CONDITIONAL_TOKENS_ADDRESS,
    POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS,
    USDC_ADDRESS,
} from "./network";

import abi from "./abi/ConditionalTokens.json";
import abiPolymarket from "./abi/PolymarketMarketMakerFactory.json";

/**
 * Returns the questionId hashing title and description
 * @param title
 * @param description
 */
const getQuestionId = (title: string, description: string): string => {
    return solidityKeccak256(["string", "string"], [title, description]);
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
    const questionId = getQuestionId(question.title, question.description);
    const numOutcomes = condition.outcomes.length;

    return conditionalTokensContract.prepareCondition(
        condition.oracle,
        questionId,
        numOutcomes,
    );
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

/**
 * Given a market and a signer deploys the market
 * @param market
 * @param provider
 */
export const deployMarket = async (
    market: Market,
    signer: ethers.Signer,
): Promise<any> => {
    const conditionalTokens = new ethers.Contract(
        CONDITIONAL_TOKENS_ADDRESS,
        abi,
        signer,
    );

    const marketFactory = new ethers.Contract(
        POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS,
        abiPolymarket,
        signer,
    );

    console.log("Preparing Condition...");
    const prepareTx = await prepareCondition(conditionalTokens, market);
    await prepareTx.wait();
    console.log("Deploying Market...");
    const deployTx = await deployPolymarket(
        marketFactory,
        conditionalTokens.address,
        USDC_ADDRESS,
        market,
    );
};
