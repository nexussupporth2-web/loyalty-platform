'use client';

import { useRef, useState } from 'react';

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
  const [chosen, setChosen] = useState('');
  const camRef = useRef(null);
  const galRef = useRef(null);
  const mainRef = useRef(null);

  // Whichever way the photo arrives (camera or gallery), it is shrunk and placed in the one field the form sends.
  async function onPick(e) {
    const f = e.target.files[0];
    if (!f) return;
    const blob = await shrink(f);
    if (!blob) return;
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'bill.jpg', { type: 'image/jpeg' }));
    mainRef.current.files = dt.files;
    setChosen('Photo added');
    e.target.value = '';
  }

  const btn = {
    flex: '1 1 0', minWidth: 0, padding: '10px 6px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
    background: 'var(--card)', border: '1.5px solid var(--bd)', borderRadius: 16, color: 'var(--tx)', boxShadow: 'var(--shadow)',
  };

  return (
    <>
      <input ref={mainRef} id="bill" name="bill" type="file" accept="image/*" style={{ display: 'none' }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onPick} style={{ display: 'none' }} />
      <input ref={galRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" style={btn} onClick={() => camRef.current.click()}>Take photo</button>
        <button type="button" style={btn} onClick={() => galRef.current.click()}>Upload from gallery</button>
      </div>
      {chosen && <p className="sub" style={{ margin: '6px 0 0' }}>{chosen} ✓</p>}
    </>
  );
}
