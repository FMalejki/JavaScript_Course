export function sum_strings(arr) {
    return arr.reduce((sum, str) => {
        const match = str.match(/^\d+/);
        if (match) {
            return sum + parseInt(match[0], 10);
        }
        return sum;
    }, 0);
}

export function sum(x, y) {
    return x + y;
}

export function digits_it(txt) {
    let sumEven = 0;
    let sumOdd = 0;
    for (const letter of txt) {
        if (letter >= '0' && letter <= '9') {
            const num = parseInt(letter, 10);
            if (num % 2 == 0) {
                sumEven += num;
            } else {
                sumOdd += num;
            }
        }
    }
    return [sumOdd, sumEven];
}

export function digits(s) {
    return s
        .split('')
        .filter(c => /\d/.test(c))
        .map(Number)
        .reduce(
            ([odd, even], n) =>
                n % 2 === 0 ? [odd, even + n] : [odd + n, even],
            [0, 0]
        );
}

export function letters_it(s) {
    let lower = 0;
    let upper = 0;

    for (let char of s) {
        if (char >= 'a' && char <= 'z') {
            lower++;
        } else if (char >= 'A' && char <= 'Z') {
            upper++;
        }
    }

    return [lower, upper];
}

export function letters(s) {
    return [...s].reduce(
        ([lower, upper], char) => {
            if (/[a-z]/.test(char)) return [lower + 1, upper];
            if (/[A-Z]/.test(char)) return [lower, upper + 1];
            return [lower, upper];
        },
        [0, 0]
    );
}

