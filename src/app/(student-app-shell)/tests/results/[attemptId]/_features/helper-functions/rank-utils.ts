
export function getPercentile(
    rank: number,
    total: number
) {
    if (!total) return 0;

    const percentile =
        ((total - rank) / total) * 100;

    return Number(percentile.toFixed(1));
}
