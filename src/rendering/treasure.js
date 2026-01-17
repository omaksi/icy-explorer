export const drawTreasure = (ctx, treasure, cameraX, cameraY, nearbyTreasureId, frameCount, viewportWidth, viewportHeight) => {
  if (treasure.collected) return false;

  const screenX = treasure.x - cameraX;
  const screenY = treasure.y - cameraY;

  // Only draw if on screen
  if (screenX < -32 || screenX > viewportWidth + 32 || screenY < -32 || screenY > viewportHeight + 32) {
    return false;
  }

  const isNearby = treasure.id === nearbyTreasureId;
  const bobOffset = Math.sin(frameCount * 0.1 + treasure.id) * 2;

  // Glow effect for nearby treasures
  if (isNearby) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX, screenY + bobOffset, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chest shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + 12, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!treasure.opened) {
    drawClosedChest(ctx, screenX, screenY, bobOffset);
  } else {
    drawOpenChest(ctx, screenX, screenY, bobOffset, frameCount);
  }

  return true;
};

const drawClosedChest = (ctx, screenX, screenY, bobOffset) => {
  // Closed chest - base
  ctx.fillStyle = '#92400e';
  ctx.fillRect(screenX - 12, screenY - 4 + bobOffset, 24, 16);

  // Chest lid
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(screenX - 14, screenY - 4 + bobOffset);
  ctx.lineTo(screenX - 12, screenY - 12 + bobOffset);
  ctx.lineTo(screenX + 12, screenY - 12 + bobOffset);
  ctx.lineTo(screenX + 14, screenY - 4 + bobOffset);
  ctx.closePath();
  ctx.fill();

  // Metal bands
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(screenX - 13, screenY - 6 + bobOffset, 26, 3);
  ctx.fillRect(screenX - 2, screenY - 12 + bobOffset, 4, 20);

  // Lock
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.arc(screenX, screenY + 2 + bobOffset, 4, 0, Math.PI * 2);
  ctx.fill();
};

const drawOpenChest = (ctx, screenX, screenY, bobOffset, frameCount) => {
  // Open chest - base
  ctx.fillStyle = '#92400e';
  ctx.fillRect(screenX - 12, screenY - 4 + bobOffset, 24, 16);

  // Inside (dark)
  ctx.fillStyle = '#451a03';
  ctx.fillRect(screenX - 10, screenY - 2 + bobOffset, 20, 10);

  // Open lid (tilted back)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(screenX - 14, screenY - 4 + bobOffset);
  ctx.lineTo(screenX - 16, screenY - 18 + bobOffset);
  ctx.lineTo(screenX + 10, screenY - 18 + bobOffset);
  ctx.lineTo(screenX + 14, screenY - 4 + bobOffset);
  ctx.closePath();
  ctx.fill();

  // Metal band on open lid
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(screenX - 15, screenY - 14 + bobOffset, 24, 2);

  // Sparkle effect
  ctx.fillStyle = '#fef3c7';
  const sparkle = Math.sin(frameCount * 0.2) * 0.5 + 0.5;
  ctx.globalAlpha = sparkle;
  ctx.beginPath();
  ctx.arc(screenX - 4, screenY - 8 + bobOffset, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(screenX + 5, screenY - 6 + bobOffset, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

export const drawTreasureOnMinimap = (ctx, treasure, mapX, mapY, mapScale) => {
  ctx.fillStyle = treasure.opened ? '#fbbf24' : '#f59e0b';
  ctx.beginPath();
  ctx.arc(
    mapX + treasure.x * mapScale,
    mapY + treasure.y * mapScale,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
};
