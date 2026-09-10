type Item = {
  id: string;
  itemNumber: string;
  description: string;
  testCount: number;
  lastTest: string | null;
  lastResult?: "PASSED" | "FAILED" | "PENDING" | null;
};

export default function ProjectItemList({ projectId, items }: { projectId: string; items: Item[] }) {
  return (
    <>
      {items.length ? (
        <div className="list itemListPremium">
          {items.map((item) => (
            <a className="card itemRow itemRowPremium" href={`/projects/${projectId}/items/${item.id}`} key={item.id}>
              <div className="rowTop">
                <div className="rowTitle">
                  <span className="rowKicker">Item {item.itemNumber}</span>
                  <strong>{item.description}</strong>
                </div>
                <div className="rowAside">
                  {item.lastResult ? <span className={`badge ${item.lastResult}`}>{item.lastResult.toLowerCase()}</span> : null}
                  <span className="chevron">›</span>
                </div>
              </div>
              <div className="rowMeta itemMeta">
                <span>{item.testCount} test{item.testCount === 1 ? "" : "s"}</span>
                <span>{item.lastTest ? `Last activity: ${item.lastTest}` : "No tests yet"}</span>
              </div>
            </a>
          ))}
        </div>
      ) : <div className="card empty"><strong>No matching items.</strong>Try another item number or description.</div>}
    </>
  );
}
