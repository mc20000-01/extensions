export function gammaFunction(args) {
  return this.gammaOf(args.X);
}

export function logGammaFunction(args) {
  return this.logGammaOf(args.X);
}

export function betaFunction(args) {
  const a = this.num(args.A);
  const b = this.num(args.B);
  return (this.gammaOf(a) * this.gammaOf(b)) / this.gammaOf(a + b);
}

export function errorFunction(args) {
  return this.erfOf(args.X);
}

export function inverseErrorFunction(args) {
  return this.inverseErrorFunctionOf(args.Y);
}

export function stirlingApproximation(args) {
  const n = this.num(args.N);
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (n === 0) return 1;
  return Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n);
}
