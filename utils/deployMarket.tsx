import { ethers } from "ethers";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Market } from "../models/Market";

import abi from "./abi/ConditionalTokens.json";

export const getEth = async (provider) => {
    // const { provider } = useContext(AuthContext)

    const abi = ["function balanceOf(address owner) view returns (uint256)"];
    let contractAddress: string;
    let signer: any;

    contractAddress = "0x59d3631c86BbE35EF041872d502F218A39FBa150";
    signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const message = await contract.balanceOf(
        "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    );

    const number = message.toString();
    const numberParsed = ethers.utils.formatUnits(number, "mwei");

    console.log("number parsed ", numberParsed);
};

/**
 * Given a market and a provider deploys the market
 * @param market
 * @param provider
 */
export const deployMarket = async (market: Market, provider) => {
    const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    // const marketDeployerSigner = await ethers.getSigner(marketDeployer);
    const wallet = new ethers.Wallet(
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    );
    console.log(wallet);
    // const marketDeployerSigner = provider.getSigner()
    // const conditionalTokens = await ethers.getContract("ConditionalTokens", marketDeployerSigner);
    // const marketFactory = await ethers.getContract("PolymarketFixedProductMarketMakerFactory", marketDeployerSigner);

    const conditionalTokens = new ethers.Contract(
        "0x59d3631c86BbE35EF041872d502F218A39FBa150",
        abi,
        wallet,
    );

    console.log(conditionalTokens);

    console.log("Preparing Condition...");
    const prepareTx = await prepareCondition(conditionalTokens, market);
    await prepareTx.wait();
    console.log("Deploying Market...");
    // const deployTx = await deployPolymarket(marketFactory, conditionalTokens.address, USDC_ADDRESS, market);
};

/**
 * Given a contract and a market returns the condition prepared
 * @param conditionalTokensContract
 * @param market
 */
const prepareCondition = async (
    conditionalTokensContract: ethers.Contract,
    market: any,
): Promise<any> => {
    const { condition, question } = market;
    // const oracleAddress = condition.oracle;
    const oracleAddress = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
    // const questionId = getQuestionId(question.title, question.description);
    const questionId = getQuestionId("title", "description");
    console.log(questionId);
    // const numOutcomes = condition.outcomes.length;
    const numOutcomes = 2;
    return conditionalTokensContract.prepareCondition(
        oracleAddress,
        questionId,
        numOutcomes,
    );
};

/**
 * Returns the questionId hashing title and description
 * @param title
 * @param description
 */
const getQuestionId = (title: string, description: string): string => {
    return solidityKeccak256(["string", "string"], [title, description]);
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
    market: any,
): Promise<any> => {
    const questionObject = {
        question: market.question,
        conditions: [market.condition],
    };
    const fee = ethers.utils.parseEther(market.fee);
    return polymarketMarketMakerFactory.createPolymarketFixedProductMarketMaker(
        conditionalTokensAddress,
        collateralTokenAddress,
        questionObject,
        fee,
    );
};
