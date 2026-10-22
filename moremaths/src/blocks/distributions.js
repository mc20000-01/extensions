export function uniformSample(args) {
  return this.randomUniformSample(args.LOW, args.HIGH);
}

export function uniformIntegerSample(args) {
  return this.randomUniformIntegerSample(args.LOW, args.HIGH);
}

export function bernoulliSample(args) {
  return this.randomBernoulliSample(args.PROBABILITY);
}

export function binomialSample(args) {
  return this.randomBinomialSample(args.TRIALS, args.PROBABILITY);
}

export function poissonSample(args) {
  return this.randomPoissonSample(args.RATE);
}

export function geometricSample(args) {
  return this.randomGeometricSample(args.PROBABILITY);
}

export function negativeBinomialSample(args) {
  return this.randomNegativeBinomialSample(args.SUCCESSES, args.PROBABILITY);
}

export function hypergeometricSample(args) {
  return this.randomHypergeometricSample(
    args.DRAWN,
    args.SUCCESSES,
    args.POPULATION,
  );
}

export function logNormalSample(args) {
  return this.randomLogNormalSample(args.MEAN, args.DEVIATION);
}

export function standardNormalSample(args) {
  void args;
  return this.randomStandardNormalSample();
}

export function gammaSample(args) {
  return this.randomGammaSample(args.SHAPE, args.SCALE);
}

export function betaSample(args) {
  return this.randomBetaSample(args.A, args.B);
}

export function weibullSample(args) {
  return this.randomWeibullSample(args.SHAPE, args.SCALE);
}

export function cauchySample(args) {
  return this.randomCauchySample(args.LOCATION, args.SCALE);
}

export function laplaceSample(args) {
  return this.randomLaplaceSample(args.LOCATION, args.SCALE);
}

export function chiSquareSample(args) {
  return this.randomChiSquareSample(args.DEGREES_OF_FREEDOM);
}

export function studentTSample(args) {
  return this.randomStudentTSample(args.DEGREES_OF_FREEDOM);
}

export function shuffledList(args, util) {
  const values = this.listValuesOf(args.LIST, util);
  if (values === null) return [];
  return this.shuffledValues(values);
}

export function randomSampleWithoutReplacement(args, util) {
  const values = this.listValuesOf(args.LIST, util);
  if (values === null) return [];
  return this.sampledWithoutReplacement(values, args.COUNT);
}

export function normalQuantile(args) {
  return this.normalQuantileOf(args.PROBABILITY, args.MEAN, args.DEVIATION);
}

export function normalZScore(args) {
  return (
    (this.num(args.VALUE) - this.num(args.MEAN)) / this.num(args.DEVIATION)
  );
}

export function uniformPdf(args) {
  return this.uniformPdfOf(args.X, args.LOW, args.HIGH);
}

export function uniformCdf(args) {
  return this.uniformCdfOf(args.X, args.LOW, args.HIGH);
}

export function exponentialPdf(args) {
  return this.exponentialPdfOf(args.X, args.RATE);
}

export function exponentialCdf(args) {
  return this.exponentialCdfOf(args.X, args.RATE);
}

export function exponentialQuantile(args) {
  return this.exponentialQuantileOf(args.PROBABILITY, args.RATE);
}

export function logNormalPdf(args) {
  return this.logNormalPdfOf(args.X, args.MEAN, args.DEVIATION);
}

export function logNormalCdf(args) {
  return this.logNormalCdfOf(args.X, args.MEAN, args.DEVIATION);
}

export function logNormalQuantile(args) {
  return Math.exp(
    this.normalQuantileOf(args.PROBABILITY, args.MEAN, args.DEVIATION),
  );
}

export function gammaPdf(args) {
  return this.gammaPdfOf(args.X, args.SHAPE, args.SCALE);
}

export function gammaCdf(args) {
  return this.gammaCdfOf(args.X, args.SHAPE, args.SCALE);
}

export function gammaQuantile(args) {
  return this.gammaQuantileOf(args.PROBABILITY, args.SHAPE, args.SCALE);
}

export function betaPdf(args) {
  return this.betaPdfOf(args.X, args.A, args.B);
}

export function betaCdf(args) {
  return this.betaCdfOf(args.X, args.A, args.B);
}

export function betaQuantile(args) {
  return this.betaQuantileOf(args.PROBABILITY, args.A, args.B);
}

export function weibullPdf(args) {
  return this.weibullPdfOf(args.X, args.SHAPE, args.SCALE);
}

