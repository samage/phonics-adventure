'use client';

import confetti from 'canvas-confetti';

/**
 * 勝利彩花特效封裝。
 * 成功拼出單字時呼叫 fireConfetti()，噴灑絢麗彩色紙花。
 */
export function fireConfetti(): void {
  if (typeof window === 'undefined') return;

  const colors = ['#FF8A65', '#FFD54F', '#4FC3F7', '#81C784', '#BA68C8'];

  // 中央大爆發
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    scalar: 1.2,
  });

  // 左右兩側補射，畫面更熱鬧
  const fireSide = (angle: number, originX: number) => {
    confetti({
      particleCount: 60,
      angle,
      spread: 60,
      origin: { x: originX, y: 0.7 },
      colors,
      scalar: 1.1,
    });
  };

  setTimeout(() => fireSide(60, 0), 150);
  setTimeout(() => fireSide(120, 1), 150);
}
