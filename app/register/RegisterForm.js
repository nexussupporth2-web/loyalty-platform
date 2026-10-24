import { createStore } from './actions';
import StoreFields from '../../components/StoreFields';
import SubmitButton from '../../components/SubmitButton';

export default function RegisterForm({ error }) {
  return (
    <>
      {error && <div className="msg err" role="alert">{error}</div>}
      <form action={createStore}>
        <StoreFields
          logoRequired
          passwordRequired
          passwordLabel="Create an owner password (6 or more characters). You need it to edit your store later. *"
        />
        <SubmitButton label="Create my store page" />
      </form>
    </>
  );
            }
