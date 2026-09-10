import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ItemForm from "@/components/ItemForm";
import { updateItem } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; itemId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/projects");

  const { id, itemId } = await params;
  const { error = "" } = await searchParams;
  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, projectId: id },
    include: { project: true },
  });
  if (!item) notFound();

  const back = `/projects/${item.project.id}/items/${item.id}`;
  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={back}>← Item {item.itemNumber}</a>
        <div className="pageTop"><div><h1>Edit item</h1><p>{item.project.projectCode}</p></div></div>
        <ItemForm
          action={updateItem.bind(null, item.project.id, item.id)}
          itemNumber={item.itemNumber}
          description={item.description}
          cancelHref={back}
          error={error}
        />
      </main>
    </>
  );
}
