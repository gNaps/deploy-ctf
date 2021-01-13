import { Question } from "./Question";
import { Condition } from "./Condition";

export class Market {
    question: Question;
    condition: Condition;
    fee: number;

    constructor() {
        this.question = new Question()
        this.condition = new Condition()
        this.fee = 0
    }
}