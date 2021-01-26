import { BigNumber, ethers } from "ethers";

export const formatETH = (balance: BigNumber): string => {
    if (!balance) {
        return "0.00";
    }
    return ethers.utils.formatEther(balance);
};