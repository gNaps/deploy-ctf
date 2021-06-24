import axios from "axios";

class HttpWrapper {
    readonly client: any;

    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    constructor() {
        this.client = axios.create({
            headers: { "Content-Type": "application/json" },
        });
    }

    get(url: string): Promise<any> {
        return this.client.get(url);
    }
}

export default HttpWrapper;
