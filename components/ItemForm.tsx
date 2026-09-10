export default function ItemForm({
  action,
  itemNumber,
  description,
  cancelHref,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  itemNumber?: string;
  description?: string;
  cancelHref: string;
  error?: string;
}) {
  return (
    <form className="card formCard" action={action}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="formGrid">
        <div className="field">
          <label htmlFor="itemNumber">Item No.</label>
          <input className="input" id="itemNumber" name="itemNumber" defaultValue={itemNumber} placeholder="e.g. 200" autoComplete="off" required />
        </div>
        <div className="field fullOnMobile">
          <label htmlFor="description">Description</label>
          <input className="input" id="description" name="description" defaultValue={description} placeholder="e.g. Aggregate Base Course" autoComplete="off" required />
        </div>
      </div>
      <div className="formActions">
        <a className="button secondary" href={cancelHref}>Cancel</a>
        <button className="button" type="submit">Save item</button>
      </div>
    </form>
  );
}
