import { Button } from "@/components/ui/button";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ pagination, onPageChange, disabled }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  
  const startItem = totalPages === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev || disabled}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev || disabled}
        >
          Previous
        </Button>

        <div className="text-sm font-medium">
          Page {page} of {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || disabled}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext || disabled}
        >
          Last
        </Button>
      </div>
    </div>
  );
}