export function weibullCdf(args) {
  return this.weibullCdfOf(args.X, args.SHAPE, args.SCALE);
}

export function cauchyPdf(args) {
  return this.cauchyPdfOf(args.X, args.LOCATION, args.SCALE);
}

export function cauchyCdf(args) {
  return this.cauchyCdfOf(args.X, args.LOCATION, args.SCALE);
}

export function cauchyQuantile(args) {
  return this.cauchyQuantileOf(args.PROBABILITY, args.LOCATION, args.SCALE);
}

export function laplacePdf(args) {
  return this.laplacePdfOf(args.X, args.LOCATION, args.SCALE);
}

export function laplaceCdf(args) {
  return this.laplaceCdfOf(args.X, args.LOCATION, args.SCALE);
}

export function laplaceQuantile(args) {
  return this.laplaceQuantileOf(args.PROBABILITY, args.LOCATION, args.SCALE);
}

export function studentTPdf(args) {
  return this.studentTPdfOf(args.X, args.DEGREES_OF_FREEDOM);
}

export function studentTCdf(args) {
  return this.studentTCdfOf(args.X, args.DEGREES_OF_FREEDOM);
}

export function studentTQuantile(args) {
  return this.studentTQuantileOf(args.PROBABILITY, args.DEGREES_OF_FREEDOM);
}

export function chiSquarePdf(args) {
  return this.chiSquarePdfOf(args.X, args.DEGREES_OF_FREEDOM);
}

export function chiSquareCdf(args) {
  return this.chiSquareCdfOf(args.X, args.DEGREES_OF_FREEDOM);
}

export function fDistributionCdf(args) {
  return this.fDistributionCdfOf(
    args.X,
    args.NUMERATOR_DEGREES,
    args.DENOMINATOR_DEGREES,
  );
}

export function poissonPmf(args) {
  return this.poissonPmfOf(args.K, args.RATE);
}

export function poissonCdf(args) {
  return this.poissonCdfOf(args.K, args.RATE);
}

export function binomialPmf(args) {
  return this.binomialPmfOf(args.K, args.TRIALS, args.PROBABILITY);
}

export function binomialCdf(args) {
  return this.binomialCdfOf(args.K, args.TRIALS, args.PROBABILITY);
}

