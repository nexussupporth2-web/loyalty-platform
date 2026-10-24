'use client';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label, busyLabel = 'Saving… please wait' }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} style={{ marginTop: 20 }}>
      {pending ? busyLabel : label}
    </button>
  );
}
