export const PAGE_SIZE = 20;

export function pagination(value: string | undefined, total: number) {
  const requested = Number(value);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  return { page, pages, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}
