// Business timezone offset used both for from_date/to_date day boundaries and
// for the default "today" applied when those params are omitted.
// Override via DATE_FILTER_TZ_OFFSET (ISO offset, e.g. "+07:00").
export const LOCAL_TZ_OFFSET = process.env.DATE_FILTER_TZ_OFFSET || '+08:00';

function offsetToMinutes(offset: string): number {
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(offset.trim());
  if (!match) {
    return 0;
  }
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

// Today's calendar date (YYYY-MM-DD) in the business timezone, so the default
// list window matches "today" as users in GMT+8 experience it (not UTC).
export function getLocalToday(): string {
  const shifted = new Date(
    Date.now() + offsetToMinutes(LOCAL_TZ_OFFSET) * 60000,
  );
  return shifted.toISOString().split('T')[0];
}
