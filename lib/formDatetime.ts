export function formatDateTime(input: string | Date): string {
  const d = new Date(input);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

// export function FormatDate(input: string | Date): string {
//   const d = new Date(input);

//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const yyyy = d.getFullYear();
//   return `${dd}/${mm}/${yyyy}`;
// }


export function FormatDate(input: string | Date): string {
  const d = new Date(input);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();

  return `${dd} ${mm} ${yyyy}`;
}


export const parseYMDToLocalDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, m - 1, d) // local midnight
}

export function normalizeDateOnly(v: string | Date | null | undefined): string {
  if (!v) return "";

  // already YYYY-MM-DD
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";

  // convert to local date then format YYYY-MM-DD
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}


export function formatThaiDateTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    const day = d.getDate()
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ]
    const month = months[d.getMonth()]
    const year = d.getFullYear() + 543
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hh}:${mm} น.`
  } catch {
    return '-'
  }
}