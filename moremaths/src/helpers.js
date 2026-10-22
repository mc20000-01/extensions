/*
 * Shared helpers for the More Maths extension.
 *
 * Twext compiles a handler by copying its source text into the generated
 * extension class, so a handler can only reach things that exist at runtime:
 * JavaScript built-ins, the Scratch global, and the other helpers published in
 * the `methods` export. Helpers therefore call each other through `this`.
 */

export function num(value) {
  return Scratch.Cast.toNumber(value);
}

export function whole(value) {
  const n = Scratch.Cast.toNumber(value);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

export function signOf(value) {
  const n = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(n)) return n;
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

export function degreesToRadians(degrees) {
  return (Scratch.Cast.toNumber(degrees) * Math.PI) / 180;
}

export function radiansToDegrees(radians) {
  return (Scratch.Cast.toNumber(radians) * 180) / Math.PI;
}

export function clampNum(value, low, high) {
  let min = Scratch.Cast.toNumber(low);
  let max = Scratch.Cast.toNumber(high);
  if (min > max) {
    const swap = min;
    min = max;
    max = swap;
  }
  const n = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function positiveRemainder(value, size) {
  const n = Scratch.Cast.toNumber(value);
  const m = Math.abs(Scratch.Cast.toNumber(size));
  if (!Number.isFinite(n) || !Number.isFinite(m) || m === 0) return n;
  return ((n % m) + m) % m;
}

export function gcdOf(a, b) {
  let x = Math.abs(Math.trunc(Scratch.Cast.toNumber(a)));
  let y = Math.abs(Math.trunc(Scratch.Cast.toNumber(b)));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

export function lcmOf(a, b) {
  const x = Math.abs(Math.trunc(Scratch.Cast.toNumber(a)));
  const y = Math.abs(Math.trunc(Scratch.Cast.toNumber(b)));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  if (x === 0 || y === 0) return 0;
  return (x / this.gcdOf(x, y)) * y;
}

export function factorialOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (n > 170) return Infinity;
  let total = 1;
  for (let i = 2; i <= n; i++) total *= i;
  return total;
}

export function doubleFactorialOf(value) {
  let n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n)) return NaN;
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let total = 1;
  for (let i = n; i > 1; i -= 2) {
    total *= i;
    if (!Number.isFinite(total)) return Infinity;
  }
  return total;
}

export function subfactorialOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  let previous = 1;
  let total = 1;
  for (let i = 1; i <= n; i++) {
    total = i * previous + (i % 2 === 0 ? 1 : -1);
    previous = total;
    if (!Number.isFinite(total)) return Infinity;
  }
  return total;
}

export function binomialOf(nValue, kValue) {
  const n = Math.trunc(Scratch.Cast.toNumber(nValue));
  const k = Math.trunc(Scratch.Cast.toNumber(kValue));
  if (!Number.isFinite(n) || !Number.isFinite(k)) return NaN;
  if (n < 0 || k < 0) return NaN;
  if (k > n) return 0;
  const take = Math.min(k, n - k);
  let total = 1;
  for (let i = 0; i < take; i++) {
    total = (total * (n - i)) / (i + 1);
    if (!Number.isFinite(total)) return Infinity;
  }
  return Math.round(total);
}

export function fibonacciOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const next = a + b;
    a = b;
    b = next;
    if (!Number.isFinite(b)) return Infinity;
  }
  return a;
}

export function lucasOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  let a = 2;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const next = a + b;
    a = b;
    b = next;
    if (!Number.isFinite(b)) return Infinity;
  }
  return a;
}

export function tribonacciOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  // 0, 0, 1, 1, 2, 4, 7, ... so this matches tribonacciSequenceList.
  let a = 0;
  let b = 0;
  let c = 1;
  for (let i = 0; i < n; i++) {
    const next = a + b + c;
    a = b;
    b = c;
    c = next;
    if (!Number.isFinite(c)) return Infinity;
  }
  return a;
}

export function catalanOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  const central = this.binomialOf(2 * n, n);
  if (!Number.isFinite(central)) return central;
  return central / (n + 1);
}

export function bellOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (n > 250) return Infinity;
  let row = [1];
  for (let i = 0; i < n; i++) {
    const next = [row[row.length - 1]];
    for (let j = 0; j < row.length; j++) next.push(next[j] + row[j]);
    row = next;
  }
  return row[0];
}

export function stirlingSecondOf(nValue, kValue) {
  const n = Math.trunc(Scratch.Cast.toNumber(nValue));
  const k = Math.trunc(Scratch.Cast.toNumber(kValue));
  if (!Number.isFinite(n) || !Number.isFinite(k)) return NaN;
  if (n < 0 || k < 0 || k > n || n > 250) return NaN;
  let row = new Array(k + 1).fill(0);
  row[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.min(i, k); j > 0; j--) row[j] = row[j - 1] + j * row[j];
    row[0] = 0;
  }
  return row[k];
}

export function stirlingFirstOf(nValue, kValue) {
  const n = Math.trunc(Scratch.Cast.toNumber(nValue));
  const k = Math.trunc(Scratch.Cast.toNumber(kValue));
  if (!Number.isFinite(n) || !Number.isFinite(k)) return NaN;
  if (n < 0 || k < 0 || k > n || n > 250) return NaN;
  let row = new Array(k + 1).fill(0);
  row[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.min(i, k); j > 0; j--) {
      row[j] = row[j - 1] - (i - 1) * row[j];
    }
    row[0] = -(i - 1) * row[0];
  }
  return row[k];
}

export function powerMod(base, exponent, modulus) {
  if (
    typeof base === "bigint" ||
    typeof exponent === "bigint" ||
    typeof modulus === "bigint"
  ) {
    let result = 1n;
    let factor = base % modulus;
    let power = exponent;
    while (power > 0n) {
      if (power % 2n === 1n) result = (result * factor) % modulus;
      factor = (factor * factor) % modulus;
      power /= 2n;
    }
    return result;
  }
  const b = Scratch.Cast.toNumber(base);
  const e = Scratch.Cast.toNumber(exponent);
  const m = Scratch.Cast.toNumber(modulus);
  if (!Number.isInteger(e) || e < 0) return NaN;
  if (!Number.isSafeInteger(m) || m < 1 || !Number.isFinite(b)) return NaN;
  if (m * m <= 9007199254740992) {
    let result = 1 % m;
    let factor = ((b % m) + m) % m;
    let power = e;
    while (power > 0) {
      if (power % 2 === 1) result = (result * factor) % m;
      factor = (factor * factor) % m;
      power = Math.floor(power / 2);
    }
    return result;
  }
  const wide = BigInt(m);
  let wideResult = 1n;
  let wideFactor = BigInt(Math.trunc(b)) % wide;
  if (wideFactor < 0n) wideFactor += wide;
  let widePower = BigInt(e);
  while (widePower > 0n) {
    if (widePower % 2n === 1n) wideResult = (wideResult * wideFactor) % wide;
    wideFactor = (wideFactor * wideFactor) % wide;
    widePower /= 2n;
  }
  return Number(wideResult);
}

export function isPrimeNumber(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 2) return false;
  const small = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  for (const prime of small) {
    if (n === prime) return true;
    if (n % prime === 0) return false;
  }
  const modulus = BigInt(n);
  let exponent = modulus - 1n;
  let twos = 0;
  while (exponent % 2n === 0n) {
    exponent /= 2n;
    twos += 1;
  }
  for (const prime of small) {
    let value = this.powerMod(BigInt(prime), exponent, modulus);
    if (value === 1n || value === modulus - 1n) continue;
    let witness = true;
    for (let i = 1; i < twos; i++) {
      value = (value * value) % modulus;
      if (value === modulus - 1n) {
        witness = false;
        break;
      }
    }
    if (witness) return false;
  }
  return true;
}

export function nextPrimeOf(value) {
  let n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n)) return NaN;
  if (n < 2) return 2;
  n += n % 2 === 0 ? 1 : 2;
  while (Number.isSafeInteger(n)) {
    if (this.isPrimeNumber(n)) return n;
    n += 2;
  }
  return NaN;
}

export function previousPrimeOf(value) {
  let n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n)) return NaN;
  if (n <= 2) return 0;
  if (!Number.isSafeInteger(n)) return NaN;
  n -= n % 2 === 0 ? 1 : 2;
  while (n > 2) {
    if (this.isPrimeNumber(n)) return n;
    n -= 2;
  }
  return 2;
}

