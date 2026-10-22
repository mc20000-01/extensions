export function naturalLog(args) {
  return Math.log(this.num(args.NUM));
}

export function logBase10(args) {
  const value = this.num(args.NUM);
  if (value === 0) return -Infinity;
  return Math.log(value) / Math.LN10;
}

export function logBase2(args) {
  const value = this.num(args.NUM);
  if (value === 0) return -Infinity;
  return Math.log(value) / Math.LN2;
}

export function logOfBase(args) {
  const value = this.num(args.NUM);
  const base = this.num(args.BASE);
  if (value === 0) return -Infinity;
  if (base <= 0 || base === 1) return NaN;
  return Math.log(value) / Math.log(base);
}

export function eToThe(args) {
  return Math.exp(this.num(args.POWER));
}

export function tenToThe(args) {
  return Math.pow(10, this.num(args.POWER));
}

export function baseToThe(args) {
  return Math.pow(this.num(args.BASE), this.num(args.POWER));
}

export function squareRoot(args) {
  return Math.sqrt(this.num(args.NUM));
}

export function cubeRoot(args) {
  return Math.cbrt(this.num(args.NUM));
}

export function nthRoot(args) {
  const index = this.num(args.INDEX);
  const value = this.num(args.NUM);
  if (index === 0) return NaN;
  // Odd roots accept negative values, and -3 % 2 is -1, so use the magnitude.
  if (Math.abs(index) % 2 === 1)
    return Math.sign(value) * Math.pow(Math.abs(value), 1 / index);
  return value < 0 ? NaN : Math.pow(value, 1 / index);
}

export function hypotenuse(args) {
  return Math.hypot(this.num(args.A), this.num(args.B), this.num(args.C));
}

export function sigmoid(args) {
  const value = this.num(args.VALUE);
  if (value >= 0) {
    return 1 / (1 + Math.exp(-value));
  }
  const exponential = Math.exp(value);
  return exponential / (1 + exponential);
}

export function logit(args) {
  const probability = this.num(args.PROBABILITY);
  if (probability <= 0 || probability >= 1)
    return probability === 1 ? Infinity : -Infinity;
  return Math.log(probability / (1 - probability));
}
