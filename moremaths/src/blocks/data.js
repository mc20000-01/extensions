export function rootMeanSquareOfList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? NaN : this.rootMeanSquareOf(values);
}

export function listSkewness(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? NaN : this.skewnessOf(values);
}

export function listKurtosis(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? NaN : this.kurtosisOf(values);
}

export function movingAverageOfList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? [] : this.movingAverageOf(values, args.WINDOW);
}

export function exponentialSmoothingList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? [] : this.exponentialSmoothingOf(values, args.ALPHA);
}

export function histogramCountsList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? [] : this.histogramCountsOf(values, args.BINS);
}

export function confidenceIntervalList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null
    ? [NaN, NaN]
    : this.confidenceIntervalOf(values, args.LEVEL);
}

export function polynomialFitList(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (xs === null || ys === null) return [];
  return this.polynomialFitOf(xs, ys, args.DEGREE);
}

export function linearInterpolateList(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (xs === null || ys === null) return NaN;
  return this.linearInterpolateAt(xs, ys, args.X);
}

export function normalisedList(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (values === null) return [];
  const mean = this.meanOf(values);
  // Population deviation, so this agrees with the listZScore block.
  const deviation = this.standardDeviationOf(values, false);
  if (!(deviation > 0)) return values.map(() => 0);
  return values.map((value) => (value - mean) / deviation);
}

export function outlierCount(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (values === null) return 0;
  const sorted = this.sortedCopy(values);
  const first = this.quantileOf(sorted, 0.25);
  const third = this.quantileOf(sorted, 0.75);
  const spread = third - first;
  if (!(spread > 0)) return 0;
  const low = first - this.num(args.MULTIPLIER) * spread;
  const high = third + this.num(args.MULTIPLIER) * spread;
  let count = 0;
  for (const value of values) {
    if (value < low || value > high) count += 1;
  }
  return count;
}

export function listEntropyBits(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values === null ? 0 : this.entropyOfBits(values);
}

export function sampleSizeForMargin(args) {
  const sigma = this.num(args.SIGMA);
  const margin = Math.abs(this.num(args.MARGIN));
  const certainty = this.num(args.LEVEL);
  if (!(sigma > 0) || !(margin > 0) || !(certainty > 0 && certainty < 1))
    return NaN;
  const z = this.normalQuantileOf(0.5 + certainty / 2, 0, 1);
  return Math.ceil(((z * sigma) / margin) ** 2);
}

export function listSummary(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (values === null || values.length === 0) return "empty list";
  const sorted = this.sortedCopy(values);
  const mean = this.meanOf(values);
  const deviation = this.standardDeviationOf(values, true);
  return [
    `count ${values.length}`,
    `mean ${this.roundedTo(mean, 4)}`,
    `median ${this.roundedTo(this.medianOf(values), 4)}`,
    `min ${this.roundedTo(sorted[0], 4)}`,
    `max ${this.roundedTo(sorted[sorted.length - 1], 4)}`,
    `std dev ${this.roundedTo(deviation, 4)}`,
  ].join(", ");
}