export function pollardFactorOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (n % 2 === 0) return 2;
  if (n % 3 === 0) return 3;
  const modulus = BigInt(n);
  for (let seed = 1n; seed < 32n; seed += 1n) {
    let x = seed;
    let y = seed;
    let divisor = 1n;
    let steps = 0;
    while (divisor === 1n && steps < 50000) {
      x = (x * x + seed) % modulus;
      y = (y * y + seed) % modulus;
      y = (y * y + seed) % modulus;
      let difference = x > y ? x - y : y - x;
      let a = difference;
      let b = modulus;
      while (b !== 0n) {
        const next = a % b;
        a = b;
        b = next;
      }
      divisor = a;
      steps += 1;
    }
    if (divisor > 1n && divisor < modulus) return Number(divisor);
  }
  return n;
}

export function primeFactorsOf(value) {
  const start = Math.abs(Math.trunc(Scratch.Cast.toNumber(value)));
  if (!Number.isFinite(start) || start < 2) return [];
  const factors = [];
  const pending = [start];
  while (pending.length > 0) {
    let n = pending.pop();
    if (n < 2) continue;
    if (n <= 1000000) {
      let i = 2;
      while (i * i <= n) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
        i += i === 2 ? 1 : 2;
      }
      if (n > 1) factors.push(n);
      continue;
    }
    if (this.isPrimeNumber(n)) {
      factors.push(n);
      continue;
    }
    const factor = this.pollardFactorOf(n);
    if (factor === n) {
      factors.push(n);
      continue;
    }
    pending.push(factor, n / factor);
  }
  factors.sort((a, b) => a - b);
  return factors;
}

export function divisorsOf(value) {
  const n = Math.abs(Math.trunc(Scratch.Cast.toNumber(value)));
  if (!Number.isFinite(n) || n === 0) return [];
  const factors = this.primeFactorsOf(n);
  const divisors = [1];
  let index = 0;
  while (index < factors.length) {
    const prime = factors[index];
    const start = divisors.length;
    let power = 1;
    while (index < factors.length && factors[index] === prime) {
      power *= prime;
      for (let i = 0; i < start; i++) divisors.push(divisors[i] * power);
      index += 1;
    }
  }
  divisors.sort((a, b) => a - b);
  return divisors;
}

export function distinctPrimeFactorsOf(value) {
  const factors = this.primeFactorsOf(value);
  const distinct = [];
  for (let i = 0; i < factors.length; i++) {
    if (i === 0 || factors[i] !== factors[i - 1]) distinct.push(factors[i]);
  }
  return distinct;
}

export function totientOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 1) return 0;
  let total = n;
  for (const factor of this.distinctPrimeFactorsOf(n)) total -= total / factor;
  return total;
}

export function mobiusOf(value) {
  const n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 1) return 0;
  if (n === 1) return 1;
  const distinct = this.distinctPrimeFactorsOf(n);
  if (distinct.length !== this.primeFactorsOf(n).length) return 0;
  return distinct.length % 2 === 0 ? 1 : -1;
}

export function collatzStepsOf(value) {
  let n = Math.abs(Math.trunc(Scratch.Cast.toNumber(value)));
  if (!Number.isFinite(n) || n < 1) return 0;
  let steps = 0;
  while (n !== 1 && steps < 20000) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    steps += 1;
  }
  return n === 1 ? steps : -1;
}

export function digitsOf(value) {
  const n = Math.abs(Math.trunc(Scratch.Cast.toNumber(value)));
  if (!Number.isFinite(n)) return [];
  if (n === 0) return [0];
  const digits = [];
  let rest = n;
  while (rest > 0) {
    digits.unshift(rest % 10);
    rest = Math.floor(rest / 10);
  }
  return digits;
}

export function toBase(value, base) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const radix = Math.trunc(Scratch.Cast.toNumber(base));
  let n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || !Number.isInteger(radix)) return "";
  if (radix < 2 || radix > 36) return "";
  if (n === 0) return "0";
  const negative = n < 0;
  n = Math.abs(n);
  let text = "";
  while (n > 0) {
    text = alphabet[n % radix] + text;
    n = Math.floor(n / radix);
  }
  return negative ? "-" + text : text;
}

export function fromBase(text, base) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const radix = Math.trunc(Scratch.Cast.toNumber(base));
  const source = Scratch.Cast.toString(text).trim().toLowerCase();
  if (!Number.isInteger(radix) || radix < 2 || radix > 36) return 0;
  let body = source;
  let sign = 1;
  if (body.startsWith("-")) {
    sign = -1;
    body = body.slice(1);
  }
  if (body === "") return 0;
  let total = 0;
  for (const character of body) {
    const digit = alphabet.indexOf(character);
    if (digit < 0 || digit >= radix) return 0;
    total = total * radix + digit;
  }
  return sign * total;
}

export function toRoman(value) {
  const table = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let n = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(n) || n < 1 || n > 3999) return "";
  let text = "";
  for (const pair of table) {
    while (n >= pair[0]) {
      text += pair[1];
      n -= pair[0];
    }
  }
  return text.toUpperCase();
}

export function fromRoman(text) {
  const values = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  const source = Scratch.Cast.toString(text).toLowerCase();
  let total = 0;
  for (let i = 0; i < source.length; i++) {
    const current = values[source[i]];
    if (current === undefined) continue;
    const next = values[source[i + 1]];
    if (next !== undefined && next > current) total -= current;
    else total += current;
  }
  return total;
}

export function roundedTo(value, places) {
  const n = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(n)) return n;
  const digits = Math.trunc(Scratch.Cast.toNumber(places));
  if (!Number.isFinite(digits) || digits < 0 || digits > 15) return n;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export function sortedCopy(values) {
  return values.slice().sort((a, b) => a - b);
}

export function sortedValuesCopy(values) {
  return values.slice().sort((a, b) => {
    const left = Number(a);
    const right = Number(b);
    if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
    return String(a).localeCompare(String(b));
  });
}

export function sumOf(values) {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

export function meanOf(values) {
  if (values.length === 0) return 0;
  return this.sumOf(values) / values.length;
}

export function medianOf(values) {
  if (values.length === 0) return 0;
  const sorted = this.sortedCopy(values);
  const middle = sorted.length >> 1;
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function modesOf(values) {
  const counts = new Map();
  let best = 0;
  for (const value of values) {
    const count = (counts.get(value) || 0) + 1;
    counts.set(value, count);
    if (count > best) best = count;
  }
  if (best < 2) return [];
  const modes = [];
  for (const entry of counts) {
    if (entry[1] === best) modes.push(entry[0]);
  }
  return modes.sort((a, b) => a - b);
}

export function quantileOf(sortedValues, fraction) {
  const n = sortedValues.length;
  if (n === 0) return 0;
  const f = Math.min(Math.max(Scratch.Cast.toNumber(fraction), 0), 1);
  const position = f * (n - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  return (
    sortedValues[lower] +
    (sortedValues[upper] - sortedValues[lower]) * (position - lower)
  );
}

export function varianceOf(values, sample) {
  const n = values.length;
  if (n === 0) return 0;
  if (sample && n < 2) return 0;
  const mean = this.meanOf(values);
  let total = 0;
  for (const value of values) total += (value - mean) * (value - mean);
  return total / (sample ? n - 1 : n);
}

export function standardDeviationOf(values, sample) {
  return Math.sqrt(this.varianceOf(values, sample));
}

export function trimmedMeanOf(values, trimFraction) {
  const sorted = this.sortedCopy(values);
  const cut = Math.min(
    Math.round(sorted.length * this.clampNum(trimFraction, 0, 0.5)),
    Math.floor(sorted.length / 2),
  );
  const kept = sorted.slice(cut, sorted.length - cut);
  return this.meanOf(kept);
}

export function medianAbsoluteDeviationOf(values) {
  if (values.length === 0) return 0;
  const median = this.medianOf(values);
  const deviations = values.map((value) => Math.abs(value - median));
  return this.medianOf(deviations);
}

export function weightedMeanOf(values, weights) {
  const n = Math.min(values.length, weights.length);
  if (n === 0) return 0;
  let weightTotal = 0;
  let valueTotal = 0;
  for (let i = 0; i < n; i++) {
    weightTotal += weights[i];
    valueTotal += values[i] * weights[i];
  }
  if (weightTotal === 0) return 0;
  return valueTotal / weightTotal;
}

export function regressionOf(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: 0, r: 0, r2: 0 };
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumXX += xs[i] * xs[i];
    sumYY += ys[i] * ys[i];
  }
  const denominatorX = n * sumXX - sumX * sumX;
  const denominatorY = n * sumYY - sumY * sumY;
  const numerator = n * sumXY - sumX * sumY;
  const slope = denominatorX === 0 ? 0 : numerator / denominatorX;
  const intercept = (sumY - slope * sumX) / n;
  const span = Math.sqrt(denominatorX * denominatorY);
  const r = span === 0 ? 0 : numerator / span;
  return { slope: slope, intercept: intercept, r: r, r2: r * r };
}

export function lanczosSeries(shifted) {
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let series = coefficients[0];
  for (let i = 1; i < coefficients.length; i++) {
    series += coefficients[i] / (shifted + i);
  }
  return series;
}

export function gammaOf(value) {
  const x = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(x)) return x;
  if (x === 0) return Infinity;
  if (x < 0.5) {
    return Math.PI / (Math.sin(Math.PI * x) * this.gammaOf(1 - x));
  }
  const shifted = x - 1;
  const t = shifted + 7.5;
  return (
    Math.sqrt(2 * Math.PI) *
    Math.pow(t, shifted + 0.5) *
    Math.exp(-t) *
    this.lanczosSeries(shifted)
  );
}

