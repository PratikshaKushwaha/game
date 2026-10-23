/**
 * LifeSystem.js — Three-life and Damage Management for Level 2 Platformer
 * Implements strict one-life-per-damage-event, invulnerability cooldown,
 * respawn tracking, and game-over state.
 */
export class LifeSystem {
  constructor(initialLives = 3, invulnerabilityDuration = 1.5) {
    this.initialLives = initialLives;
    this.lives = initialLives;
    this.invulnerabilityDuration = invulnerabilityDuration;
    this.invulnerableTimer = 0;
    this.isGameOver = false;
    this.damageCount = 0;
  }

  update(dt) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }
  }

  isInvulnerable() {
    return this.invulnerableTimer > 0;
  }

  /**
   * Applies damage. Returns true if life was deducted, false if blocked (invulnerable or dead).
   */
  takeDamage() {
    if (this.isGameOver || this.isInvulnerable()) {
      return false;
    }

    this.lives = Math.max(0, this.lives - 1);
    this.damageCount++;
    this.invulnerableTimer = this.invulnerabilityDuration;

    if (this.lives === 0) {
      this.isGameOver = true;
    }

    return true;
  }

  reset(lives = this.initialLives) {
    this.lives = lives;
    this.invulnerableTimer = 0;
    this.isGameOver = false;
    this.damageCount = 0;
  }
}
