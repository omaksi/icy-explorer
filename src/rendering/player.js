import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../constants';

export const drawPlayer = (ctx, player, keys) => {
  const playerScreenX = VIEWPORT_WIDTH / 2;
  const playerScreenY = VIEWPORT_HEIGHT / 2;

  // Animation bob
  const bob = Math.sin(player.frame * 0.4) * 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(playerScreenX, playerScreenY + 14, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (space suit)
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.ellipse(playerScreenX, playerScreenY + bob, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Suit highlights
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.ellipse(playerScreenX - 4, playerScreenY - 2 + bob, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Helmet
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(playerScreenX, playerScreenY - 12 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  if (player.direction === 'up') {
    ctx.arc(playerScreenX, playerScreenY - 12 + bob, 6, 0, Math.PI * 2);
  } else if (player.direction === 'down') {
    ctx.ellipse(playerScreenX, playerScreenY - 10 + bob, 7, 5, 0, 0, Math.PI * 2);
  } else if (player.direction === 'left') {
    ctx.ellipse(playerScreenX - 3, playerScreenY - 11 + bob, 5, 6, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(playerScreenX + 3, playerScreenY - 11 + bob, 5, 6, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Visor shine
  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.arc(playerScreenX - 2, playerScreenY - 13 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Jetpack
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(playerScreenX - 14, playerScreenY - 4 + bob, 4, 10);
  ctx.fillRect(playerScreenX + 10, playerScreenY - 4 + bob, 4, 10);

  // Jetpack glow (subtle)
  if (Object.values(keys).some(k => k)) {
    ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(playerScreenX - 12, playerScreenY + 10 + bob, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(playerScreenX + 12, playerScreenY + 10 + bob, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};
