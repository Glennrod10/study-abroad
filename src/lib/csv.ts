export function toCSV(headers: string[], rows: string[][]): string {
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`
    const headerRow = headers.map(escape).join(",")
    const dataRows = rows.map((row) => row.map(escape).join(","))
    return [headerRow, ...dataRows].join("\r\n")
}
