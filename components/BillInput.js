'use client';

function shrink(file, max = 1400) {
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
      c.toBlob((b) => resolve(b), 'image/jpeg', 0.7);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function BillInput() {
  async function onChange(e) {
    const input = e.target;
    const f = input.files[0];
    if (!f) return;
    const blob = await shrink(f);
    if (!blob) return;
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'bill.jpg', { type: 'image/jpeg' }));
    input.files = dt.files;
  }
  return <input id="bill" name="bill" type="file" accept="image/*" onChange={onChange} />;
}
