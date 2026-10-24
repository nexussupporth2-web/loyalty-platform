import RegisterForm from './RegisterForm';

export default function Register({ searchParams }) {
  return (
    <>
      <h1>Register your store</h1>
      <p className="sub">You will get a unique link and a QR code for your customers.</p>
      <RegisterForm error={searchParams.error} />
    </>
  );
}
