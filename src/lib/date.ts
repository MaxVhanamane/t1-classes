function pad(n: number) {
    return n.toString().padStart(2, "0");
}

export function startOfTodayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T00:00`;
}

export function endOfDayISO(date: string) {
    return `${date}T23:59`;
}

export function addDaysFromTodayEndOfDayISO(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days - 1); // inclusive days
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T23:59`;
}

export function toDateTimeLocal(value?: string | null) {
    if (!value) return undefined;
    return value.slice(0, 16); // YYYY-MM-DDTHH:mm
}

