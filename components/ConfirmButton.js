'use client';

export default function ConfirmButton({ label, message, style }) {
  return (
    <button
      className="btn"
      type="submit"
      style={style}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
