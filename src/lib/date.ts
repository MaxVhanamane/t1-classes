
export function endOfDayISO(date: string) {
    return `${date}T23:59`;
}


export function toDateTimeLocal(value?: string | null) {
    if (!value) return undefined;

    const d = new Date(value); // parses UTC correctly

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}




export function localDateTimeToUTCISO(
    value: string | undefined | null
): string | null {
    if (!value) return null

    // value comes from <input type="datetime-local">
    // JS treats it as LOCAL time
    // toISOString() converts it to UTC correctly
    return new Date(value).toISOString()
}


export function formatDateShort(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
