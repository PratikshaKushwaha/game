import { describe, it, expect } from 'vitest';
import { LifeSystem } from '../../src/platformer/LifeSystem';

describe('LifeSystem', () => {
  it('starts with exactly 3 lives and not game over', () => {
    const sys = new LifeSystem(3);
    expect(sys.lives).toBe(3);
    expect(sys.isGameOver).toBe(false);
    expect(sys.isInvulnerable()).toBe(false);
  });

  it('deducts one life on valid damage', () => {
    const sys = new LifeSystem(3);
    const damaged = sys.takeDamage();
    expect(damaged).toBe(true);
    expect(sys.lives).toBe(2);
    expect(sys.isInvulnerable()).toBe(true);
  });

  it('prevents multiple frame-by-frame damage during invulnerability', () => {
    const sys = new LifeSystem(3, 1.0);
    sys.takeDamage();
    // Subsequent hits within invulnerability window must be ignored
    const hit2 = sys.takeDamage();
    const hit3 = sys.takeDamage();
    expect(hit2).toBe(false);
    expect(hit3).toBe(false);
    expect(sys.lives).toBe(2);

    // After timer expires, damage applies again
    sys.update(1.1);
    expect(sys.isInvulnerable()).toBe(false);
    const hit4 = sys.takeDamage();
    expect(hit4).toBe(true);
    expect(sys.lives).toBe(1);
  });

  it('triggers Game Over when lives reach zero', () => {
    const sys = new LifeSystem(3, 0.1);
    sys.takeDamage();
    sys.update(0.2);
    sys.takeDamage();
    sys.update(0.2);
    sys.takeDamage();
    expect(sys.lives).toBe(0);
    expect(sys.isGameOver).toBe(true);

    // No further damage can be applied
    expect(sys.takeDamage()).toBe(false);
  });

  it('resets correctly on level restart', () => {
    const sys = new LifeSystem(3);
    sys.takeDamage();
    sys.takeDamage();
    sys.reset();
    expect(sys.lives).toBe(3);
    expect(sys.isGameOver).toBe(false);
    expect(sys.isInvulnerable()).toBe(false);
  });
});
