import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function ReferencesPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  return <><AppHeader /><main className="shell appMain directoryScreen"><section className="simpleMasthead"><div><div className="eyebrow">Quick reference</div><h1>References</h1><p>Small reminders for the fields used in QAH monitoring.</p></div></section><div className="referenceGrid"><div className="card referenceCard"><span>Project status</span><strong>Ongoing · Completed · Suspended</strong><p>Keep the current implementation state visible on every project.</p></div><div className="card referenceCard"><span>Test result</span><strong>Pending · Passed · Failed</strong><p>Pending may be saved before testing is completed. Passed or Failed requires Date Tested.</p></div><div className="card referenceCard"><span>Evidence</span><strong>Photos and PDF</strong><p>Up to five files per upload. Photos are optimized before storage.</p></div><div className="card referenceCard"><span>Dates</span><strong>Sampled · Submitted · Tested</strong><p>Enter the dates available for the material test record.</p></div></div></main></>;
}
