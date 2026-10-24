import LogoInput from './LogoInput';

export default function StoreFields({ d = {}, logoRequired = false, passwordLabel, passwordRequired = false }) {
  const v = (k) => d[k] || '';
  return (
    <>
      <label htmlFor="business_name">Business name *</label>
      <input id="business_name" name="business_name" required maxLength={80} defaultValue={v('business_name')} />
      <label htmlFor="logo">{logoRequired ? 'Logo *' : 'Logo (leave empty to keep the current one)'}</label>
      <LogoInput required={logoRequired} />
      <label htmlFor="contact_person">Contact person *</label>
      <input id="contact_person" name="contact_person" required maxLength={80} defaultValue={v('contact_person')} />
      <label htmlFor="contact_number">Contact number *</label>
      <input id="contact_number" name="contact_number" type="tel" required defaultValue={v('contact_number')} />
      <label htmlFor="business_details">Business details</label>
      <textarea id="business_details" name="business_details" rows={3} maxLength={500} defaultValue={v('business_details')} />
      <label htmlFor="address">Business address *</label>
      <textarea id="address" name="address" rows={2} required maxLength={300} defaultValue={v('address')} />

      <h2>Optional: social and reviews</h2>
      <p className="sub">Only the ones you fill in will be shown to customers.</p>
      <label htmlFor="whatsapp">WhatsApp number (with country code, e.g. 919876543210)</label>
      <input id="whatsapp" name="whatsapp" type="tel" defaultValue={v('whatsapp')} />
      <label htmlFor="instagram">Instagram ID (without @)</label>
      <input id="instagram" name="instagram" maxLength={60} defaultValue={v('instagram')} />
      <label htmlFor="facebook">Facebook page name</label>
      <input id="facebook" name="facebook" maxLength={80} defaultValue={v('facebook')} />
      <label htmlFor="google_place_id">Google Place ID (for Google reviews)</label>
      <input id="google_place_id" name="google_place_id" maxLength={200} defaultValue={v('google_place_id')} />

      <h2>Owner password</h2>
      <label htmlFor="password">{passwordLabel}</label>
      <input id="password" name="password" type="password" minLength={6} required={passwordRequired} autoComplete="new-password" />
    </>
  );
}