export function logGammaOf(value) {
  const x = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(x) || x <= 0) return NaN;
  if (x < 0.5) {
    return (
      Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) -
      this.logGammaOf(1 - x)
    );
  }
  const shifted = x - 1;
  const t = shifted + 7.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (shifted + 0.5) * Math.log(t) -
    t +
    Math.log(this.lanczosSeries(shifted))
  );
}

export function erfOf(value) {
  const x = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(x)) return x;
  if (x === 0) return 0;
  const u = x * x;
  const half = 0.5;
  let result;
  if (u < half + 1) {
    let parameter = half;
    let sum = 1 / half;
    let term = sum;
    for (let n = 1; n < 500; n++) {
      parameter += 1;
      term *= u / parameter;
      sum += term;
      if (Math.abs(term) <= Math.abs(sum) * 1e-17) break;
    }
    result = (sum * Math.exp(-u) * Math.sqrt(u)) / Math.sqrt(Math.PI);
  } else {
    const tiny = 1e-300;
    let b = u + 1 - half;
    let c = 1 / tiny;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - half);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < tiny) d = tiny;
      c = b + an / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) <= 1e-17) break;
    }
    result = 1 - (Math.exp(-u) * h * Math.sqrt(u)) / Math.sqrt(Math.PI);
  }
  return x < 0 ? -result : result;
}

export function normalCdfOf(value, mean, deviation) {
  const m = Scratch.Cast.toNumber(mean);
  const sd = Scratch.Cast.toNumber(deviation);
  const x = Scratch.Cast.toNumber(value);
  if (!(sd > 0)) return 0;
  return 0.5 * (1 + this.erfOf((x - m) / (sd * Math.SQRT2)));
}

export function normalPdfOf(value, mean, deviation) {
  const m = Scratch.Cast.toNumber(mean);
  const sd = Scratch.Cast.toNumber(deviation);
  const z = (Scratch.Cast.toNumber(value) - m) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

export function randomNormalSample(mean, deviation) {
  const m = Scratch.Cast.toNumber(mean);
  const sd = Scratch.Cast.toNumber(deviation);
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return m + sd * z;
}

export function randomExponentialSample(rate) {
  const lambda = Scratch.Cast.toNumber(rate);
  if (!(lambda > 0)) return 0;
  let u = 0;
  while (u === 0) u = Math.random();
  return -Math.log(u) / lambda;
}

export function randomTriangularSample(low, high, mode) {
  let a = Scratch.Cast.toNumber(low);
  let b = Scratch.Cast.toNumber(high);
  if (a > b) {
    const swap = a;
    a = b;
    b = swap;
  }
  if (a === b) return a;
  let c = Scratch.Cast.toNumber(mode);
  if (!Number.isFinite(c) || c < a || c > b) c = (a + b) / 2;
  const u = Math.random();
  if (u * (b - a) <= c - a) return a + Math.sqrt(u * (b - a) * (c - a));
  return b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

export function weightedPickOf(values, weights) {
  if (values.length === 0) return "";
  const n = Math.min(values.length, weights.length);
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.max(0, weights[i]);
  if (!(total > 0)) return values[Math.floor(Math.random() * values.length)];
  let remaining = Math.random() * total;
  for (let i = 0; i < n; i++) {
    remaining -= Math.max(0, weights[i]);
    if (remaining <= 0) return values[i];
  }
  return values[n - 1];
}

export function polygonAreaOf(values) {
  const points = Math.floor(values.length / 2);
  if (points < 3) return 0;
  let total = 0;
  for (let i = 0; i < points; i++) {
    const next = (i + 1) % points;
    total +=
      values[i * 2] * values[next * 2 + 1] -
      values[next * 2] * values[i * 2 + 1];
  }
  return Math.abs(total) / 2;
}

export function polygonPerimeterOf(values) {
  const points = Math.floor(values.length / 2);
  if (points < 2) return 0;
  let total = 0;
  for (let i = 0; i < points; i++) {
    const next = (i + 1) % points;
    total += Math.hypot(
      values[next * 2] - values[i * 2],
      values[next * 2 + 1] - values[i * 2 + 1],
    );
  }
  return total;
}

export function polynomialValueOf(coefficients, x) {
  const at = Scratch.Cast.toNumber(x);
  let total = 0;
  for (const coefficient of coefficients) total = total * at + coefficient;
  return total;
}

export function polynomialDerivativeOf(coefficients) {
  const degree = coefficients.length - 1;
  const derivative = [];
  for (let i = 0; i < coefficients.length - 1; i++) {
    derivative.push(coefficients[i] * (degree - i));
  }
  return derivative;
}

export function polynomialIntegralOf(coefficients, from, to) {
  const a = Scratch.Cast.toNumber(from);
  const b = Scratch.Cast.toNumber(to);
  const degree = coefficients.length - 1;
  let total = 0;
  for (let i = 0; i < coefficients.length; i++) {
    const power = degree - i + 1;
    total +=
      (coefficients[i] / power) * (Math.pow(b, power) - Math.pow(a, power));
  }
  return total;
}

/*
 * List access.
 *
 * Extensions cannot take a list as an argument, so list arguments are dropdowns
 * fed by calcListMenuItems and resolved back to the list object here. The
 * dropdown carries the list id, which survives renaming and beats the name when
 * a target has both a local and a global list of the same name.
 */

export function calcListMenuItems(editingTargetId) {
  const items = [];
  const seen = new Set();
  const runtime = Scratch.vm ? Scratch.vm.runtime : null;
  const targets = [];
  if (runtime) {
    if (editingTargetId && typeof runtime.getTargetById === "function") {
      targets.push(runtime.getTargetById(editingTargetId));
    }
    if (typeof runtime.getEditingTarget === "function") {
      targets.push(runtime.getEditingTarget());
    }
    if (typeof runtime.getTargetForStage === "function") {
      targets.push(runtime.getTargetForStage());
    }
  }
  for (const target of targets) {
    if (!target || !target.variables) continue;
    for (const id of Object.keys(target.variables)) {
      const variable = target.variables[id];
      if (!variable || variable.type !== "list") continue;
      if (seen.has(variable.name)) continue;
      seen.add(variable.name);
      items.push({ text: variable.name, value: id });
    }
  }
  if (items.length === 0) {
    const blockly = globalThis.Blockly;
    if (blockly && typeof blockly.getMainWorkspace === "function") {
      const models = blockly
        .getMainWorkspace()
        .getVariableMap()
        .getVariablesOfType("list");
      for (const model of models)
        items.push({ text: model.name, value: model.name });
    }
  }
  if (items.length === 0) items.push({ text: "(no lists yet)", value: "" });
  return items;
}

export function lookupList(reference, util) {
  const key = Scratch.Cast.toString(reference === undefined ? "" : reference);
  if (key === "") return null;
  const targets = [];
  if (util && util.target) targets.push(util.target);
  if (
    util &&
    util.runtime &&
    typeof util.runtime.getTargetForStage === "function"
  ) {
    targets.push(util.runtime.getTargetForStage());
  }
  for (const target of targets) {
    if (!target) continue;
    if (typeof target.lookupVariableById === "function") {
      const byId = target.lookupVariableById(key);
      if (byId && byId.type === "list") return byId;
    }
    if (typeof target.lookupVariableByNameAndType === "function") {
      const byName = target.lookupVariableByNameAndType(key, "list");
      if (byName && byName.type === "list") return byName;
    }
    const variables = target.variables;
    if (variables) {
      for (const id of Object.keys(variables)) {
        const variable = variables[id];
        if (!variable || variable.type !== "list") continue;
        if (id === key || variable.name === key) return variable;
      }
    }
  }
  return null;
}

export function listNumbersOf(reference, util) {
  const list = this.lookupList(reference, util);
  if (!list || !Array.isArray(list.value)) return null;
  return list.value.map((item) => Scratch.Cast.toNumber(item));
}

export function listValuesOf(reference, util) {
  const list = this.lookupList(reference, util);
  if (!list || !Array.isArray(list.value)) return null;
  return list.value.slice();
}

export function joinNumbers(values) {
  return values.join(", ");
}
export function inverseErrorFunctionOf(value) {
  const target = Scratch.Cast.toNumber(value);
  if (!Number.isFinite(target) || target <= -1 || target >= 1) return NaN;
  let estimate = this.clampNum(target, -0.9999999, 0.9999999);
  for (let i = 0; i < 100; i++) {
    const slope = (2 / Math.sqrt(Math.PI)) * Math.exp(-estimate * estimate);
    if (slope === 0) break;
    const next = estimate - (this.erfOf(estimate) - target) / slope;
    if (!Number.isFinite(next)) break;
    estimate = next;
  }
  return estimate;
}

export function regularizedIncompleteGamma(value, shape) {
  const x = Scratch.Cast.toNumber(value);
  const a = Scratch.Cast.toNumber(shape);
  if (!Number.isFinite(x) || !Number.isFinite(a) || a <= 0) return NaN;
  if (x <= 0) return 0;
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    let offset = a;
    for (let i = 0; i < 2000; i++) {
      offset += 1;
      term *= x / offset;
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-17) break;
    }
    return Math.min(
      1,
      sum * Math.exp(a * Math.log(x) - x - this.logGammaOf(a)),
    );
  }
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 2000; i++) {
    const coefficient = -i * (i - a);
    b += 2;
    d = coefficient * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + coefficient / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-17) break;
  }
  return Math.max(
    0,
    1 - Math.exp(a * Math.log(x) - x - this.logGammaOf(a)) * h,
  );
}

