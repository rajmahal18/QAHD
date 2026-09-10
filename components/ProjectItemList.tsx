type Item = {
  id: string;
  itemNumber: string;
  description: string;
  testCount: number;
  lastTest: string | null;
};

export default function ProjectItemList({ projectId, items }: { projectId: string; items: Item[] }) {
  return (
    <>
      {items.length ? (
        <div className="list">
          {items.map((item) => (
            <a className="card itemRow" href={`/projects/${projectId}/items/${item.id}`} key={item.id}>
              <div className="rowTop">
                <div className="rowTitle"><strong>Item {item.itemNumber}</strong><span>{item.description}</span></div>
                <span className="chevron">›</span>
              </div>
              <div className="rowMeta">
                <span>{item.testCount} test{item.testCount === 1 ? "" : "s"}</span>
                <span>{item.lastTest ? `Last test: ${item.lastTest}` : "No tests yet"}</span>
              </div>
            </a>
          ))}
        </div>
      ) : <div className="card empty"><strong>No matching items.</strong>Try another item number or description.</div>}
    </>
  );
}