export function binomialQuantile(args) {
  const probability = this.num(args.PROBABILITY);
  const trials = this.whole(args.TRIALS);
  const p = this.num(args.TRIAL_PROBABILITY);
  if (!(probability >= 0 && probability <= 1)) return NaN;
  if (!(trials >= 0)) return NaN;
  if (probability <= 0) return 0;
  if (probability >= 1) return trials;
  let low = 0;
  let high = trials;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (this.binomialCdfOf(middle, trials, p) < probability) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function poissonQuantile(args) {
  const probability = this.num(args.PROBABILITY);
  const rate = this.num(args.RATE);
  if (!(probability >= 0 && probability <= 1) || !(rate >= 0)) return NaN;
  if (probability <= 0) return 0;
  let low = 0;
  let high = Math.max(1, Math.ceil(rate + 10 * Math.sqrt(rate + 1)));
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (this.poissonCdfOf(middle, rate) < probability) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function geometricPmf(args) {
  return this.geometricPmfOf(args.K, args.PROBABILITY);
}

export function geometricCdf(args) {
  return this.geometricCdfOf(args.K, args.PROBABILITY);
}

export function negativeBinomialPmf(args) {
  return this.negativeBinomialPmfOf(args.K, args.SUCCESSES, args.PROBABILITY);
}

export function negativeBinomialCdf(args) {
  return this.negativeBinomialCdfOf(args.K, args.SUCCESSES, args.PROBABILITY);
}

export function hypergeometricPmf(args) {
  return this.hypergeometricPmfOf(
    args.K,
    args.DRAWN,
    args.SUCCESSES,
    args.POPULATION,
  );
}

export function hypergeometricCdf(args) {
  return this.hypergeometricCdfOf(
    args.K,
    args.DRAWN,
    args.SUCCESSES,
    args.POPULATION,
  );
}

export function uniformMean(args) {
  return (this.num(args.LOW) + this.num(args.HIGH)) / 2;
}

export function uniformVariance(args) {
  const width = this.num(args.HIGH) - this.num(args.LOW);
  return (width * width) / 12;
}

export function uniformStdDev(args) {
  const width = this.num(args.HIGH) - this.num(args.LOW);
  return Math.abs(width) / Math.sqrt(12);
}

export function exponentialMean(args) {
  const rate = this.num(args.RATE);
  return rate > 0 ? 1 / rate : NaN;
}

export function exponentialVariance(args) {
  const rate = this.num(args.RATE);
  return rate > 0 ? 1 / (rate * rate) : NaN;
}

export function exponentialStdDev(args) {
  const rate = this.num(args.RATE);
  return rate > 0 ? 1 / rate : NaN;
}

export function normalMean(args) {
  return this.num(args.MEAN);
}

export function normalVariance(args) {
  return this.num(args.DEVIATION) ** 2;
}

export function normalStdDev(args) {
  return Math.abs(this.num(args.DEVIATION));
}

export function logNormalMean(args) {
  return Math.exp(this.num(args.MEAN) + 0.5 * this.num(args.DEVIATION) ** 2);
}

export function logNormalVariance(args) {
  const mu = this.num(args.MEAN);
  const sigma = this.num(args.DEVIATION);
  const factor = Math.exp(sigma * sigma);
  return (factor - 1) * factor * Math.exp(2 * mu);
}

export function logNormalStdDev(args) {
  const value = this.logNormalVariance(args);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function gammaMean(args) {
  return this.num(args.SHAPE) * this.num(args.SCALE);
}

export function gammaVariance(args) {
  return this.num(args.SHAPE) * this.num(args.SCALE) ** 2;
}

export function gammaStdDev(args) {
  const value = this.num(args.SHAPE) * this.num(args.SCALE) ** 2;
  return value < 0 ? NaN : Math.sqrt(value);
}

export function betaMean(args) {
  const a = this.num(args.A);
  const b = this.num(args.B);
  return a + b > 0 ? a / (a + b) : NaN;
}

export function betaVariance(args) {
  const a = this.num(args.A);
  const b = this.num(args.B);
  const total = a + b;
  return total > 0 ? (a * b) / (total * total * (total + 1)) : NaN;
}

export function betaStdDev(args) {
  const value = this.betaVariance(args);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function weibullMean(args) {
  const shape = this.num(args.SHAPE);
  const scale = this.num(args.SCALE);
  if (!(shape > 0) || !(scale >= 0)) return NaN;
  return scale * this.gammaOf(1 + 1 / shape);
}

export function weibullVariance(args) {
  const shape = this.num(args.SHAPE);
  const scale = this.num(args.SCALE);
  if (!(shape > 0) || !(scale >= 0)) return NaN;
  const mean = scale * this.gammaOf(1 + 1 / shape);
  return scale * scale * this.gammaOf(1 + 2 / shape) - mean * mean;
}

export function weibullStdDev(args) {
  const value = this.weibullVariance(args);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function laplaceMean(args) {
  return this.num(args.LOCATION);
}

export function laplaceVariance(args) {
  return 2 * this.num(args.SCALE) ** 2;
}

export function laplaceStdDev(args) {
  return Math.abs(this.num(args.SCALE)) * Math.SQRT2;
}

export function cauchyMean(args) {
  return this.num(args.LOCATION);
}

export function cauchyStdDev(args) {
  // The Cauchy distribution has no standard deviation; report it as infinite.
  return Infinity;
}

export function binomialMean(args) {
  return this.num(args.TRIALS) * this.num(args.PROBABILITY);
}

export function binomialVariance(args) {
  const p = this.num(args.PROBABILITY);
  return this.num(args.TRIALS) * p * (1 - p);
}

export function binomialStdDev(args) {
  const value = this.binomialVariance(args);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function poissonMean(args) {
  return this.num(args.RATE);
}

export function poissonVariance(args) {
  return this.num(args.RATE);
}

export function poissonStdDev(args) {
  const value = this.num(args.RATE);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function geometricMean(args) {
  const p = this.num(args.PROBABILITY);
  return p > 0 ? 1 / p : NaN;
}

export function geometricVariance(args) {
  const p = this.num(args.PROBABILITY);
  return p > 0 ? (1 - p) / (p * p) : NaN;
}

export function geometricStdDev(args) {
  const value = this.geometricVariance(args);
  return value < 0 ? NaN : Math.sqrt(value);
}

export function listShannonEntropy(args, util) {
  const values = this.listNumbersOf(args.LIST, util);
  if (values === null) return 0;
  return this.entropyOfBits(values);
}