export function betaContinuedFraction(a, b, x) {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 2000; m++) {
    const doubled = 2 * m;
    let coefficient = (m * (b - m) * x) / ((a + doubled - 1) * (a + doubled));
    d = 1 + coefficient * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + coefficient / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    coefficient =
      (-(a + m) * (a + b + m) * x) / ((a + doubled) * (a + doubled + 1));
    d = 1 + coefficient * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + coefficient / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-17) break;
  }
  return h;
}

export function regularizedIncompleteBeta(value, a, b) {
  const x = Scratch.Cast.toNumber(value);
  const alpha = Scratch.Cast.toNumber(a);
  const beta = Scratch.Cast.toNumber(b);
  if (!Number.isFinite(x) || !Number.isFinite(alpha) || !Number.isFinite(beta))
    return NaN;
  if (alpha <= 0 || beta <= 0) return NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    this.logGammaOf(alpha + beta) -
      this.logGammaOf(alpha) -
      this.logGammaOf(beta) +
      alpha * Math.log(x) +
      beta * Math.log(1 - x),
  );
  if (x < (alpha + 1) / (alpha + beta + 2)) {
    return (front * this.betaContinuedFraction(alpha, beta, x)) / alpha;
  }
  return 1 - (front * this.betaContinuedFraction(beta, alpha, 1 - x)) / beta;
}

export function inverseRegularizedIncompleteBeta(probability, a, b) {
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(p)) return NaN;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 120; i++) {
    const middle = (low + high) / 2;
    if (this.regularizedIncompleteBeta(middle, a, b) < p) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

export function inverseRegularizedIncompleteGamma(probability, shape) {
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(p) || p <= 0) return 0;
  if (p >= 1) return Infinity;
  let low = 0;
  let high = Math.max(2 * shape + 1, 4);
  while (this.regularizedIncompleteGamma(high, shape) < p && high < 1e15)
    high *= 2;
  for (let i = 0; i < 200; i++) {
    const middle = (low + high) / 2;
    if (this.regularizedIncompleteGamma(middle, shape) < p) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

export function normalQuantileOf(probability, mean, deviation) {
  const p = Scratch.Cast.toNumber(probability);
  const sd = Scratch.Cast.toNumber(deviation);
  const centre = Scratch.Cast.toNumber(mean);
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return NaN;
  if (!(sd > 0) || !Number.isFinite(centre)) return NaN;
  return centre + sd * Math.SQRT2 * this.inverseErrorFunctionOf(2 * p - 1);
}

export function logNormalPdfOf(value, mean, deviation) {
  const x = Scratch.Cast.toNumber(value);
  const mu = Scratch.Cast.toNumber(mean);
  const sigma = Scratch.Cast.toNumber(deviation);
  if (!(x > 0) || !(sigma > 0)) return 0;
  const z = (Math.log(x) - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));
}

export function logNormalCdfOf(value, mean, deviation) {
  const x = Scratch.Cast.toNumber(value);
  const mu = Scratch.Cast.toNumber(mean);
  const sigma = Scratch.Cast.toNumber(deviation);
  if (!(sigma > 0)) return NaN;
  if (x <= 0) return 0;
  return 0.5 * (1 + this.erfOf((Math.log(x) - mu) / (sigma * Math.SQRT2)));
}

export function gammaPdfOf(value, shape, scale) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(shape);
  const theta = Scratch.Cast.toNumber(scale);
  if (!(x >= 0) || !(k > 0) || !(theta > 0)) return 0;
  if (x === 0) return k === 1 ? 1 / theta : k < 1 ? Infinity : 0;
  return Math.exp(
    (k - 1) * Math.log(x) -
      x / theta -
      k * Math.log(theta) -
      this.logGammaOf(k),
  );
}

export function gammaCdfOf(value, shape, scale) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(shape);
  const theta = Scratch.Cast.toNumber(scale);
  if (!(k > 0) || !(theta > 0)) return NaN;
  if (x <= 0) return 0;
  return this.regularizedIncompleteGamma(x / theta, k);
}

export function gammaQuantileOf(probability, shape, scale) {
  const p = Scratch.Cast.toNumber(probability);
  const theta = Scratch.Cast.toNumber(scale);
  if (!(p >= 0 && p <= 1) || !(theta > 0)) return NaN;
  if (p === 0) return 0;
  if (p === 1) return Infinity;
  return this.inverseRegularizedIncompleteGamma(p, shape) * theta;
}

export function betaPdfOf(value, a, b) {
  const x = Scratch.Cast.toNumber(value);
  const alpha = Scratch.Cast.toNumber(a);
  const beta = Scratch.Cast.toNumber(b);
  if (!(alpha > 0) || !(beta > 0)) return NaN;
  if (x < 0 || x > 1) return 0;
  if (x === 0) return alpha < 1 ? Infinity : alpha === 1 ? beta : 0;
  if (x === 1) return beta < 1 ? Infinity : beta === 1 ? alpha : 0;
  return Math.exp(
    (alpha - 1) * Math.log(x) +
      (beta - 1) * Math.log(1 - x) -
      this.logGammaOf(alpha) -
      this.logGammaOf(beta) +
      this.logGammaOf(alpha + beta),
  );
}

export function betaCdfOf(value, a, b) {
  const x = Scratch.Cast.toNumber(value);
  if (!(x === x)) return NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return this.regularizedIncompleteBeta(x, a, b);
}

export function betaQuantileOf(probability, a, b) {
  const p = Scratch.Cast.toNumber(probability);
  if (!(p >= 0 && p <= 1)) return NaN;
  return this.inverseRegularizedIncompleteBeta(p, a, b);
}

