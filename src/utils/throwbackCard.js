import { TODAY_LABEL, CURRENT_YEAR } from '../components/throwback/constants';

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function trunc(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function generateCard(result) {
  const W = 560, H = 760, PAD = 40;
  const canvas = document.createElement('canvas');
  canvas.width  = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, -40, 0, W / 2, -40, 420);
  glow.addColorStop(0, 'rgba(192,22,26,0.30)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#333';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('THROWBACK', PAD, 50);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#666';
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.fillText(TODAY_LABEL, PAD, 84);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px system-ui, sans-serif';
  ctx.fillText(String(result.year), PAD - 3, 152);

  ctx.fillStyle = '#3a3a3a';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillText(`@${result.user}  ·  ${result.total} plays  ·  ${CURRENT_YEAR - result.year}y ago`, PAD, 176);

  ctx.strokeStyle = '#171717';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, 194); ctx.lineTo(W - PAD, 194); ctx.stroke();

  ctx.fillStyle = '#2a2a2a';
  ctx.font = '700 10px system-ui, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('TOP TRACKS', PAD, 218);
  ctx.letterSpacing = '0px';

  const tracks = result.data.tracks.slice(0, 5);
  let y = 238;
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    ctx.fillStyle = '#222';
    ctx.font = '700 11px monospace';
    ctx.fillText(String(i + 1), PAD, y + 20);

    const artX = PAD + 20, artSize = 38;
    ctx.fillStyle = '#111';
    roundRect(ctx, artX, y, artSize, artSize, 4);
    ctx.fill();
    if (t.art) {
      try {
        const img = await loadImg(t.art);
        ctx.save();
        roundRect(ctx, artX, y, artSize, artSize, 4);
        ctx.clip();
        ctx.drawImage(img, artX, y, artSize, artSize);
        ctx.restore();
      } catch { /* CORS — placeholder stays */ }
    }

    const textX = artX + artSize + 12;
    ctx.fillStyle = '#d8d8d8';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText(trunc(t.name, 32), textX, y + 16);
    ctx.fillStyle = '#444';
    ctx.font = '400 12px system-ui, sans-serif';
    ctx.fillText(trunc(t.artist, 36), textX, y + 32);

    const countStr = `${t.count}×`;
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '700 11px monospace';
    ctx.fillText(countStr, W - PAD - ctx.measureText(countStr).width, y + 20);
    y += 56;
  }

  ctx.strokeStyle = '#171717';
  ctx.beginPath(); ctx.moveTo(PAD, H - 52); ctx.lineTo(W - PAD, H - 52); ctx.stroke();

  ctx.fillStyle = '#252525';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillText('via last.fm', PAD, H - 28);
  ctx.fillStyle = '#1c1c1c';
  const site = 'projects.mayinflight.com/throwback';
  ctx.fillText(site, W - PAD - ctx.measureText(site).width, H - 28);

  return canvas;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function getCardBlob(result) {
  return generateCard(result).then(
    canvas => new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  );
}

export async function shareCard(result) {
  const blob = await getCardBlob(result);
  const file = new File([blob], `throwback-${result.year}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `My ${result.year} Throwback`,
      text: `What I was listening to on ${TODAY_LABEL}, ${result.year}`,
      files: [file],
    });
  } else {
    downloadBlob(blob, `throwback-${result.year}.png`);
  }
}

export function saveCard(result) {
  getCardBlob(result).then(blob => downloadBlob(blob, `throwback-${result.year}.png`));
}
