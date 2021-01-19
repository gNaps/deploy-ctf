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
            this.oracle = oracle;
            // condition.oracle = default oracle address
        } else {
            this.oracle = oracle;
        }
    }
}