export function exponentialPdfOf(value, rate) {
  const x = Scratch.Cast.toNumber(value);
  const lambda = Scratch.Cast.toNumber(rate);
  if (!(lambda > 0)) return 0;
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function exponentialCdfOf(value, rate) {
  const x = Scratch.Cast.toNumber(value);
  const lambda = Scratch.Cast.toNumber(rate);
  if (!(lambda > 0)) return NaN;
  if (x <= 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

export function exponentialQuantileOf(probability, rate) {
  const p = Scratch.Cast.toNumber(probability);
  const lambda = Scratch.Cast.toNumber(rate);
  if (!(p >= 0 && p < 1) || !(lambda > 0)) return NaN;
  return -Math.log(1 - p) / lambda;
}

export function uniformPdfOf(value, low, high) {
  const x = Scratch.Cast.toNumber(value);
  const a = Scratch.Cast.toNumber(low);
  const b = Scratch.Cast.toNumber(high);
  if (b <= a) return 0;
  return x < a || x > b ? 0 : 1 / (b - a);
}

export function uniformCdfOf(value, low, high) {
  const x = Scratch.Cast.toNumber(value);
  const a = Scratch.Cast.toNumber(low);
  const b = Scratch.Cast.toNumber(high);
  if (b <= a) return NaN;
  if (x <= a) return 0;
  if (x >= b) return 1;
  return (x - a) / (b - a);
}

export function weibullPdfOf(value, shape, scale) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(shape);
  const lambda = Scratch.Cast.toNumber(scale);
  if (!(k > 0) || !(lambda > 0)) return 0;
  if (x < 0) return 0;
  if (x === 0) return k === 1 ? 1 / lambda : k < 1 ? Infinity : 0;
  const ratio = x / lambda;
  return (k / lambda) * Math.pow(ratio, k - 1) * Math.exp(-Math.pow(ratio, k));
}

export function weibullCdfOf(value, shape, scale) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(shape);
  const lambda = Scratch.Cast.toNumber(scale);
  if (!(k > 0) || !(lambda > 0)) return NaN;
  if (x <= 0) return 0;
  return 1 - Math.exp(-Math.pow(x / lambda, k));
}

export function cauchyPdfOf(value, location, scale) {
  const x = Scratch.Cast.toNumber(value);
  const centre = Scratch.Cast.toNumber(location);
  const gamma = Scratch.Cast.toNumber(scale);
  if (!(gamma > 0)) return 0;
  const offset = x - centre;
  return gamma / (Math.PI * (offset * offset + gamma * gamma));
}

export function cauchyCdfOf(value, location, scale) {
  const x = Scratch.Cast.toNumber(value);
  const centre = Scratch.Cast.toNumber(location);
  const gamma = Scratch.Cast.toNumber(scale);
  if (!(gamma > 0)) return NaN;
  return 0.5 + Math.atan((x - centre) / gamma) / Math.PI;
}

export function cauchyQuantileOf(probability, location, scale) {
  const p = Scratch.Cast.toNumber(probability);
  const gamma = Scratch.Cast.toNumber(scale);
  if (!(p > 0 && p < 1) || !(gamma > 0)) return NaN;
  return (
    Scratch.Cast.toNumber(location) + gamma * Math.tan(Math.PI * (p - 0.5))
  );
}

export function laplacePdfOf(value, location, scale) {
  const x = Scratch.Cast.toNumber(value);
  const centre = Scratch.Cast.toNumber(location);
  const b = Scratch.Cast.toNumber(scale);
  if (!(b > 0)) return 0;
  return Math.exp(-Math.abs(x - centre) / b) / (2 * b);
}

export function laplaceCdfOf(value, location, scale) {
  const x = Scratch.Cast.toNumber(value);
  const centre = Scratch.Cast.toNumber(location);
  const b = Scratch.Cast.toNumber(scale);
  if (!(b > 0)) return NaN;
  if (x <= centre) return 0.5 * Math.exp((x - centre) / b);
  return 1 - 0.5 * Math.exp(-(x - centre) / b);
}

export function laplaceQuantileOf(probability, location, scale) {
  const p = Scratch.Cast.toNumber(probability);
  const b = Scratch.Cast.toNumber(scale);
  if (!(p >= 0 && p <= 1) || !(b > 0)) return NaN;
  const centre = Scratch.Cast.toNumber(location);
  if (p < 0.5) return centre + b * Math.log(2 * p);
  if (p > 0.5) return centre - b * Math.log(2 * (1 - p));
  return centre;
}

export function studentTPdfOf(value, degreesOfFreedom) {
  const t = Scratch.Cast.toNumber(value);
  const nu = Scratch.Cast.toNumber(degreesOfFreedom);
  if (!(nu > 0)) return 0;
  return Math.exp(
    this.logGammaOf((nu + 1) / 2) -
      this.logGammaOf(nu / 2) -
      0.5 * Math.log(nu * Math.PI) -
      ((nu + 1) / 2) * Math.log(1 + (t * t) / nu),
  );
}

export function studentTCdfOf(value, degreesOfFreedom) {
  const t = Scratch.Cast.toNumber(value);
  const nu = Scratch.Cast.toNumber(degreesOfFreedom);
  if (!(nu > 0)) return NaN;
  if (t === 0) return 0.5;
  const tail =
    0.5 * this.regularizedIncompleteBeta(nu / (nu + t * t), nu / 2, 0.5);
  return t > 0 ? 1 - tail : tail;
}

export function studentTQuantileOf(probability, degreesOfFreedom) {
  const p = Scratch.Cast.toNumber(probability);
  if (!(p >= 0 && p <= 1)) return NaN;
  if (p === 0.5) return 0;
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  let low = -1000;
  let high = 1000;
  for (let i = 0; i < 200; i++) {
    const middle = (low + high) / 2;
    if (this.studentTCdfOf(middle, degreesOfFreedom) < p) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

export function chiSquarePdfOf(value, degreesOfFreedom) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(degreesOfFreedom);
  if (!(k > 0)) return 0;
  if (x < 0) return 0;
  if (x === 0) return k === 2 ? 0.5 : k < 2 ? Infinity : 0;
  return Math.exp(
    (k / 2 - 1) * Math.log(x) -
      x / 2 -
      (k / 2) * Math.LN2 -
      this.logGammaOf(k / 2),
  );
}

export function chiSquareCdfOf(value, degreesOfFreedom) {
  const x = Scratch.Cast.toNumber(value);
  const k = Scratch.Cast.toNumber(degreesOfFreedom);
  if (!(k > 0)) return NaN;
  if (x <= 0) return 0;
  return this.regularizedIncompleteGamma(x / 2, k / 2);
}

export function fDistributionCdfOf(
  value,
  numeratorDegrees,
  denominatorDegrees,
) {
  const x = Scratch.Cast.toNumber(value);
  const d1 = Scratch.Cast.toNumber(numeratorDegrees);
  const d2 = Scratch.Cast.toNumber(denominatorDegrees);
  if (!(d1 > 0) || !(d2 > 0)) return NaN;
  if (x <= 0) return 0;
  return this.regularizedIncompleteBeta(
    (d1 * x) / (d1 * x + d2),
    d1 / 2,
    d2 / 2,
  );
}

export function poissonPmfOf(value, rate) {
  const k = Math.trunc(Scratch.Cast.toNumber(value));
  const lambda = Scratch.Cast.toNumber(rate);
  if (!Number.isFinite(lambda) || lambda < 0) return NaN;
  if (!Number.isFinite(k) || k < 0) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda + k * Math.log(lambda) - this.logGammaOf(k + 1));
}

export function poissonCdfOf(value, rate) {
  const k = Math.floor(Scratch.Cast.toNumber(value));
  const lambda = Scratch.Cast.toNumber(rate);
  if (!Number.isFinite(lambda) || lambda < 0) return NaN;
  if (!Number.isFinite(k)) return NaN;
  if (k < 0) return 0;
  return Math.max(
    0,
    Math.min(1, 1 - this.regularizedIncompleteGamma(lambda, k + 1)),
  );
}

export function binomialPmfOf(value, trials, probability) {
  const k = Math.trunc(Scratch.Cast.toNumber(value));
  const n = Math.trunc(Scratch.Cast.toNumber(trials));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (!Number.isFinite(p) || p < 0 || p > 1) return NaN;
  if (!Number.isFinite(k) || k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(
    this.logGammaOf(n + 1) -
      this.logGammaOf(k + 1) -
      this.logGammaOf(n - k + 1) +
      k * Math.log(p) +
      (n - k) * Math.log(1 - p),
  );
}

export function binomialCdfOf(value, trials, probability) {
  const k = Math.floor(Scratch.Cast.toNumber(value));
  const n = Math.trunc(Scratch.Cast.toNumber(trials));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (!Number.isFinite(p) || p < 0 || p > 1) return NaN;
  if (!Number.isFinite(k)) return NaN;
  if (k < 0) return 0;
  if (k >= n) return 1;
  return this.regularizedIncompleteBeta(1 - p, n - k, k + 1);
}

export function geometricPmfOf(value, probability) {
  const k = Math.trunc(Scratch.Cast.toNumber(value));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(p) || p <= 0 || p > 1) return NaN;
  if (!Number.isFinite(k) || k < 1) return 0;
  return p * Math.pow(1 - p, k - 1);
}

export function geometricCdfOf(value, probability) {
  const k = Math.floor(Scratch.Cast.toNumber(value));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(p) || p <= 0 || p > 1) return NaN;
  if (!Number.isFinite(k)) return NaN;
  if (k < 1) return 0;
  return 1 - Math.pow(1 - p, k);
}

