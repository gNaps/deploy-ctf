import { BigNumber, ethers } from "ethers";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";

import { Interface } from "ethers/lib/utils";
import { Market } from "../models/Market";
import {
    CONDITIONAL_TOKENS_ADDRESS,
    POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS,
    STRAPI_URL,
    USDC_ADDRESS,
} from "./network";

import abi from "./abi/ConditionalTokens.json";
import abiPolymarket from "./abi/PolymarketMarketMakerFactory.json";
import APIClient from "../api/ApiClient";

const iFixedProductMarketMakerCreation = new Interface([
    "event FixedProductMarketMakerCreation (address indexed creator, address fixedProductMarketMaker, address indexed conditionalTokens, address indexed collateralToken, bytes32[] conditionIds, uint fee)",
]);
const APIWebClient = new APIClient({
    baseURL: STRAPI_URL,
    timeout: 60000,
});

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
    gasPrice: BigNumber,
): Promise<any> => {
    const { condition, question } = market;
    const questionId = getQuestionId(question.title, question.description);
    const numOutcomes = condition.outcomes.length;

    return conditionalTokensContract.prepareCondition(
        condition.oracle,
        questionId,
        numOutcomes,
        { gasPrice },
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
    gasPrice: BigNumber,
): Promise<any> => {
    const questionObject = {
        question: market.question,
        conditions: [market.condition],
    };
    const fee = ethers.utils.parseEther(market.fee.toString());

    const marketMaker = await polymarketMarketMakerFactory.createPolymarketFixedProductMarketMaker(
        conditionalTokensAddress,
        collateralTokenAddress,
        questionObject,
        fee,
        { gasPrice },
    );
    console.log("address", marketMaker.address);
    return marketMaker;
};

/**
 * Given a market and a signer deploys the market
 * @param market
 * @param provider
 */
export const deployMarket = async (
    market: Market,
    signer: ethers.Signer,
    gasPrice: BigNumber,
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
    const prepareTx = await prepareCondition(
        conditionalTokens,
        market,
        gasPrice,
    );
    await prepareTx.wait();

    console.log("Deploying Market...");
    const deployTx = await deployPolymarket(
        marketFactory,
        conditionalTokens.address,
        USDC_ADDRESS,
        market,
        gasPrice,
    );
    const receipt = await deployTx.wait();
    let data: any; // eslint-disable-line
    for (let i = 0; i < receipt.logs.length; i += 1) {
        try {
            data = iFixedProductMarketMakerCreation.decodeEventLog(
                "FixedProductMarketMakerCreation",
                receipt.logs[i].data,
            );
        } catch (e) {} // eslint-disable-line

        if (data) break;
    }

    console.log(data);

    return receipt;
};
const createStrapiMarket = async (token, market) => {
    APIWebClient.addMarket(token, market);
};
