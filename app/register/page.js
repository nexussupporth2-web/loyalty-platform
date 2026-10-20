import { createStore } from "./actions";

export default function Register({ searchParams }) {
  return (
    <> <h1>Register your store</h1> <p className="sub"> You will get a unique link and a QR code for your customers. </p> {searchParams.error && ( <div className="msg err" role="alert"> {searchParams.error} </div> )} <form action={createStore}> <label htmlFor="business_name">Business name *</label> <input id="business_name" name="business_name" required maxLength={80} /> <label htmlFor="logo">Logo *</label> <input id="logo" name="logo" type="file" accept="image/*" required /> <label htmlFor="contact_person">Contact person *</label> <input id="contact_person" name="contact_person" required maxLength={80} /> <label htmlFor="contact_number">Contact number *</label> <input id="contact_number" name="contact_number" type="tel" required /> <label htmlFor="business_details">Business details</label> <textarea id="business_details" name="business_details" rows={3} maxLength={500} /> <label htmlFor="address">Business address *</label> <textarea id="address" name="address" rows={2} required maxLength={300} /> <button className="btn" type="submit" style={{ marginTop: 20 }}> Create my store page </button> </form> </>
  );
    }