export function negativeBinomialPmfOf(value, successes, probability) {
  const k = Math.trunc(Scratch.Cast.toNumber(value));
  const r = Math.trunc(Scratch.Cast.toNumber(successes));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(r) || r < 1) return NaN;
  if (!Number.isFinite(p) || p <= 0 || p > 1) return NaN;
  if (!Number.isFinite(k) || k < r) return 0;
  if (p === 1) return k === r ? 1 : 0;
  return Math.exp(
    this.logGammaOf(k) -
      this.logGammaOf(r) -
      this.logGammaOf(k - r + 1) +
      r * Math.log(p) +
      (k - r) * Math.log(1 - p),
  );
}

export function negativeBinomialCdfOf(value, successes, probability) {
  const k = Math.floor(Scratch.Cast.toNumber(value));
  const r = Math.trunc(Scratch.Cast.toNumber(successes));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(r) || r < 1) return NaN;
  if (!Number.isFinite(p) || p <= 0 || p > 1) return NaN;
  if (!Number.isFinite(k)) return NaN;
  if (k < r) return 0;
  return this.regularizedIncompleteBeta(p, r, k - r + 1);
}

export function hypergeometricPmfOf(value, drawn, successes, population) {
  const k = Math.trunc(Scratch.Cast.toNumber(value));
  const n = Math.trunc(Scratch.Cast.toNumber(drawn));
  const marked = Math.trunc(Scratch.Cast.toNumber(successes));
  const total = Math.trunc(Scratch.Cast.toNumber(population));
  if (!Number.isFinite(total) || total < 1) return NaN;
  if (!Number.isFinite(n) || n < 0 || !Number.isFinite(marked) || marked < 0)
    return NaN;
  if (marked > total || n > total) return 0;
  if (
    !Number.isFinite(k) ||
    k < 0 ||
    k > n ||
    k > marked ||
    n - k > total - marked
  )
    return 0;
  return Math.exp(
    this.logGammaOf(marked + 1) -
      this.logGammaOf(k + 1) -
      this.logGammaOf(marked - k + 1) +
      this.logGammaOf(total - marked + 1) -
      this.logGammaOf(n - k + 1) -
      this.logGammaOf(total - marked - n + k + 1) -
      this.logGammaOf(total + 1) +
      this.logGammaOf(n + 1) +
      this.logGammaOf(total - n + 1),
  );
}

export function hypergeometricCdfOf(value, drawn, successes, population) {
  const k = Math.floor(Scratch.Cast.toNumber(value));
  const n = Math.trunc(Scratch.Cast.toNumber(drawn));
  const marked = Math.trunc(Scratch.Cast.toNumber(successes));
  const total = Math.trunc(Scratch.Cast.toNumber(population));
  if (!Number.isFinite(total) || total < 1) return NaN;
  if (!Number.isFinite(n) || n < 0 || !Number.isFinite(marked) || marked < 0)
    return NaN;
  if (!Number.isFinite(k)) return NaN;
  if (k < 0) return 0;
  const limit = Math.min(marked, n);
  if (k >= limit) return 1;
  const lowerTerms = k + 1;
  const upperTerms = limit - k;
  if (Math.min(lowerTerms, upperTerms) > 1000000) {
    return this.binomialCdfOf(k, n, marked / total);
  }
  if (upperTerms <= lowerTerms) {
    let upper = 0;
    for (let i = limit; i > k; i--)
      upper += this.hypergeometricPmfOf(i, n, marked, total);
    return Math.min(1, Math.max(0, 1 - upper));
  }
  let lower = 0;
  for (let i = 0; i <= k; i++)
    lower += this.hypergeometricPmfOf(i, n, marked, total);
  if (!Number.isFinite(lower)) return NaN;
  return Math.min(1, Math.max(0, lower));
}

export function entropyOfBits(values) {
  const numbers = values.filter((value) => value > 0);
  const total = numbers.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) return 0;
  let entropy = 0;
  for (const value of numbers) {
    const share = value / total;
    entropy -= share * Math.log2(share);
  }
  return entropy;
}

export function randomUniformSample(low, high) {
  const a = Scratch.Cast.toNumber(low);
  const b = Scratch.Cast.toNumber(high);
  return a + Math.random() * (b - a);
}

export function randomUniformIntegerSample(low, high) {
  const a = Math.round(Scratch.Cast.toNumber(low));
  const b = Math.round(Scratch.Cast.toNumber(high));
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  if (b < a) return a;
  return a + Math.floor(Math.random() * (b - a + 1));
}

export function randomBernoulliSample(probability) {
  const p = Scratch.Cast.toNumber(probability);
  if (!(p >= 0 && p <= 1)) return 0;
  return Math.random() < p ? 1 : 0;
}

export function randomBinomialSample(trials, probability) {
  const n = Math.trunc(Scratch.Cast.toNumber(trials));
  const p = Scratch.Cast.toNumber(probability);
  if (!Number.isFinite(n) || n < 0 || n > 1000000) return 0;
  if (!(p >= 0 && p <= 1)) return 0;
  if (n === 0 || p === 0) return 0;
  if (p === 1) return n;
  if (n * p < 30 || n * (1 - p) < 30) {
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) successes += 1;
    }
    return successes;
  }
  const value = Math.round(
    n * p + Math.sqrt(n * p * (1 - p)) * this.randomNormalSample(0, 1),
  );
  return Math.min(n, Math.max(0, value));
}

export function randomPoissonSample(rate) {
  const lambda = Scratch.Cast.toNumber(rate);
  if (!(lambda > 0) || !Number.isFinite(lambda) || lambda > 1e7) return 0;
  if (lambda < 30) {
    const limit = Math.exp(-lambda);
    let product = 1;
    let count = 0;
    do {
      count += 1;
      product *= Math.random();
    } while (product > limit && count < 1000000);
    return count - 1;
  }
  return Math.max(
    0,
    Math.round(lambda + Math.sqrt(lambda) * this.randomNormalSample(0, 1)),
  );
}

export function randomGeometricSample(probability) {
  const p = Scratch.Cast.toNumber(probability);
  if (!(p > 0 && p <= 1)) return 0;
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.floor(Math.log(u) / Math.log(1 - p)) + 1;
}

export function randomNegativeBinomialSample(successes, probability) {
  const r = Math.trunc(Scratch.Cast.toNumber(successes));
  if (!(r >= 1) || r > 100000) return 0;
  let total = 0;
  for (let i = 0; i < r; i++) total += this.randomGeometricSample(probability);
  return total;
}

export function randomHypergeometricSample(drawn, successes, population) {
  const n = Math.trunc(Scratch.Cast.toNumber(drawn));
  const marked = Math.trunc(Scratch.Cast.toNumber(successes));
  const total = Math.trunc(Scratch.Cast.toNumber(population));
  if (!Number.isFinite(total) || total < 1) return 0;
  if (!Number.isFinite(marked) || marked < 0) return 0;
  const size = Math.min(
    Math.max(Math.trunc(Number.isFinite(n) ? n : 0), 0),
    total,
  );
  let left = total;
  let wins = marked;
  let hits = 0;
  for (let i = 0; i < size; i++) {
    if (Math.random() * left < wins) {
      hits += 1;
      wins -= 1;
    }
    left -= 1;
  }
  return hits;
}

export function randomLogNormalSample(mean, deviation) {
  const mu = Scratch.Cast.toNumber(mean);
  const sigma = Scratch.Cast.toNumber(deviation);
  if (!(sigma >= 0)) return Math.exp(mu);
  return Math.exp(mu + sigma * this.randomNormalSample(0, 1));
}

export function randomStandardNormalSample() {
  return this.randomNormalSample(0, 1);
}

