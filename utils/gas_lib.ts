import { BigNumber, ethers } from "ethers";
import HttpWrapper from "./http_wrapper";

const toWei = (gwei: number): BigNumber => {
    const gweiToWeiMultiplier = BigNumber.from(10).pow(9);
    return gweiToWeiMultiplier.mul(Math.ceil(gwei));
};

const fetchUserGivenGasPrice = async (
    userDefinedGas: number,
): Promise<BigNumber> => {
    let userGas;
    if (userDefinedGas > 0) {
        userGas = toWei(userDefinedGas);
        console.log(`User provided gas: ${userGas}`);
    }
    return userGas;
};

const fetchGasFromGasStation = async (speed: string): Promise<BigNumber> => {
    const GAS_STATION = "https://gasstation-mainnet.matic.network/";
    let gasPrice;
    try {
        console.log(`Fetching gas from ${GAS_STATION}`);
        const httpWrapper = new HttpWrapper();
        const { data } = await httpWrapper.get(GAS_STATION);
        const gasPriceGwei = data[speed];

        gasPrice = toWei(gasPriceGwei);
        console.log(`Gas found: ${gasPrice}`);
        return gasPrice;
    } catch (e) {
        console.log(`Failed to get gas price from ${GAS_STATION}: `, e);
    }
    return gasPrice;
};

/**
 * Fetch gas price
 */
export const getGasPrice = async (
    userDefinedGas: number,
    provider: ethers.providers.Web3Provider,
): Promise<BigNumber> => {
    let gasPrice;

    // get gas price from user first if it exists
    const userGasPrice = await fetchUserGivenGasPrice(userDefinedGas);
    if (userGasPrice != null) {
        return userGasPrice;
    }

    // next, get gas price from the gas station
    const gasPriceFromGasStation = await fetchGasFromGasStation("fast");
    if (gasPriceFromGasStation != null) {
        return gasPriceFromGasStation;
    }

    // fallback to network gas price in the worst case
    console.log(`Falling back to network gas: ${gasPrice}`);
    const networkGasPrice = await provider.getGasPrice();
    return networkGasPrice;
};
