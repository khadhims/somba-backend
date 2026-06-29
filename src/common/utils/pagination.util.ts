import { QueryPageSearchDto } from '../queryPaginateSearch.dto';
import { LOCAL_TZ_OFFSET } from './date.util';

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function resolvePagination(query: QueryPageSearchDto) {
  const page = query.page ?? 1;
  const perPage = query.page_size ?? 10;
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

export function buildPaginatedResult<T>(
  items: T[],
  totalItems: number,
  query: QueryPageSearchDto,
): PaginatedResult<T> {
  const { page, perPage } = resolvePagination(query);
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  return {
    data: items,
    pagination: {
      page,
      per_page: perPage,
      total_items: totalItems,
      total_pages: totalPages,
      next_page: page < totalPages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null,
    },
  };
}

// from_date/to_date day boundaries are interpreted in the business timezone
// (LOCAL_TZ_OFFSET): e.g. from_date=2026-06-26 → 2026-06-26T00:00:00+08:00
// (= 2026-06-25T16:00Z), so a "26 Jun" filter matches events on 26 Jun local.
export function applyDateRange(
  column: string,
  query: QueryPageSearchDto,
  params: Record<string, unknown>,
): string[] {
  const clauses: string[] = [];

  if (query.from_date) {
    params.fromDate = `${query.from_date}T00:00:00.000${LOCAL_TZ_OFFSET}`;
    clauses.push(`${column} >= :fromDate`);
  }

  if (query.to_date) {
    params.toDate = `${query.to_date}T23:59:59.999${LOCAL_TZ_OFFSET}`;
    clauses.push(`${column} <= :toDate`);
  }

  return clauses;
}