export function randomGammaSample(shape, scale) {
  const k = Scratch.Cast.toNumber(shape);
  const theta = Scratch.Cast.toNumber(scale);
  if (!(k > 0) || !(theta > 0)) return 0;
  if (k < 1)
    return (
      this.randomGammaSample(1 + k, theta) * Math.pow(Math.random(), 1 / k)
    );
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (let attempt = 0; attempt < 10000; attempt++) {
    const normal = this.randomNormalSample(0, 1);
    const factor = 1 + c * normal;
    if (factor <= 0) continue;
    const x = d * factor * factor * factor;
    let u = Math.random();
    if (u === 0) u = Number.MIN_VALUE;
    if (Math.log(u) < 0.5 * x + d * (1 - factor)) return x * theta;
  }
  return k * theta;
}

export function randomBetaSample(a, b) {
  const alpha = Scratch.Cast.toNumber(a);
  const beta = Scratch.Cast.toNumber(b);
  if (!(alpha > 0) || !(beta > 0)) return 0;
  const x = this.randomGammaSample(alpha, 1);
  const y = this.randomGammaSample(beta, 1);
  if (x + y === 0) return 0;
  return x / (x + y);
}

export function randomWeibullSample(shape, scale) {
  const k = Scratch.Cast.toNumber(shape);
  const lambda = Scratch.Cast.toNumber(scale);
  if (!(k > 0) || !(lambda > 0)) return 0;
  let u = 0;
  while (u === 0) u = Math.random();
  return lambda * Math.pow(-Math.log(u), 1 / k);
}

export function randomCauchySample(location, scale) {
  const centre = Scratch.Cast.toNumber(location);
  const gamma = Scratch.Cast.toNumber(scale);
  if (!(gamma > 0)) return centre;
  return centre + gamma * Math.tan(Math.PI * (Math.random() - 0.5));
}

export function randomLaplaceSample(location, scale) {
  const centre = Scratch.Cast.toNumber(location);
  const b = Scratch.Cast.toNumber(scale);
  const u = Math.random() - 0.5;
  return u < 0
    ? centre + b * Math.log(1 + 2 * u)
    : centre - b * Math.log(1 - 2 * u);
}

export function randomChiSquareSample(degreesOfFreedom) {
  const k = Math.trunc(Scratch.Cast.toNumber(degreesOfFreedom));
  if (!(k >= 1) || k > 10000) return 0;
  return this.randomGammaSample(k / 2, 2);
}

export function randomStudentTSample(degreesOfFreedom) {
  const nu = Math.trunc(Scratch.Cast.toNumber(degreesOfFreedom));
  if (!(nu >= 1) || nu > 10000) return 0;
  return (
    this.randomNormalSample(0, 1) /
    Math.sqrt(this.randomChiSquareSample(nu) / nu)
  );
}

export function shuffledValues(values) {
  const copy = values.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

export function sampledWithoutReplacement(values, count) {
  const n = Math.trunc(Scratch.Cast.toNumber(count));
  if (!(n > 0)) return [];
  return this.shuffledValues(values).slice(0, Math.min(n, values.length));
}

export function arithmeticSequenceOf(count, first, difference) {
  const terms = Math.trunc(Scratch.Cast.toNumber(count));
  const start = Scratch.Cast.toNumber(first);
  const step = Scratch.Cast.toNumber(difference);
  const result = [];
  if (!(terms > 0) || !Number.isFinite(start) || !Number.isFinite(step))
    return result;
  for (let i = 0; i < terms; i++) result.push(start + step * i);
  return result;
}

export function geometricSequenceOf(count, first, ratio) {
  const terms = Math.trunc(Scratch.Cast.toNumber(count));
  const start = Scratch.Cast.toNumber(first);
  const factor = Scratch.Cast.toNumber(ratio);
  const result = [];
  if (!(terms > 0) || !Number.isFinite(start) || !Number.isFinite(factor))
    return result;
  let current = start;
  for (let i = 0; i < terms; i++) {
    result.push(current);
    current *= factor;
    if (!Number.isFinite(current)) break;
  }
  return result;
}

export function fibonacciSequenceOf(count) {
  const terms = Math.trunc(Scratch.Cast.toNumber(count));
  const result = [];
  if (!(terms > 0)) return result;
  let previous = 0;
  let current = 1;
  for (let i = 0; i < terms; i++) {
    result.push(previous);
    const next = previous + current;
    previous = current;
    current = next;
    if (!Number.isFinite(current)) break;
  }
  return result;
}

export function differencesOf(values) {
  const result = [];
  for (let i = 1; i < values.length; i++)
    result.push(values[i] - values[i - 1]);
  return result;
}

export function secondDifferencesOf(values) {
  return this.differencesOf(this.differencesOf(values));
}

export function runningProductOf(values) {
  const result = [];
  let total = 1;
  for (const value of values) {
    total *= value;
    result.push(total);
    if (!Number.isFinite(total)) break;
  }
  return result;
}

export function alternatingSumOf(values) {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += i % 2 === 0 ? values[i] : -values[i];
  }
  return total;
}

export function cumulativeMeanOf(values) {
  const result = [];
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
    result.push(total / (i + 1));
  }
  return result;
}

export function movingAverageOf(values, window) {
  const size = Math.trunc(Scratch.Cast.toNumber(window));
  if (!(size > 0)) return values.slice();
  const result = [];
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
    if (i >= size) total -= values[i - size];
    result.push(total / Math.min(i + 1, size));
  }
  return result;
}

export function exponentialSmoothingOf(values, alpha) {
  const a = Scratch.Cast.toNumber(alpha);
  if (values.length === 0) return [];
  if (!(a > 0 && a <= 1)) return values.slice();
  const result = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(a * values[i] + (1 - a) * result[i - 1]);
  }
  return result;
}

export function histogramCountsOf(values, bins) {
  const count = Math.trunc(Scratch.Cast.toNumber(bins));
  const shape = Math.max(1, Math.min(count, 1000));
  const result = new Array(shape).fill(0);
  if (values.length === 0) return result;
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (high === low) {
    result[0] = values.length;
    return result;
  }
  const width = (high - low) / shape;
  for (const value of values) {
    let index = Math.floor((value - low) / width);
    if (index >= shape) index = shape - 1;
    if (index < 0) index = 0;
    result[index] += 1;
  }
  return result;
}

export function rootMeanSquareOf(values) {
  if (values.length === 0) return NaN;
  return Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0) / values.length,
  );
}

export function skewnessOf(values) {
  const n = values.length;
  if (n < 3) return NaN;
  const mean = this.meanOf(values);
  const deviation = this.standardDeviationOf(values, true);
  if (!(deviation > 0)) return 0;
  let total = 0;
  for (const value of values) total += Math.pow((value - mean) / deviation, 3);
  return (n / ((n - 1) * (n - 2))) * total;
}

export function kurtosisOf(values) {
  const n = values.length;
  if (n < 4) return NaN;
  const mean = this.meanOf(values);
  const deviation = this.standardDeviationOf(values, true);
  if (!(deviation > 0)) return 0;
  let total = 0;
  for (const value of values) total += Math.pow((value - mean) / deviation, 4);
  const a = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const b = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  return a * total - b;
}

export function confidenceIntervalOf(values, level) {
  const certainty = Scratch.Cast.toNumber(level);
  const n = values.length;
  if (!(certainty > 0 && certainty < 1) || n < 2) return [NaN, NaN];
  const mean = this.meanOf(values);
  const margin =
    this.normalQuantileOf(0.5 + certainty / 2, 0, 1) *
    (this.standardDeviationOf(values, true) / Math.sqrt(n));
  return [mean - margin, mean + margin];
}

export function linearInterpolateAt(xs, ys, target) {
  if (xs.length === 0 || xs.length !== ys.length) return NaN;
  const x = Scratch.Cast.toNumber(target);
  if (xs.length === 1) return ys[0];
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) {
      const span = xs[i] - xs[i - 1];
      if (span === 0) return ys[i];
      const share = (x - xs[i - 1]) / span;
      return ys[i - 1] + share * (ys[i] - ys[i - 1]);
    }
  }
  return ys[ys.length - 1];
}

export function solveLinearSystem(matrix, right) {
  const size = right.length;
  const rows = [];
  for (let r = 0; r < size; r++) {
    if (!matrix[r] || matrix[r].length < size) return [];
    rows.push([...matrix[r].slice(0, size), right[r]]);
  }
  for (let column = 0; column < size; column++) {
    let best = column;
    for (let r = column + 1; r < size; r++) {
      if (Math.abs(rows[r][column]) > Math.abs(rows[best][column])) best = r;
    }
    if (Math.abs(rows[best][column]) < 1e-12) return [];
    const swap = rows[column];
    rows[column] = rows[best];
    rows[best] = swap;
    const pivot = rows[column][column];
    for (let c = column; c <= size; c++) rows[column][c] /= pivot;
    for (let r = 0; r < size; r++) {
      if (r === column) continue;
      const factor = rows[r][column];
      if (factor === 0) continue;
      for (let c = column; c <= size; c++)
        rows[r][c] -= factor * rows[column][c];
    }
  }
  return rows.map((row) => row[size]);
}

