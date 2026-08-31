import { PaginationControls } from "@/components/ui/pagination";

type CoursePaginationProps = {
  categoryId?: string;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
};

function getPageHref(
  page: number,
  searchQuery: string,
  categoryId?: string,
): string {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category", categoryId);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default function CoursePagination({
  categoryId,
  currentPage,
  totalPages,
  searchQuery,
}: CoursePaginationProps) {
  return (
    <PaginationControls
      className="mt-10 sm:mt-12"
      currentPage={currentPage}
      totalPages={totalPages}
      getPageHref={(page) => getPageHref(page, searchQuery, categoryId)}
    />
  );
}
