import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import { Market, StrapiMarketsPostResponse } from "../interfaces";

class APIClient {
    public axios: AxiosInstance;

    constructor(axiosConfig: AxiosRequestConfig) {
        this.axios = Axios.create(axiosConfig);
    }

    public addMarket(
        market: Record<string, unknown>,
        authToken: string,
    ): Promise<AxiosResponse<Market>> {
        return this.axios.post<StrapiMarketsPostResponse>(
            "/markets",
            { market },
            { headers: { authorization: `Bearer ${authToken}` } },
        );
    }
}

export default APIClient;
