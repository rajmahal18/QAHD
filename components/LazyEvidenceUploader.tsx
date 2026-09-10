"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Uploader = dynamic(() => import("./EvidenceUploader"), {
  loading: () => <p role="status">Loading upload form…</p>,
  ssr: false,
});

export default function LazyEvidenceUploader({ testId }: { testId: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} style={{ minHeight: 160 }}>{visible ? <Uploader testId={testId} /> : <button className="button secondary" onClick={() => setVisible(true)}>Load upload form</button>}</div>;
}
