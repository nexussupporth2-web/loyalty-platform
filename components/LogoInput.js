'use client';

function shrink(file, max = 512) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function LogoInput({ required }) {
  async function onChange(e) {
    const input = e.target;
    const f = input.files[0];
    if (!f) return;
    const blob = await shrink(f);
    if (!blob) return;
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'logo.png', { type: 'image/png' }));
    input.files = dt.files;
  }
  return <input id="logo" name="logo" type="file" accept="image/*" required={required} onChange={onChange} />;
}