export function polynomialFitOf(xs, ys, degree) {
  const order = Math.trunc(Scratch.Cast.toNumber(degree));
  const n = xs.length;
  if (xs.length !== ys.length) return [];
  if (!(order >= 0) || order > 8 || n < order + 1) return [];
  const size = order + 1;
  const matrix = [];
  const right = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    matrix.push(new Array(size).fill(0));
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let total = 0;
      for (let k = 0; k < n; k++) total += Math.pow(xs[k], i + j);
      matrix[i][j] = total;
    }
    let total = 0;
    for (let k = 0; k < n; k++) total += ys[k] * Math.pow(xs[k], i);
    right[i] = total;
  }
  return this.solveLinearSystem(matrix, right).reverse();
}

export function continuedFractionOf(value, terms) {
  const x = Math.abs(Scratch.Cast.toNumber(value));
  const limit = Math.max(1, Math.trunc(Scratch.Cast.toNumber(terms)));
  const result = [];
  let remaining = x;
  for (
    let i = 0;
    i < limit && remaining > 0 && Number.isFinite(remaining);
    i++
  ) {
    const whole = Math.floor(remaining);
    result.push(whole);
    remaining = 1 / (remaining - whole);
  }
  return result;
}

export function rationalApproximationOf(value, maxDenominator) {
  const x = Scratch.Cast.toNumber(value);
  const limit = Math.max(1, Math.trunc(Scratch.Cast.toNumber(maxDenominator)));
  if (!Number.isFinite(x)) return [NaN, NaN];
  const magnitude = Math.abs(x);
  const whole = Math.floor(magnitude);
  let previousNumerator = 1;
  let previousDenominator = 0;
  let numerator = whole;
  let denominator = 1;
  let best = [numerator, denominator];
  let fraction = magnitude - whole;
  for (let i = 0; i < 64 && fraction > 0; i++) {
    const reciprocal = 1 / fraction;
    const term = Math.floor(reciprocal);
    const nextNumerator = term * numerator + previousNumerator;
    const nextDenominator = term * denominator + previousDenominator;
    if (nextDenominator > limit) break;
    previousNumerator = numerator;
    previousDenominator = denominator;
    numerator = nextNumerator;
    denominator = nextDenominator;
    best = [numerator, denominator];
    const nextFraction = reciprocal - term;
    if (!(nextFraction > 0)) break;
    fraction = nextFraction;
  }
  const sign = x < 0 ? -1 : 1;
  return [sign * best[0], best[1]];
}

export function modularInverseOf(value, modulus) {
  const m = Math.abs(Math.trunc(Scratch.Cast.toNumber(modulus)));
  const a = Math.trunc(Scratch.Cast.toNumber(value));
  if (m < 1) return NaN;
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  if (oldR !== 1) return NaN;
  return ((oldS % m) + m) % m;
}

export function chineseRemainderOf(rem1, mod1, rem2, mod2) {
  const m1 = Math.abs(Math.trunc(Scratch.Cast.toNumber(mod1)));
  const m2 = Math.abs(Math.trunc(Scratch.Cast.toNumber(mod2)));
  const r1 = Math.trunc(Scratch.Cast.toNumber(rem1));
  const r2 = Math.trunc(Scratch.Cast.toNumber(rem2));
  if (m1 < 1 || m2 < 1) return NaN;
  const common = this.gcdOf(m1, m2);
  if (common !== 1) return NaN;
  const inverse = this.modularInverseOf(m1, m2);
  if (!Number.isFinite(inverse)) return NaN;
  const step = this.positiveRemainder((r2 - r1) * inverse, m2);
  return this.positiveRemainder(r1 + m1 * step, m1 * m2);
}

export function threeDigitWords(value) {
  let n = Math.trunc(value);
  if (n < 0) return "";
  if (n === 0) return "zero";
  if (n >= 1000) return "";
  const parts = [];
  const hundreds = Math.floor(n / 100);
  if (hundreds > 0) {
    parts.push(`${NUMBER_WORDS[hundreds]} hundred`);
    n %= 100;
  }
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (tens === 1) {
    parts.push(NUMBER_WORDS[10 + ones]);
  } else if (tens > 1) {
    parts.push(TENS_WORDS[tens]);
    if (ones > 0) parts.push(NUMBER_WORDS[ones]);
  } else if (ones > 0) {
    parts.push(NUMBER_WORDS[ones]);
  }
  return parts.join(" ");
}

export function numberToWordsOf(value) {
  const number = Math.trunc(Scratch.Cast.toNumber(value));
  if (!Number.isFinite(number)) return "";
  if (number === 0) return "zero";
  const sign = number < 0 ? "minus " : "";
  let remaining = Math.abs(number);
  if (remaining >= 1e21) return "";
  const groups = [];
  let scale = 0;
  while (remaining > 0) {
    const chunk = remaining % 1000;
    remaining = Math.floor(remaining / 1000);
    if (chunk > 0) {
      const words = this.threeDigitWords(chunk);
      groups.push(
        words === ""
          ? ""
          : `${words}${SCALE_WORDS[scale] ? ` ${SCALE_WORDS[scale]}` : ""}`,
      );
    }
    scale += 1;
    if (scale >= SCALE_WORDS.length) break;
  }
  groups.reverse();
  return sign + groups.filter((part) => part !== "").join(" ");
}

export function ordinalSuffixOf(value) {
  const n = Math.abs(Math.trunc(Scratch.Cast.toNumber(value))) % 100;
  if (n >= 11 && n <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] || "th";
}

export function unitEntryOf(key) {
  const entry = UNITS[String(key)];
  return entry === undefined ? null : entry;
}

export function convertBetween(value, fromKey, toKey) {
  const amount = Scratch.Cast.toNumber(value);
  const from = this.unitEntryOf(fromKey);
  const to = this.unitEntryOf(toKey);
  if (from === null || to === null) return NaN;
  if (from[0] !== to[0]) return NaN;
  if (from[0] === "temperature") {
    const kelvin = (amount + (from[4] || 0)) * from[1];
    return kelvin / to[1] - (to[4] || 0);
  }
  if (from[0] === "fuel") {
    let perLitre;
    if (fromKey === "milesPerGallonUS") perLitre = amount * 0.4251437074976;
    else if (fromKey === "litresPer100Kilometres")
      perLitre = amount === 0 ? Infinity : 100 / amount;
    else perLitre = amount;
    if (toKey === "milesPerGallonUS") return perLitre / 0.4251437074976;
    if (toKey === "litresPer100Kilometres")
      return perLitre === 0 ? Infinity : 100 / perLitre;
    return perLitre;
  }
  return (amount * from[1]) / to[1];
}

export function baseSymbolFor(dimension) {
  const table = {
    mass: "kg",
    length: "m",
    area: "m²",
    volume: "m³",
    time: "s",
    speed: "m/s",
    acceleration: "m/s²",
    temperature: "K",
    pressure: "Pa",
    energy: "J",
    power: "W",
    force: "N",
    data: "B",
    frequency: "Hz",
    density: "kg/m³",
    angle: "°",
    flow: "m³/s",
    torque: "N·m",
    activity: "Bq",
    dose: "Sv",
    fuel: "km/L",
  };
  return table[dimension] === undefined ? "" : table[dimension];
}

export function baseUnitKeyFor(dimension) {
  const table = {
    mass: "kilogram",
    length: "metre",
    area: "squareMetre",
    volume: "cubicMetre",
    time: "second",
    speed: "metrePerSecond",
    acceleration: "metrePerSecondSquared",
    temperature: "kelvin",
    pressure: "pascal",
    energy: "joule",
    power: "watt",
    force: "newton",
    data: "byte",
    frequency: "hertz",
    density: "kilogramPerCubicMetre",
    angle: "degrees",
    flow: "cubicMetrePerSecond",
    torque: "newtonMetre",
    activity: "becquerel",
    dose: "sievert",
    fuel: "kilometresPerLitre",
  };
  return table[dimension] === undefined ? "" : table[dimension];
}
