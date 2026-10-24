'use client';
import { useState } from 'react';

const load = (src, cors) =>
  new Promise((res) => {
    const i = new Image();
    if (cors) i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });

function fit(ctx, text, maxW, size, weight = '') {
  let s = size;
  ctx.font = `${weight} ${s}px sans-serif`;
  while (ctx.measureText(text).width > maxW && s > 16) {
    s -= 2;
    ctx.font = `${weight} ${s}px sans-serif`;
  }
}

function wrapLines(ctx, text, maxW) {
  const lines = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  lines.push(line);
  return lines;
}

export default function StandeeDownload({ name, slug, logo, url, qr, reviewQr, follow }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const W = 1240, H = 1754; // A4 portrait
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#534AB7';
      ctx.fillRect(0, 0, W, 40);
      ctx.fillRect(0, H - 40, W, 40);
      ctx.textAlign = 'center';

      const lg = logo ? await load(logo, true) : null;
      if (lg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 230, 110, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(lg, W / 2 - 110, 120, 220, 220);
        ctx.restore();
      }

      let y = 430;
      ctx.fillStyle = '#111';
      ctx.font = 'bold 72px sans-serif';
      for (const line of wrapLines(ctx, name, W - 160)) {
        ctx.fillText(line, W / 2, y);
        y += 84;
      }
      ctx.fillStyle = '#534AB7';
      ctx.font = '600 50px sans-serif';
      ctx.fillText('Scan to join our loyalty program', W / 2, y + 10);
      y += 50;

      const q = await load(qr);
      if (q) ctx.drawImage(q, W / 2 - 300, y, 600, 600);
      y += 660;
      ctx.fillStyle = '#555';
      fit(ctx, url, W - 120, 34);
      ctx.fillText(url, W / 2, y);

      const by = 1330;
      if (follow.length) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#111';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('Follow us', 100, by + 40);
        ctx.fillStyle = '#333';
        follow.forEach((t, i) => {
          fit(ctx, t, 700, 36);
          ctx.fillText(t, 100, by + 110 + i * 60);
        });
      }
      if (reviewQr) {
        const rq = await load(reviewQr);
        if (rq) ctx.drawImage(rq, W - 400, by, 300, 300);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#111';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('Review us on Google', W - 250, by + 350);
      }

      await new Promise((res) =>
        c.toBlob((b) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = `${slug}-standee.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          res();
        }, 'image/png')
      );
    } catch (e) {
      alert('Could not create the image. Please use "Print or save as PDF" instead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn" onClick={download} disabled={busy}>
      {busy ? 'Preparing…' : 'Download full standee (image)'}
    </button>
  );
        }
