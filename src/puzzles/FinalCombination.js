// ============================================================
// FinalCombination.ts — Validates the player's final guess
// ============================================================
import { deriveFinalCombination } from './RoomPuzzleGenerator';
export class FinalCombination {
    answer;
    constructor(rooms) {
        this.answer = deriveFinalCombination(rooms);
    }
    check(guess) {
        return guess === this.answer;
    }
    getAnswer() {
        return this.answer;
    }
}
//# sourceMappingURL=FinalCombination.js.map