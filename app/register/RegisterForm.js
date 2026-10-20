'use client';
import { useFormStatus } from 'react-dom';
import { createStore } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} style={{ marginTop: 20 }}>
      {pending ? 'Saving… please wait' : 'Create my store page'}
    </button>
  );
}

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

export default function RegisterForm({ error }) {
  async function onLogo(e) {
    const input = e.target;
    const f = input.files[0];
    if (!f) return;
    const blob = await shrink(f);
    if (!blob) return;
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'logo.png', { type: 'image/png' }));
    input.files = dt.files;
  }

  return (
    <>
      {error && <div className="msg err" role="alert">{error}</div>}
      <form action={createStore}>
        <label htmlFor="business_name">Business name *</label>
        <input id="business_name" name="business_name" required maxLength={80} />
        <label htmlFor="logo">Logo *</label>
        <input id="logo" name="logo" type="file" accept="image/*" required onChange={onLogo} />
        <label htmlFor="contact_person">Contact person *</label>
        <input id="contact_person" name="contact_person" required maxLength={80} />
        <label htmlFor="contact_number">Contact number *</label>
        <input id="contact_number" name="contact_number" type="tel" required />
        <label htmlFor="business_details">Business details</label>
        <textarea id="business_details" name="business_details" rows={3} maxLength={500} />
        <label htmlFor="address">Business address *</label>
        <textarea id="address" name="address" rows={2} required maxLength={300} />
        <Submit />
      </form>
    </>
  );
}
