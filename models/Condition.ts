import { ORACLE_ADDRESS } from "../utils/network";

export class Condition {
    outcomes: Array<string>;

    oracle: string;

    constructor(outcomes, oracle) {
        if (outcomes.length === 0) {
            this.outcomes = ["Yes", "No"];
        } else {
            this.outcomes = outcomes;
        }

        if (oracle === "") {
            this.oracle = ORACLE_ADDRESS;
        } else {
            this.oracle = oracle;
        }
    }
}
