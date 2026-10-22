export function listLength(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? values.length : 0;
}

export function listSum(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.sumOf(values) : 0;
}

export function listMean(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.meanOf(values) : 0;
}

export function listMedian(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.medianOf(values) : 0;
}

export function listMode(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return "";
  const modes = this.modesOf(values);
  return modes.length === 0 ? "" : modes[0];
}

export function listSmallest(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  let smallest = values[0];
  for (const value of values) {
    if (value < smallest) smallest = value;
  }
  return smallest;
}

export function listLargest(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  let largest = values[0];
  for (const value of values) {
    if (value > largest) largest = value;
  }
  return largest;
}

export function listRange(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  let largest = values[0];
  let smallest = values[0];
  for (const value of values) {
    if (value > largest) largest = value;
    if (value < smallest) smallest = value;
  }
  return largest - smallest;
}

export function listMidrange(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  let largest = values[0];
  let smallest = values[0];
  for (const value of values) {
    if (value > largest) largest = value;
    if (value < smallest) smallest = value;
  }
  return (largest + smallest) / 2;
}

export function listPopulationVariance(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.varianceOf(values, false) : 0;
}

export function listSampleVariance(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.varianceOf(values, true) : 0;
}

export function listPopulationStdDev(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.standardDeviationOf(values, false) : 0;
}

export function listSampleStdDev(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.standardDeviationOf(values, true) : 0;
}

export function listStandardError(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  return this.standardDeviationOf(values, false) / Math.sqrt(values.length);
}

export function listGeometricMean(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values) return 0;
  let total = 0;
  let count = 0;
  for (const value of values) {
    if (value > 0) {
      total += Math.log(value);
      count += 1;
    }
  }
  return count === 0 ? 0 : Math.exp(total / count);
}

export function listHarmonicMean(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values) return 0;
  let total = 0;
  let count = 0;
  for (const value of values) {
    if (value !== 0) {
      total += 1 / value;
      count += 1;
    }
  }
  return count === 0 || total === 0 ? 0 : count / total;
}

export function listTrimmedMean(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  const trim = this.clampNum(this.num(args.TRIM) / 100, 0, 0.5);
  return this.trimmedMeanOf(values, trim);
}

export function listPercentile(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  return this.quantileOf(this.sortedCopy(values), this.num(args.PERCENT) / 100);
}

export function listQuartile(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  return this.quantileOf(this.sortedCopy(values), this.num(args.QUARTILE) / 4);
}

export function listInterquartileRange(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length < 2) return 0;
  const sorted = this.sortedCopy(values);
  return this.quantileOf(sorted, 0.75) - this.quantileOf(sorted, 0.25);
}

export function listMedianAbsoluteDeviation(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  return values ? this.medianAbsoluteDeviationOf(values) : 0;
}

export function listZScore(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values || values.length === 0) return 0;
  const deviation = this.standardDeviationOf(values, false);
  if (deviation === 0) return 0;
  return (this.num(args.VALUE) - this.meanOf(values)) / deviation;
}

export function listWeightedMean(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  const weights = this.listNumbersOf(args.WEIGHTS, util);
  if (!values || !weights) return 0;
  return this.weightedMeanOf(values, weights);
}

export function listCovariance(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (!xs || !ys) return 0;
  const n = Math.min(xs.length, ys.length);
  const sample = Scratch.Cast.toBoolean(args.SAMPLE);
  if (n === 0 || (sample && n < 2)) return 0;
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let total = 0;
  for (let i = 0; i < n; i++) total += (xs[i] - meanX) * (ys[i] - meanY);
  return total / (sample ? n - 1 : n);
}

export function listCorrelation(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (!xs || !ys) return 0;
  return this.regressionOf(xs, ys).r;
}

export function listRegressionSlope(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (!xs || !ys) return 0;
  return this.regressionOf(xs, ys).slope;
}

export function listRegressionIntercept(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (!xs || !ys) return 0;
  return this.regressionOf(xs, ys).intercept;
}

export function listRegressionRSquared(args, util) {
  const xs = this.listNumbersOf(args.XS, util);
  const ys = this.listNumbersOf(args.YS, util);
  if (!xs || !ys) return 0;
  return this.regressionOf(xs, ys).r2;
}

export function listSortedText(args, util) {
  const values = this.listValuesOf(args.LIST, util);
  return values ? this.joinNumbers(this.sortedValuesCopy(values)) : "";
}

export function listCumulativeSum(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values) return "";
  let total = 0;
  const totals = [];
  for (const value of values) {
    total += value;
    totals.push(total);
  }
  return this.joinNumbers(totals);
}

export function listCountOf(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (!values) return 0;
  const wanted = this.num(args.VALUE);
  let count = 0;
  for (const value of values) {
    if (value === wanted) count += 1;
  }
  return count;
}

export function listAllTrue(args, util) {
  const values = this.listValuesOf(args.LIST, util);
  if (!values || values.length === 0) return false;
  for (const value of values) {
    if (!Scratch.Cast.toBoolean(value)) return false;
  }
  return true;
}

export function listAnyTrue(args, util) {
  const values = this.listValuesOf(args.LIST, util);
  if (!values || values.length === 0) return false;
  for (const value of values) {
    if (Scratch.Cast.toBoolean(value)) return true;
  }
  return false;
}
