'use client';

function shrink(file, max = 1000) {
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
      c.toBlob((b) => resolve(b), 'image/jpeg', 0.75);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function ImagesInput() {
  async function onChange(e) {
    const input = e.target;
    const files = Array.from(input.files).slice(0, 5);
    const dt = new DataTransfer();
    for (let i = 0; i < files.length; i++) {
      const blob = await shrink(files[i]);
      if (blob) dt.items.add(new File([blob], `photo${i}.jpg`, { type: 'image/jpeg' }));
    }
    input.files = dt.files;
  }
  return <input id="images" name="images" type="file" accept="image/*" multiple onChange={onChange} />;
    }
