import LogoInput from './LogoInput';
import ImagesInput from './ImagesInput';

export default function StoreFields({
  d = {}, logoRequired = false, passwordLabel, passwordRequired = false, withImages = false,
}) {
  const v = (k) => d[k] || '';
  const images = d.store_images || [];
  return (
    <>
      <label htmlFor="business_name">Business name *</label>
      <input id="business_name" name="business_name" required maxLength={80} defaultValue={v('business_name')} />
      <label htmlFor="slogan">Slogan (a short line shown under your logo)</label>
      <input id="slogan" name="slogan" maxLength={120} defaultValue={v('slogan')} />
      <label htmlFor="logo">{logoRequired ? 'Logo *' : 'Logo (leave empty to keep the current one)'}</label>
      <LogoInput required={logoRequired} />
      <label htmlFor="contact_person">Contact person *</label>
      <input id="contact_person" name="contact_person" required maxLength={80} defaultValue={v('contact_person')} />
      <label htmlFor="contact_number">Contact number *</label>
      <input id="contact_number" name="contact_number" type="tel" required defaultValue={v('contact_number')} />
      <label htmlFor="business_details">About your business</label>
      <textarea id="business_details" name="business_details" rows={3} maxLength={500} defaultValue={v('business_details')} />
      <label htmlFor="address">Address / location *</label>
      <textarea id="address" name="address" rows={2} required maxLength={300} defaultValue={v('address')} />
      <label htmlFor="map_url">Google Maps location link (optional, starts with https://)</label>
      <input id="map_url" name="map_url" type="url" maxLength={500} defaultValue={v('map_url')} />

      {withImages && (
        <>
          <h2>Store images (up to 5)</h2>
          <p className="sub">They scroll across your store page. Untick a photo to remove it.</p>
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {images.map((u) => (
                <label key={u} style={{ display: 'block', margin: 0, fontSize: 12 }}>
                  <img src={u} alt="" style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                  <input type="checkbox" name="keep" value={u} defaultChecked style={{ width: 'auto' }} /> Keep
                </label>
              ))}
            </div>
          )}
          <label htmlFor="images">Add photos</label>
          <ImagesInput />
        </>
      )}

      <h2>Optional: social and reviews</h2>
      <p className="sub">Only the ones you fill in will be shown to customers.</p>
      <label htmlFor="whatsapp">WhatsApp number (with country code, e.g. 919876543210)</label>
      <input id="whatsapp" name="whatsapp" type="tel" defaultValue={v('whatsapp')} />
      <label htmlFor="instagram">Instagram ID (without @)</label>
      <input id="instagram" name="instagram" maxLength={60} defaultValue={v('instagram')} />
      <label htmlFor="facebook">Facebook page name</label>
      <input id="facebook" name="facebook" maxLength={80} defaultValue={v('facebook')} />
      <label htmlFor="youtube">YouTube (a handle like @name, or your channel link)</label>
      <input id="youtube" name="youtube" maxLength={300} defaultValue={v('youtube')} />
      <label htmlFor="review_url">Link to Google reviews (starts with https://)</label>
      <input id="review_url" name="review_url" type="url" maxLength={500} defaultValue={v('review_url')} />
      <label htmlFor="google_place_id">Google Place ID (used if you have no reviews link)</label>
      <input id="google_place_id" name="google_place_id" maxLength={200} defaultValue={v('google_place_id')} />

      <h2>Owner password</h2>
      <label htmlFor="password">{passwordLabel}</label>
      <input id="password" name="password" type="password" minLength={6} required={passwordRequired} autoComplete="new-password" />
    </>
  );
                                                                                             }
