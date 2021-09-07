import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import { Market, StrapiMarketsPostResponse } from "../interfaces";

class APIClient {
    public axios: AxiosInstance;

    constructor(axiosConfig: AxiosRequestConfig) {
        this.axios = Axios.create(axiosConfig);
    }

    public addMarket(
        authToken: string,
        market: Market,
    ): Promise<AxiosResponse<Market>> {
        return this.axios.post<StrapiMarketsPostResponse>(
            "/markets",
            {
                market,
            },
            {
                headers: { authorization: `Bearer ${authToken}` },
            },
        );
    }
}

export default APIClient;
