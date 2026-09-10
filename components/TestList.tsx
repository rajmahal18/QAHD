type TestRow = {
  id: string;
  testName: string;
  date: string;
  result: "PASSED" | "FAILED" | "PENDING";
  remarks: string | null;
  attachmentCount: number;
};

function label(value: TestRow["result"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function TestList({ tests }: { tests: TestRow[] }) {
  return (
    <>
      {tests.length ? (
        <div className="list">
          {tests.map((test) => (
            <a className="card testRow" href={`/tests/${test.id}`} key={test.id}>
              <div className="rowTop">
                <div className="rowTitle"><strong>{test.testName}</strong><span>{test.date}</span></div>
                <span className={`badge ${test.result}`}>{label(test.result)}</span>
              </div>
              <div className="rowMeta">
                <span>{test.attachmentCount} attachment{test.attachmentCount === 1 ? "" : "s"}</span>
                {test.remarks ? <span>{test.remarks.length > 100 ? `${test.remarks.slice(0, 100)}…` : test.remarks}</span> : null}
              </div>
            </a>
          ))}
        </div>
      ) : <div className="card empty"><strong>No matching tests.</strong>Clear the search or change the result filter.</div>}
    </>
  );
}
