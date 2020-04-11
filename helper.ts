export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function hexStringToInt(hex: string): number {
    return Number.parseInt(`0x${hex.substring(1)}`);
}

export function getHorizontalLines(amount: number): string {
    let line = '';
    for (let i = 0; i < amount; i++) {
        line += '-';
    }
    return line;
}