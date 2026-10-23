// ============================================================
// PuzzleSystem.ts — Room code validation and state tracking
// ============================================================
import { gameState } from '../game/GameState';
export class PuzzleSystem {
    rooms = new Map();
    audio;
    constructor(rooms, audio) {
        this.audio = audio;
        rooms.forEach(r => this.rooms.set(r.id, r));
        // Initialise puzzle state for rooms 1–6
        rooms.forEach(r => {
            if (r.id === 7)
                return;
            gameState.puzzles.set(r.id, {
                roomId: r.id,
                solved: false,
                code: r.code,
                highlightedDigit: r.highlightedDigit,
            });
        });
    }
    /** Try to solve a room. Returns true on success. */
    attemptRoomCode(roomId, guess) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        if (gameState.isRoomSolved(roomId))
            return true;
        const correct = guess === room.code;
        if (correct) {
            gameState.solveRoom(roomId);
            this.audio.playOneShot('unlock', 0.9);
        }
        else {
            this.audio.playOneShot('fail', 0.7);
        }
        return correct;
    }
    /** Try the final 3-digit combination for Room 8. */
    attemptFinalCode(guess, answer) {
        if (gameState.lives <= 0)
            return 'lockout';
        if (guess === answer) {
            this.audio.playOneShot('unlock', 1.0);
            return 'correct';
        }
        const hasLives = gameState.loseLife();
        this.audio.playOneShot('fail', 0.8);
        if (!hasLives)
            return 'lockout';
        return 'wrong';
    }
    getRoomConfig(roomId) {
        return this.rooms.get(roomId);
    }
    allRoomsSolved() {
        for (let id = 1; id <= 7; id++) {
            if (!gameState.isRoomSolved(id))
                return false;
        }
        return true;
    }
}
//# sourceMappingURL=PuzzleSystem.js.map