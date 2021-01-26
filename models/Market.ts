import { Question } from "./Question";
import { Condition } from "./Condition";

export class Market {
    question: Question;
    condition: Condition;
    fee: number;

    constructor(question: Question, condition: Condition, fee: number) {
        this.question = question;
        this.condition = condition;
        if (fee === 0) {
            this.fee = 0.02;
        } else {
            this.fee = fee;
        }
    }
}
