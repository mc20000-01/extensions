import fs from "node:fs";
import {
  registered as ext,
  defaultArgs,
  blockSpecs,
  menuItems,
  util,
} from "./harness.mjs";

const COVERAGE_DIR = new URL(".coverage/", import.meta.url).pathname;
fs.mkdirSync(COVERAGE_DIR, { recursive: true });
const TAG = "v2";

let checks = 0;
const failures = [];
const byOpcode = Object.fromEntries(blockSpecs().map((b) => [b.opcode, b]));
const tolerance = 1e-9;

const called = new Set();
function call(opcode, overrides = {}) {
  called.add(opcode);
  const entry = byOpcode[opcode];
  if (!entry) throw new Error(`unknown opcode ${opcode}`);
  return ext[opcode](defaultArgs(entry, overrides), util);
}
function eq(name, actual, expected) {
  checks += 1;
  if (!Object.is(actual, expected))
    failures.push(
      `${name}: expected ${expected}, got ${JSON.stringify(actual)}`,
    );
}
function close(name, actual, expected, relTol = tolerance) {
  checks += 1;
  if (typeof actual !== "number" || !Number.isFinite(actual)) {
    failures.push(`${name}: expected ~${expected}, got ${actual}`);
    return;
  }
  const scale = Math.max(Math.abs(expected), 1e-30);
  const rel = Math.abs(actual - expected) / scale;
  if (rel > relTol)
    failures.push(
      `${name}: expected ~${expected}, got ${actual} (rel ${rel.toExponential(2)})`,
    );
}
function within(name, actual, expected, absTol) {
  checks += 1;
  if (typeof actual !== "number" || !(Math.abs(actual - expected) <= absTol)) {
    failures.push(`${name}: expected ${expected} ±${absTol}, got ${actual}`);
  }
}
function arrClose(name, actual, expected, absTol = 1e-9) {
  checks += 1;
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    failures.push(
      `${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
    return;
  }
  for (let i = 0; i < expected.length; i++) {
    if (!(Math.abs(actual[i] - expected[i]) <= absTol)) {
      failures.push(`${name}[${i}]: expected ${expected[i]}, got ${actual[i]}`);
    }
  }
}
function arrEq(name, actual, expected) {
  checks += 1;
  if (
    !Array.isArray(actual) ||
    actual.length !== expected.length ||
    actual.some((v, i) => v !== expected[i])
  ) {
    failures.push(
      `${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
function ok(name, condition) {
  checks += 1;
  if (!condition) failures.push(`${name}: condition failed`);
}
function isNan(name, actual) {
  checks += 1;
  if (!Number.isNaN(actual))
    failures.push(`${name}: expected NaN, got ${actual}`);
}
const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
const variance = (v) => {
  const m = mean(v);
  return v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1);
};
let listCounter = 0;
const registeredLists = new Map();
function lst(value) {
  listCounter += 1;
  const name = `data${listCounter}`;
  registeredLists.set(name, { id: name, type: "list", name, value });
  util.target.lookupVariableById = (id) => registeredLists.get(id) || null;
  util.target.lookupVariableByNameAndType = (n) =>
    registeredLists.get(n) || null;
  return name;
}
const series = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

/* ---------------- units ---------------- */
const BASE = {
  mass: "kilogram",
  length: "metre",
  area: "squareMetre",
  volume: "cubicMetre",
  time: "second",
  speed: "metrePerSecond",
  acceleration: "metrePerSecondSquared",
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
};
const DIM_OPCODE = {
  mass: "convertMass",
  length: "convertLength",
  area: "convertArea",
  volume: "convertVolume",
  time: "convertTime",
  speed: "convertSpeed",
  acceleration: "convertAcceleration",
  pressure: "convertPressure",
  energy: "convertEnergy",
  power: "convertPower",
  force: "convertForce",
  data: "convertDataSize",
  frequency: "convertFrequency",
  density: "convertDensity",
  angle: "convertAngle",
  flow: "convertFlow",
  torque: "convertTorque",
  activity: "convertRadioactivity",
  dose: "convertRadioactivity",
};
for (const [dim, opcode] of Object.entries(DIM_OPCODE)) {
  const units = menuItems[`${dim}Unit`];
  const base = BASE[dim];
  for (const unit of units) {
    if (unit === base) continue;
    const valueArg = Object.entries(byOpcode[opcode].arguments).find(
      ([, arg]) => arg.type === "number",
    )[0];
    const toBase = call(opcode, { [valueArg]: 1, FROM: unit, TO: base });
    const back = call(opcode, { [valueArg]: toBase, FROM: base, TO: unit });
    close(`roundtrip ${dim} ${unit}`, back, 1, 1e-8);
  }
}
eq("celsius to fahrenheit", call("celsiusToFahrenheit", { C: 100 }), 212);
eq("fahrenheit to celsius", call("fahrenheitToCelsius", { F: 212 }), 100);
close("celsius to kelvin", call("celsiusToKelvin", { C: 25 }), 298.15);
close("kelvin to celsius", call("kelvinToCelsius", { K: 0 }), -273.15);
close("kg to lb", call("kilogramsToPounds", { KG: 1 }), 2.2046226218487757);
close("lb to kg", call("poundsToKilograms", { LB: 1 }), 0.45359237);
close("mile to km", call("milesToKilometres", { MI: 1 }), 1.609344);
close("km to mile", call("kilometresToMiles", { KM: 1.609344 }), 1);
eq("miles to feet", call("milesToFeet", { MI: 1 }), 5280);
close("ft to m", call("feetToMetres", { FT: 1 }), 0.3048);
close("in to cm", call("inchesToCentimetres", { IN: 1 }), 2.54);
close("litre to gallon", call("litresToGallons", { L: 3.785411784 }), 1);
eq("hour to day", call("hoursToDays", { H: 48 }), 2);
close(
  "kph to mph",
  call("kilometresPerHourToMilesPerHour", { KPH: 1.609344 }),
  1,
);
close(
  "GB to MB",
  call("convertDataSize", { SIZE: 1, FROM: "gigabyte", TO: "megabyte" }),
  1000,
);
close(
  "GiB to MiB",
  call("convertDataSize", { SIZE: 1, FROM: "gibibyte", TO: "mebibyte" }),
  1024,
);
close(
  "degrees to radians",
  call("convertAngle", { ANGLE: 180, FROM: "degrees", TO: "radians" }),
  Math.PI,
);
eq(
  "mixed dimension is NaN",
  Number.isNaN(call("convertMass", { MASS: 1, FROM: "gram", TO: "second" })),
  true,
);
const mpg = 30;
const l100 = call("convertFuelEconomy", {
  VALUE: mpg,
  FROM: "milesPerGallonUS",
  TO: "litresPer100Kilometres",
});
close("mpg to L/100km", l100, 100 / (mpg * 0.4251437074976), 1e-9);
close(
  "L/100km back to mpg",
  call("convertFuelEconomy", {
    VALUE: l100,
    FROM: "litresPer100Kilometres",
    TO: "milesPerGallonUS",
  }),
  mpg,
  1e-9,
);
eq("unit symbol", call("unitSymbol", { UNIT: "kilogram" }), "kg");
eq("unit dimension", call("unitDimension", { UNIT: "celsius" }), "temperature");
eq(
  "unit name",
  call("unitName", { UNIT: "milesPerGallonUS" }),
  "US miles per gallon",
);
ok(
  "unit detail text",
  call("unitDetail", { UNIT: "kilogram" }).includes("1 kilogram (kg) = 1"),
);
eq(
  "unit key for symbol",
  call("unitKeyForSymbol", { SYMBOL: "kg" }),
  "kilogram",
);
ok(
  "units in dimension",
  call("unitsInDimension", { DIMENSION: "mass" }).includes("kilogram (kg)"),
);
ok("dimension list", call("unitDimensionsList").includes("temperature"));
close(
  "physical constant",
  call("physicalConstant", { CONSTANT: "speedOfLight" }),
  299792458,
  0,
);
close(
  "planck constant",
  call("physicalConstant", { CONSTANT: "planckConstant" }),
  6.62607015e-34,
  0,
);

/* ---------------- distributions ---------------- */
close(
  "normal quantile 0.975",
  call("normalQuantile", { PROBABILITY: 0.975 }),
  1.959963985,
  1e-6,
);
within(
  "normal quantile 0.5",
  call("normalQuantile", { PROBABILITY: 0.5 }),
  0,
  1e-9,
);
within(
  "normal quantile 0.025",
  call("normalQuantile", { PROBABILITY: 0.025 }),
  -1.959963985,
  1e-6,
);
close("uniform mean", call("uniformMean", { LOW: 0, HIGH: 1 }), 0.5);
close("uniform variance", call("uniformVariance", { LOW: 0, HIGH: 1 }), 1 / 12);
close(
  "uniform stddev",
  call("uniformStdDev", { LOW: 0, HIGH: 1 }),
  1 / Math.sqrt(12),
);
close("exponential mean", call("exponentialMean", { RATE: 2 }), 0.5);
close("exponential variance", call("exponentialVariance", { RATE: 2 }), 0.25);
close(
  "exponential quantile",
  call("exponentialQuantile", { PROBABILITY: 0.5, RATE: 1 }),
  Math.LN2,
);
close(
  "exponential cdf",
  call("exponentialCdf", { X: 1, RATE: 2 }),
  1 - Math.exp(-2),
);
close(
  "exponential pdf",
  call("exponentialPdf", { X: 1, RATE: 2 }),
  2 * Math.exp(-2),
);
close("gamma mean", call("gammaMean", { SHAPE: 3, SCALE: 2 }), 6);
close("gamma variance", call("gammaVariance", { SHAPE: 3, SCALE: 2 }), 12);
close(
  "gamma median",
  call("gammaQuantile", { PROBABILITY: 0.5, SHAPE: 2, SCALE: 1 }),
  1.6783469900166605,
  1e-6,
);
close(
  "gamma median shape one",
  call("gammaQuantile", { PROBABILITY: 0.5, SHAPE: 1, SCALE: 1 }),
  Math.LN2,
  1e-6,
);
close(
  "gamma cdf at mean",
  call("gammaCdf", { X: 6, SHAPE: 3, SCALE: 2 }),
  0.5768099188731556,
  1e-9,
);
close("beta mean", call("betaMean", { A: 2, B: 3 }), 0.4);
close("beta variance", call("betaVariance", { A: 2, B: 3 }), 0.04);
within(
  "beta median",
  call("betaQuantile", { PROBABILITY: 0.5, A: 2, B: 3 }),
  0.3857275681323906,
  1e-6,
);
within(
  "beta median uniform",
  call("betaQuantile", { PROBABILITY: 0.5, A: 1, B: 1 }),
  0.5,
  1e-6,
);
close(
  "lognormal mean",
  call("logNormalMean", { MEAN: 0, DEVIATION: 1 }),
  Math.exp(0.5),
);
close(
  "lognormal variance",
  call("logNormalVariance", { MEAN: 0, DEVIATION: 1 }),
  Math.exp(1) * (Math.exp(1) - 1),
);
close("weibull mean shape 1", call("weibullMean", { SHAPE: 1, SCALE: 1 }), 1);
close(
  "weibull mean shape 2",
  call("weibullMean", { SHAPE: 2, SCALE: 1 }),
  Math.sqrt(Math.PI) / 2,
  1e-8,
);
close(
  "weibull variance shape 1",
  call("weibullVariance", { SHAPE: 1, SCALE: 1 }),
  1,
);
ok(
  "weibull variance positive",
  call("weibullVariance", { SHAPE: 1.5, SCALE: 1 }) > 0,
);
close(
  "laplace stddev",
  call("laplaceStdDev", { LOCATION: 0, SCALE: 1 }),
  Math.SQRT2,
);
within(
  "laplace median",
  call("laplaceQuantile", { PROBABILITY: 0.5, LOCATION: 3, SCALE: 2 }),
  3,
  1e-9,
);
close(
  "laplace cdf at centre",
  call("laplaceCdf", { X: 0, LOCATION: 0, SCALE: 2 }),
  0.5,
);
close(
  "cauchy quantile",
  call("cauchyQuantile", { PROBABILITY: 0.75, LOCATION: 0, SCALE: 1 }),
  1,
);
within(
  "cauchy cdf at 0",
  call("cauchyCdf", { X: 0, LOCATION: 0, SCALE: 1 }),
  0.5,
  1e-9,
);
close(
  "student t quantile",
  call("studentTQuantile", { PROBABILITY: 0.975, DEGREES_OF_FREEDOM: 10 }),
  2.228138852,
  1e-6,
);
close(
  "student t cdf at 0",
  call("studentTCdf", { X: 0, DEGREES_OF_FREEDOM: 7 }),
  0.5,
  1e-9,
);
close(
  "chi-square cdf 95%",
  call("chiSquareCdf", { X: 3.841458820694124, DEGREES_OF_FREEDOM: 1 }),
  0.95,
  1e-6,
);
close(
  "chi-square cdf mean",
  call("chiSquareCdf", { X: 4, DEGREES_OF_FREEDOM: 4 }),
  1 - 3 * Math.exp(-2),
  1e-9,
);
within(
  "F cdf F(1,1) at 1",
  call("fDistributionCdf", {
    X: 1,
    NUMERATOR_DEGREES: 1,
    DENOMINATOR_DEGREES: 1,
  }),
  0.5,
  1e-9,
);
close(
  "poisson pmf",
  call("poissonPmf", { K: 2, RATE: 4 }),
  (4 * 4 * Math.exp(-4)) / 2,
);
close(
  "poisson cdf",
  call("poissonCdf", { K: 2, RATE: 4 }),
  Math.exp(-4) * (1 + 4 + 8),
  1e-12,
);
eq(
  "poisson quantile",
  call("poissonQuantile", { PROBABILITY: 0.5, RATE: 4 }),
  4,
);
close(
  "binomial pmf",
  call("binomialPmf", { K: 5, TRIALS: 10, PROBABILITY: 0.5 }),
  0.24609375,
);
close(
  "binomial cdf",
  call("binomialCdf", { K: 5, TRIALS: 10, PROBABILITY: 0.5 }),
  0.623046875,
  1e-9,
);
eq(
  "binomial quantile",
  call("binomialQuantile", {
    PROBABILITY: 0.5,
    TRIALS: 10,
    TRIAL_PROBABILITY: 0.5,
  }),
  5,
);
close(
  "geometric pmf",
  call("geometricPmf", { K: 1, PROBABILITY: 0.25 }),
  0.25 * 0.75 ** 0,
);
close("geometric cdf", call("geometricCdf", { K: 2, PROBABILITY: 0.5 }), 0.75);
close("geometric mean", call("geometricMean", { PROBABILITY: 0.5 }), 2);
close(
  "negative binomial pmf",
  call("negativeBinomialPmf", { K: 5, SUCCESSES: 3, PROBABILITY: 0.5 }),
  0.1875,
);
eq(
  "negative binomial pmf below minimum",
  call("negativeBinomialPmf", { K: 2, SUCCESSES: 3, PROBABILITY: 0.5 }),
  0,
);
close(
  "hypergeometric pmf",
  call("hypergeometricPmf", { K: 2, DRAWN: 10, SUCCESSES: 4, POPULATION: 20 }),
  0.4179566563467486,
  1e-9,
);
{
  let total = 0;
  for (let k = 0; k <= 4; k++)
    total += call("hypergeometricPmf", {
      K: k,
      DRAWN: 10,
      SUCCESSES: 4,
      POPULATION: 20,
    });
  close("hypergeometric pmf sums to 1", total, 1, 1e-9);
  close(
    "hypergeometric cdf matches pmf sum",
    call("hypergeometricCdf", {
      K: 2,
      DRAWN: 10,
      SUCCESSES: 4,
      POPULATION: 20,
    }),
    [0, 1, 2].reduce(
      (a, k) =>
        a +
        call("hypergeometricPmf", {
          K: k,
          DRAWN: 10,
          SUCCESSES: 4,
          POPULATION: 20,
        }),
      0,
    ),
    1e-9,
  );
  eq(
    "hypergeometric cdf at max",
    call("hypergeometricCdf", {
      K: 9,
      DRAWN: 10,
      SUCCESSES: 4,
      POPULATION: 20,
    }),
    1,
  );
}
close(
  "normal z-score",
  call("normalZScore", { VALUE: 2, MEAN: 1, DEVIATION: 0.5 }),
  2,
);
close("uniform pdf", call("uniformPdf", { X: 0.5, LOW: 0, HIGH: 1 }), 1);
close("uniform cdf", call("uniformCdf", { X: 0.25, LOW: 0, HIGH: 1 }), 0.25);
eq(
  "shannon entropy of four equal bins",
  call("listShannonEntropy", { LIST: lst([1, 1, 1, 1]) }),
  2,
);
close(
  "shannon entropy of halves",
  call("listShannonEntropy", { LIST: lst([1, 1]) }),
  1,
);
close(
  "shannon entropy empty",
  call("listShannonEntropy", { LIST: lst([]) }),
  0,
);
isNan(
  "sample size invalid level",
  call("sampleSizeForMargin", { SIGMA: 1, MARGIN: 1, LEVEL: 0 }),
);
close(
  "sample size for margin",
  call("sampleSizeForMargin", { SIGMA: 10, MARGIN: 2, LEVEL: 0.95 }),
  97,
);

/* ---------------- physics ---------------- */
const C_LIGHT = 299792458;
const G = 6.6743e-11;
close("kinetic energy", call("kineticEnergy", { MASS: 2, VELOCITY: 3 }), 9);
close(
  "potential energy",
  call("potentialEnergy", { MASS: 2, HEIGHT: 10 }),
  2 * 9.80665 * 10,
);
close(
  "elastic energy",
  call("elasticEnergy", { SPRING_CONSTANT: 100, EXTENSION: 0.5 }),
  12.5,
);
close("momentum", call("momentumOf", { MASS: 2, VELOCITY: 3 }), 6);
close("impulse", call("impulseOf", { MASS: 2, CHANGE_IN_VELOCITY: 3 }), 6);
close(
  "mass from momentum",
  call("massFromMomentum", { MOMENTUM: 6, VELOCITY: 3 }),
  2,
);
close(
  "speed from kinetic energy",
  call("speedFromKineticEnergy", { MASS: 2, ENERGY: 9 }),
  3,
);
close("work", call("workDone", { FORCE: 10, DISTANCE: 5, ANGLE: 0 }), 50);
within(
  "work at 90 degrees",
  call("workDone", { FORCE: 10, DISTANCE: 5, ANGLE: 90 }),
  0,
  1e-12,
);
close("power", call("powerFromWork", { WORK: 100, TIME: 4 }), 25);
close(
  "force from acceleration",
  call("forceFromAcceleration", { MASS: 3, ACCELERATION: 2 }),
  6,
);
close("weight", call("weightOf", { MASS: 1, GRAVITY: 9.80665 }), 9.80665);
close(
  "earth moon gravity",
  call("gravitationalForce", {
    MASS1: 5.9722e24,
    MASS2: 7.342e22,
    DISTANCE: 3.844e8,
  }),
  1.9821e20,
  1e-3,
);
within(
  "surface gravity of earth",
  call("surfaceGravityOf", { MASS: 5.9722e24, RADIUS: 6.371e6 }),
  9.8203,
  1e-2,
);
close(
  "hooke force",
  call("hookeLawForce", { SPRING_CONSTANT: 100, EXTENSION: 0.2 }),
  20,
);
close(
  "centripetal force",
  call("centripetalForce", { MASS: 2, VELOCITY: 10, RADIUS: 5 }),
  40,
);
close(
  "centripetal acceleration",
  call("centripetalAcceleration", { VELOCITY: 10, RADIUS: 5 }),
  20,
);
close("density", call("densityOf", { MASS: 1000, VOLUME: 2 }), 500);
close("pressure", call("pressureFromForce", { FORCE: 100, AREA: 0.5 }), 200);
close(
  "buoyant force",
  call("buoyantForce", { VOLUME: 0.001, FLUID_DENSITY: 1000 }),
  9.80665,
);
close(
  "archimedes displaced mass",
  call("archimedesDisplacedMass", { VOLUME: 0.001, FLUID_DENSITY: 1000 }),
  1,
);
close(
  "apparent weight",
  call("apparentWeightInFluid", {
    MASS: 1.2,
    VOLUME: 0.0012,
    FLUID_DENSITY: 1000,
  }),
  1.2 * 9.80665 - 0.0012 * 1000 * 9.80665,
);
close(
  "angular velocity",
  call("angularVelocityFromPeriod", { PERIOD: 2 }),
  Math.PI,
);
close(
  "period",
  call("periodFromAngularVelocity", { ANGULAR_VELOCITY: Math.PI }),
  2,
);
close("rpm to rad/s", call("rpmToRadiansPerSecond", { RPM: 60 }), 2 * Math.PI);
close(
  "rad/s to rpm",
  call("radiansPerSecondToRpm", { RADIANS_PER_SECOND: 2 * Math.PI }),
  60,
);
close(
  "inertia point",
  call("momentOfInertiaPoint", { MASS: 2, RADIUS: 3 }),
  18,
);
close("inertia rod", call("momentOfInertiaRod", { MASS: 12, LENGTH: 1 }), 1);
close(
  "inertia sphere",
  call("momentOfInertiaSphere", { MASS: 5, RADIUS: 2 }),
  8,
);
close(
  "rotational energy",
  call("rotationalKineticEnergy", { INERTIA: 2, ANGULAR_VELOCITY: 10 }),
  100,
);
close(
  "torque",
  call("torqueFromForce", { FORCE: 10, LEVER_ARM: 0.5, ANGLE: 90 }),
  5,
);
within(
  "torque parallel",
  call("torqueFromForce", { FORCE: 10, LEVER_ARM: 0.5, ANGLE: 0 }),
  0,
  1e-12,
);
close(
  "wave speed",
  call("waveSpeed", { FREQUENCY: 440, WAVELENGTH: 0.78 }),
  343.2,
);
close(
  "wave frequency",
  call("frequencyFromWave", { SPEED: 343.2, WAVELENGTH: 0.78 }),
  440,
);
close("wave period", call("wavePeriod", { FREQUENCY: 440 }), 1 / 440);
eq(
  "beats",
  call("beatsPerSecond", { FIRST_FREQUENCY: 440, SECOND_FREQUENCY: 443 }),
  3,
);
within(
  "doppler approaching",
  call("dopplerShift", { SPEED: 10, FREQUENCY: 440, APPROACHING: 1 }),
  (440 * 343) / 333,
  1e-9,
);
within(
  "doppler receding",
  call("dopplerShift", { SPEED: 10, FREQUENCY: 440, APPROACHING: 0 }),
  (440 * 343) / 353,
  1e-9,
);
close(
  "snell refraction",
  call("snellRefraction", { INDEX1: 1, ANGLE1: 90, INDEX2: 2 }),
  30,
);
close(
  "critical angle",
  call("criticalAngle", { INDEX1: 1.5, INDEX2: 1 }),
  (180 / Math.PI) * Math.asin(1 / 1.5),
);
close("refractive index", call("indexOfRefraction", { SPEED: C_LIGHT / 2 }), 2);
close(
  "lens image distance",
  call("lensImageDistance", { FOCAL_LENGTH: 0.1, OBJECT_DISTANCE: 0.2 }),
  0.2,
);
close(
  "lens magnification",
  call("lensMagnification", { FOCAL_LENGTH: 0.1, OBJECT_DISTANCE: 0.2 }),
  -1,
);
close(
  "photon energy",
  call("photonEnergy", { FREQUENCY: 1e15 }),
  6.62607015e-19,
);
close(
  "photon wavelength",
  call("photonWavelength", { ENERGY: 6.62607015e-19 }),
  C_LIGHT / 1e15,
  1e-9,
);
close(
  "de broglie wavelength",
  call("deBroglieWavelength", { MOMENTUM: 1 }),
  6.62607015e-34,
);
close(
  "bohr ground state",
  call("bohrEnergyLevel", { LEVEL: 1 }),
  -13.605693122994 * 1.602176634e-19,
  1e-9,
);
close(
  "bohr level 2",
  call("bohrEnergyLevel", { LEVEL: 2 }),
  (-13.605693122994 * 1.602176634e-19) / 4,
  1e-9,
);
close(
  "hydrogen lyman alpha",
  call("hydrogenWavelength", { LEVEL: 2, TO_LEVEL: 1 }),
  121.47,
  1e-3,
);
{
  const beta = 0.9;
  const speed = beta * C_LIGHT;
  close(
    "lorentz factor",
    call("lorentzFactor", { VELOCITY: speed }),
    1 / Math.sqrt(1 - beta * beta),
  );
  close(
    "relativistic mass",
    call("relativisticMass", { REST_MASS: 1, VELOCITY: speed }),
    1 / Math.sqrt(1 - beta * beta),
  );
  close(
    "relativistic momentum",
    call("relativisticMomentum", { REST_MASS: 1, VELOCITY: speed }),
    (beta / Math.sqrt(1 - beta * beta)) * C_LIGHT,
    1e-3,
  );
  close(
    "relativistic energy",
    call("relativisticEnergy", { REST_MASS: 1, VELOCITY: speed }),
    (1 / Math.sqrt(1 - beta * beta) - 1) * C_LIGHT ** 2,
    1e-6,
  );
  close(
    "time dilation",
    call("timeDilation", { VELOCITY: speed, PROPER_TIME: 2 }),
    2 / Math.sqrt(1 - beta * beta),
  );
  close(
    "length contraction",
    call("lengthContraction", { VELOCITY: speed, PROPER_LENGTH: 2 }),
    2 * Math.sqrt(1 - beta * beta),
  );
}
close(
  "energy from mass",
  call("energyFromMass", { MASS: 1e-9 }),
  1e-9 * C_LIGHT ** 2,
);
close(
  "mass from energy",
  call("massFromEnergy", { ENERGY: 1e-9 * C_LIGHT ** 2 }),
  1e-9,
  1e-9,
);
close(
  "rest mass from energy momentum",
  call("energyMomentumRelation", { ENERGY: 1.5e-10, MOMENTUM: 0 }),
  1.5e-10 / C_LIGHT ** 2,
  1e-9,
);
close(
  "coulomb force",
  call("coulombForce", { CHARGE1: 1e-6, CHARGE2: 1e-6, DISTANCE: 1 }),
  8.987551792261171e-3,
  1e-12,
);
close(
  "electric field",
  call("electricFieldOfCharge", { CHARGE: 1e-6, DISTANCE: 1 }),
  8987.5517923,
  1e-6,
);
close(
  "electric potential energy",
  call("electricPotentialEnergy", {
    CHARGE1: 1e-6,
    CHARGE2: 1e-6,
    DISTANCE: 1,
  }),
  8987.5517923e-6,
  1e-6,
);
close(
  "current from power",
  call("currentFromPower", { POWER: 2300, VOLTAGE: 230 }),
  10,
);
close(
  "resistance from ohm",
  call("resistanceFromOhm", { VOLTAGE: 230, CURRENT: 2 }),
  115,
);
close(
  "electrical power",
  call("electricalPower", { VOLTAGE: 230, CURRENT: 2 }),
  460,
);
close(
  "capacitor energy",
  call("capacitorEnergy", { CAPACITANCE: 1e-6, VOLTAGE: 10 }),
  5e-5,
);
close(
  "magnetic force",
  call("magneticForce", { CHARGE: 2, VELOCITY: 3, FIELD: 4, ANGLE: 90 }),
  24,
);
close(
  "cyclotron frequency",
  call("cyclotronFrequency", {
    MASS: 9.1093837015e-31,
    CHARGE: 1.602176634e-19,
    FIELD: 1,
  }),
  2.79924898729e10,
  1e-8,
);
close(
  "thermal energy",
  call("thermalEnergyChange", {
    MASS: 2,
    SPECIFIC_HEAT: 4184,
    TEMPERATURE_CHANGE: 10,
  }),
  83680,
);
close(
  "ideal gas pressure",
  call("idealGasPressure", { AMOUNT: 1, TEMPERATURE: 300, VOLUME: 0.024617 }),
  101320,
  1e-3,
);
{
  const n = 1,
    t = 300,
    p = 101325;
  const volume = call("idealGasVolume", {
    AMOUNT: n,
    TEMPERATURE: t,
    PRESSURE: p,
    VOLUME: 0.024617,
  });
  close(
    "ideal gas temperature",
    call("idealGasTemperature", { AMOUNT: n, PRESSURE: p, VOLUME: volume }),
    t,
    1e-9,
  );
}
close(
  "van der waals pressure",
  call("vanDerWaalsPressure", {
    AMOUNT: 1,
    TEMPERATURE: 300,
    VOLUME: 0.024617,
    A: 0.137,
    B: 3.19e-5,
  }),
  (8.314462618 * 300) / (0.024617 - 3.19e-5) - 0.137 / 0.024617 ** 2,
  1e-9,
);
close(
  "thermal efficiency",
  call("thermalEfficiency", { WORK_OUTPUT: 300, HEAT_INPUT: 1000 }),
  0.3,
);
close(
  "carnot efficiency",
  call("carnotEfficiency", { HOT_TEMPERATURE: 500, COLD_TEMPERATURE: 300 }),
  0.4,
);
close(
  "heat engine work",
  call("heatEngineWork", { HEAT_INPUT: 1000, HEAT_OUTPUT: 700 }),
  300,
);
close(
  "stefan boltzmann",
  call("stefanBoltzmannFlux", { TEMPERATURE: 5778 }),
  5.670374419e-8 * 5778 ** 4,
  1e-12,
);
close(
  "peak wavelength",
  call("peakWavelength", { TEMPERATURE: 5778 }),
  2.897771955e-3 / 5778,
  1e-9,
);
close(
  "half life one",
  call("halfLifeRemaining", { HALF_LIFE: 5730, ELAPSED: 5730 }),
  0.5,
);
eq(
  "half life zero",
  call("halfLifeRemaining", { HALF_LIFE: 5730, ELAPSED: 0 }),
  1,
);
close(
  "activity from decay",
  call("activityFromDecay", { ATOMS: 1e12, HALF_LIFE: 5730 }),
  (Math.LN2 / 5730) * 1e12,
  1e-9,
);
ok(
  "speed in medium positive",
  call("speedInMedium", { DENSITY: 1000, BULK_MODULUS: 2.2e9 }) > 0,
);
ok(
  "photon flux positive",
  call("photonFluxOfPower", { POWER: 1000, FREQUENCY: 1e15 }) > 0,
);
ok(
  "resistance from geometry positive",
  call("resistanceFromGeometry", {
    RESISTIVITY: 1.68e-8,
    LENGTH: 10,
    AREA: 1e-6,
  }) > 0,
);

/* ---------------- astronomy ---------------- */
const AU = 1.495978707e11;
const SUN = 1.98847e30;
close(
  "orbital period of earth",
  call("orbitalPeriod", { RADIUS: AU, CENTRAL_MASS: SUN }),
  365.256363 * 86400,
  1e-4,
);
close(
  "orbital speed of earth",
  call("orbitalSpeed", { RADIUS: AU, CENTRAL_MASS: SUN }),
  29784.69,
  1e-4,
);
close(
  "orbital radius from period",
  call("orbitalRadius", { PERIOD: 365.256363 * 86400, CENTRAL_MASS: SUN }),
  AU,
  1e-4,
);
close(
  "circular orbit speed",
  call("circularOrbitSpeed", { RADIUS: AU, PERIOD: 365.256363 * 86400 }),
  29784.69,
  1e-4,
);
close("mean motion", call("meanMotion", { PERIOD: 100 }), (2 * Math.PI) / 100);
close(
  "escape velocity of earth",
  call("escapeVelocity", { MASS: 5.9722e24, RADIUS: 6.371e6 }),
  11186.1,
  1e-3,
);
close(
  "escape velocity of sun",
  call("escapeVelocity", { MASS: SUN, RADIUS: 6.957e8 }),
  617667,
  1e-4,
);
close(
  "schwarzschild radius of sun",
  call("schwarzschildRadius", { MASS: SUN }),
  (2 * G * SUN) / C_LIGHT ** 2,
  1e-9,
);
close(
  "orbital eccentricity",
  call("orbitalEccentricity", { PERIAPSIS: 1e10, APOAPSIS: 2e10 }),
  1 / 3,
);
close(
  "semi major axis",
  call("semiMajorAxis", { PERIAPSIS: 1e10, APOAPSIS: 2e10 }),
  1.5e10,
);
close("synodic period", call("synodicPeriod", { PERIOD1: 1, PERIOD2: 2 }), 2);
ok(
  "hill radius positive",
  call("hillRadius", {
    SEMI_MAJOR_AXIS: AU,
    ECCENTRICITY: 0.01,
    BODY_MASS: 5.9722e24,
    CENTRAL_MASS: SUN,
  }) > 1.4e9,
);
ok(
  "roche limit positive",
  call("rocheLimit", {
    BODY_RADIUS: 6.371e6,
    BODY_DENSITY: 5514,
    SATELLITE_DENSITY: 3344,
  }) > 1e7,
);
close(
  "light travel seconds",
  call("lightTravelSeconds", { DISTANCE: C_LIGHT * 3 }),
  3,
);
close(
  "distance from light time",
  call("distanceFromLightTime", { SECONDS: 3 }),
  C_LIGHT * 3,
);
close(
  "light years to years",
  call("lightTravelYears", { LIGHT_YEARS: 4.2 }),
  4.2,
);
close(
  "light time from distance",
  call("lightTimeFromDistance", { DISTANCE: 9.4607304725808e15 }),
  1,
  1e-9,
);
close(
  "distance from parallax",
  call("distanceFromParallax", { PARALLAX: 0.1 }),
  10,
);
close(
  "parallax from distance",
  call("parallaxFromDistance", { DISTANCE: 10 }),
  0.1,
);
within(
  "brightness to magnitude",
  call("brightnessToMagnitude", { BRIGHTNESS: 1 }),
  0,
  1e-12,
);
close(
  "magnitude difference",
  call("magnitudeDifference", { BRIGHTNESS1: 1, BRIGHTNESS2: 0.25 }),
  -2.5 * Math.log10(4),
);
close(
  "brightness from magnitude",
  call("brightnessFromMagnitude", { MAGNITUDE: -2.5 * Math.log10(4) }),
  4,
  1e-9,
);
close(
  "absolute magnitude",
  call("absoluteMagnitude", { APPARENT: 5, DISTANCE: 100 }),
  0,
);
close(
  "distance from absolute magnitude",
  call("distanceFromAbsoluteMagnitude", { APPARENT: 0, ABSOLUTE: 5 }),
  1,
);
close(
  "distance from absolute magnitude equal",
  call("distanceFromAbsoluteMagnitude", { APPARENT: 5, ABSOLUTE: 5 }),
  10,
);
close(
  "angular diameter of the sun",
  call("angularDiameterDegrees", { DIAMETER: 1.3914e9, DISTANCE: AU }),
  0.53291,
  1e-4,
);
close(
  "angular diameter arcseconds",
  call("angularDiameterArcseconds", { DIAMETER: 1.3914e9, DISTANCE: AU }),
  0.53291 * 3600,
  1e-3,
);
close(
  "distance from angular size",
  call("distanceFromAngularSize", { DIAMETER: 1.3914e9, ANGLE: 0.53291 }),
  AU,
  1e-3,
);
close("solar constant", call("solarConstant", { DISTANCE: AU }), 1361.17, 1e-3);
close(
  "habitable zone inner",
  call("habitableZoneInner", { STAR_LUMINOSITY: 1 }),
  AU / Math.sqrt(1.107),
);
close(
  "habitable zone outer",
  call("habitableZoneOuter", { STAR_LUMINOSITY: 1 }),
  AU / Math.sqrt(0.356),
);
close(
  "star luminosity",
  call("starLuminosity", { STAR_LUMINOSITY: 2 }),
  2 * 3.828e26,
);
ok(
  "planck radiance positive",
  call("planckRadiance", { WAVELENGTH: 500e-9, TEMPERATURE: 5778 }) > 0,
);
close(
  "redshift to velocity",
  call("redshiftToVelocity", { REDSHIFT: 0.1 }),
  (C_LIGHT * (1.21 - 1)) / (1.21 + 1),
  1e-9,
);
close(
  "velocity to redshift",
  call("velocityToRedshift", { VELOCITY: (C_LIGHT * (1.21 - 1)) / (1.21 + 1) }),
  0.1,
  1e-9,
);

/* ---------------- discrete maths ---------------- */
eq(
  "modular reduce negative",
  call("modularReduceOf", { VALUE: -7, MODULUS: 5 }),
  3,
);
eq("modular add", call("modularAddOf", { A: 3, B: 4, MODULUS: 5 }), 2);
eq(
  "modular multiply",
  call("modularMultiplyOf", { A: 3, B: 4, MODULUS: 5 }),
  2,
);
eq(
  "modular power",
  call("modularPowerOf", { BASE: 2, EXPONENT: 10, MODULUS: 1000 }),
  24,
);
eq(
  "modular power zero exponent",
  call("modularPowerOf", { BASE: 7, EXPONENT: 0, MODULUS: 5 }),
  1,
);
eq(
  "modular power large modulus",
  call("modularPowerOf", { BASE: 7, EXPONENT: 123456789, MODULUS: 1000000007 }),
  467332791,
);
eq(
  "modular power fermat",
  call("modularPowerOf", {
    BASE: 49,
    EXPONENT: 1000000006,
    MODULUS: 1000000007,
  }),
  1,
);
eq(
  "modular power mersenne",
  call("modularPowerOf", { BASE: 2, EXPONENT: 31, MODULUS: 2147483647 }),
  1,
);
eq(
  "modular power 32 bit",
  call("modularPowerOf", {
    BASE: 123456789,
    EXPONENT: 65537,
    MODULUS: 4294967291,
  }),
  3923696565,
);
eq(
  "modular power base reduced",
  call("modularPowerOf", { BASE: 999999999, EXPONENT: 3, MODULUS: 7 }),
  6,
);
isNan(
  "modular power negative exponent",
  call("modularPowerOf", { BASE: 3, EXPONENT: -2, MODULUS: 7 }),
);
isNan(
  "modular power zero modulus",
  call("modularPowerOf", { BASE: 3, EXPONENT: 2, MODULUS: 0 }),
);
eq(
  "modular inverse 10 mod 17",
  call("modularInverse", { VALUE: 10, MODULUS: 17 }),
  12,
);
isNan(
  "modular inverse non coprime",
  call("modularInverse", { VALUE: 5, MODULUS: 25 }),
);
eq("modular inverse", call("modularInverse", { VALUE: 3, MODULUS: 11 }), 4);
eq(
  "modular inverse negative",
  call("modularInverse", { VALUE: -3, MODULUS: 11 }),
  7,
);
isNan(
  "modular inverse when not coprime",
  call("modularInverse", { VALUE: 2, MODULUS: 4 }),
);
eq(
  "chinese remainder",
  call("chineseRemainder", {
    REMAINDER1: 2,
    MODULUS1: 3,
    REMAINDER2: 3,
    MODULUS2: 5,
  }),
  8,
);
eq(
  "chinese remainder negative remainder",
  call("chineseRemainder", {
    REMAINDER1: -1,
    MODULUS1: 3,
    REMAINDER2: 0,
    MODULUS2: 5,
  }),
  5,
);
isNan(
  "chinese remainder non coprime",
  call("chineseRemainder", {
    REMAINDER1: 1,
    MODULUS1: 4,
    REMAINDER2: 1,
    MODULUS2: 6,
  }),
);
arrEq(
  "arithmetic sequence",
  call("arithmeticSequenceList", { TERMS: 5, FIRST: 1, DIFFERENCE: 2 }),
  [1, 3, 5, 7, 9],
);
arrEq(
  "geometric sequence",
  call("geometricSequenceList", { TERMS: 5, FIRST: 1, RATIO: 2 }),
  [1, 2, 4, 8, 16],
);
arrEq(
  "fibonacci sequence",
  call("fibonacciSequenceList", { TERMS: 8 }),
  [0, 1, 1, 2, 3, 5, 8, 13],
);
arrEq(
  "tribonacci sequence",
  call("tribonacciSequenceList", { TERMS: 8 }),
  [0, 0, 1, 1, 2, 4, 7, 13],
);
arrEq(
  "first differences",
  call("firstDifferencesList", { LIST: lst([1, 4, 9, 16]) }),
  [3, 5, 7],
);
arrEq(
  "second differences",
  call("secondDifferencesList", { LIST: lst([1, 4, 9, 16]) }),
  [2, 2],
);
arrEq(
  "running product",
  call("runningProductList", { LIST: lst([2, 3, 4]) }),
  [2, 6, 24],
);
eq(
  "alternating sum",
  call("alternatingSumValue", { LIST: lst([1, 2, 3, 4]) }),
  -2,
);
arrEq(
  "cumulative mean",
  call("cumulativeMeanList", { LIST: lst([1, 2, 3]) }),
  [1, 1.5, 2],
);
arrEq(
  "continued fraction of pi",
  call("continuedFractionList", { VALUE: Math.PI, TERMS: 6 }),
  [3, 7, 15, 1, 292, 1],
);
arrEq(
  "rational approximation of pi",
  call("rationalApproximationList", { VALUE: Math.PI, MAX_DENOMINATOR: 100 }),
  [22, 7],
);
arrEq(
  "rational approximation of pi 1000",
  call("rationalApproximationList", { VALUE: Math.PI, MAX_DENOMINATOR: 1000 }),
  [355, 113],
);
arrEq(
  "rational approximation of negative pi",
  call("rationalApproximationList", { VALUE: -Math.PI, MAX_DENOMINATOR: 100 }),
  [-22, 7],
);
arrEq(
  "rational approximation of integer",
  call("rationalApproximationList", { VALUE: 4, MAX_DENOMINATOR: 10 }),
  [4, 1],
);
eq(
  "number in words",
  call("numberInWords", { VALUE: 1234 }),
  "one thousand two hundred thirty four",
);
eq("zero in words", call("numberInWords", { VALUE: 0 }), "zero");
eq(
  "negative in words",
  call("numberInWords", { VALUE: -42 }),
  "minus forty two",
);
eq(
  "million in words",
  call("numberInWords", { VALUE: 1000000 }),
  "one million",
);
eq("ordinal suffix first", call("ordinalSuffix", { VALUE: 1 }), "st");
eq("ordinal suffix second", call("ordinalSuffix", { VALUE: 2 }), "nd");
eq("ordinal suffix third", call("ordinalSuffix", { VALUE: 3 }), "rd");
eq("ordinal suffix eleventh", call("ordinalSuffix", { VALUE: 11 }), "th");
eq("ordinal suffix twenty second", call("ordinalSuffix", { VALUE: 22 }), "nd");
eq("happy number", call("isHappyNumber", { VALUE: 19 }), true);
eq("unhappy number", call("isHappyNumber", { VALUE: 4 }), false);
arrEq(
  "happy sequence",
  call("happyNumberSequence", { VALUE: 19, TERMS: 4 }),
  [19, 82, 68, 100],
);
eq("hamming distance", call("hammingDistance", { A: 1011, B: 1001 }), 1);
eq("hamming distance two", call("hammingDistance", { A: 1011, B: 1000 }), 2);
eq("hamming distance equal", call("hammingDistance", { A: 42, B: 42 }), 0);

/* ---------------- data ---------------- */
const data = lst([1, 2, 2, 3, 4, 8, 13]);
close(
  "root mean square",
  call("rootMeanSquareOfList", { LIST: data }),
  Math.sqrt(267 / 7),
  1e-9,
);
close(
  "rms direct",
  call("rootMeanSquareOfList", { LIST: lst([3, 4]) }),
  Math.sqrt(12.5),
);
const symmetric = lst([-2, -1, 0, 1, 2]);
within(
  "skewness of symmetric list",
  call("listSkewness", { LIST: symmetric }),
  0,
  1e-12,
);
close(
  "kurtosis of uniform list",
  call("listKurtosis", { LIST: lst([-1, -1, 0, 1, 1]) }),
  -3,
  1e-9,
);
within(
  "kurtosis of large uniform sample",
  call("listKurtosis", { LIST: lst(series(2000, (i) => ((i * 37) % 11) - 5)) }),
  -1.2,
  0.25,
);
arrClose(
  "moving average",
  call("movingAverageOfList", { LIST: lst([1, 2, 3, 4, 5]), WINDOW: 3 }),
  [1, 1.5, 2, 3, 4],
  1e-9,
);
arrEq(
  "moving average of one",
  call("movingAverageOfList", { LIST: lst([1, 2, 3]), WINDOW: 1 }),
  [1, 2, 3],
);
arrEq(
  "exponential smoothing alpha 1",
  call("exponentialSmoothingList", { LIST: lst([1, 2, 3]), ALPHA: 1 }),
  [1, 2, 3],
);
close(
  "exponential smoothing alpha 0.5",
  call("exponentialSmoothingList", { LIST: lst([1, 2, 3]), ALPHA: 0.5 })[2],
  2.25,
);
arrEq(
  "histogram counts",
  call("histogramCountsList", { LIST: lst([1, 2, 3, 4, 5, 6]), BINS: 3 }),
  [2, 2, 2],
);
arrEq(
  "histogram constant list",
  call("histogramCountsList", { LIST: lst([5, 5, 5]), BINS: 4 }),
  [3, 0, 0, 0],
);
{
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  const m = mean(values);
  const sd = Math.sqrt(variance(values));
  const interval = call("confidenceIntervalList", {
    LIST: lst(values),
    LEVEL: 0.95,
  });
  close(
    "confidence interval low",
    interval[0],
    m - (1.959963985 * sd) / Math.sqrt(values.length),
    1e-6,
  );
  close(
    "confidence interval high",
    interval[1],
    m + (1.959963985 * sd) / Math.sqrt(values.length),
    1e-6,
  );
}
{
  const xs = [0, 1, 2, 3, 4];
  const ys = xs.map((x) => 3 * x - 2);
  arrClose(
    "linear fit",
    call("polynomialFitList", { XS: lst(xs), YS: lst(ys), DEGREE: 1 }),
    [3, -2],
    1e-8,
  );
  const quad = call("polynomialFitList", {
    XS: lst(xs),
    YS: lst(xs.map((x) => x * x)),
    DEGREE: 2,
  });
  close("quadratic fit quadratic", quad[0], 1, 1e-6);
  close("quadratic fit constant", quad[2], 0, 1e-6);
  const cubic = call("polynomialFitList", {
    XS: lst(xs),
    YS: lst(xs.map((x) => 2 * x ** 3 - x)),
    DEGREE: 3,
  });
  close("cubic fit cubic", cubic[0], 2, 1e-6);
  close("cubic fit linear", cubic[2], -1, 1e-6);
}
close(
  "linear interpolation",
  call("linearInterpolateList", {
    XS: lst([1, 2, 3]),
    YS: lst([10, 20, 30]),
    X: 1.5,
  }),
  15,
);
close(
  "linear interpolation clamps low",
  call("linearInterpolateList", {
    XS: lst([1, 2, 3]),
    YS: lst([10, 20, 30]),
    X: 0,
  }),
  10,
);
close(
  "linear interpolation clamps high",
  call("linearInterpolateList", {
    XS: lst([1, 2, 3]),
    YS: lst([10, 20, 30]),
    X: 99,
  }),
  30,
);
{
  const z = call("normalisedList", { LIST: lst([1, 2, 3, 4, 5]) });
  within("normalised mean", mean(z), 0, 1e-12);
  close(
    "normalised stddev",
    Math.sqrt(z.reduce((a, b) => a + b * b, 0) / z.length),
    1,
    1e-9,
  );
}
eq(
  "outlier count",
  call("outlierCount", { LIST: lst([1, 2, 3, 4, 5, 100]), MULTIPLIER: 1.5 }),
  1,
);
eq(
  "outlier count none",
  call("outlierCount", { LIST: lst([1, 2, 3, 4, 5]), MULTIPLIER: 1.5 }),
  0,
);
ok("list summary", call("listSummary", { LIST: data }).startsWith("count 7"));
ok(
  "list summary empty",
  call("listSummary", { LIST: lst([]) }) === "empty list",
);
close(
  "list entropy",
  call("listEntropyBits", { LIST: lst([1, 1, 2, 2]) }),
  1.9182958340544896,
  1e-12,
);
close("list entropy single", call("listEntropyBits", { LIST: lst([5]) }), 0);

/* ---------------- samplers ---------------- */
{
  const draws = series(20000, () => call("standardNormalSample", {}));
  within("standard normal mean", mean(draws), 0, 0.05);
  within("standard normal variance", variance(draws), 1, 0.05);
  const uniform = series(5000, () =>
    call("uniformSample", { LOW: 2, HIGH: 4 }),
  );
  within("uniform mean", mean(uniform), 3, 0.05);
  ok(
    "uniform in range",
    uniform.every((v) => v >= 2 && v <= 4),
  );
  const integers = series(5000, () =>
    call("uniformIntegerSample", { LOW: 1, HIGH: 3 }),
  );
  ok(
    "integer sample in range",
    integers.every((v) => Number.isInteger(v) && v >= 1 && v <= 3),
  );
  within("integer sample mean", mean(integers), 2, 0.05);
  const binomial = series(20000, () =>
    call("binomialSample", { TRIALS: 10, PROBABILITY: 0.3 }),
  );
  within("binomial sample mean", mean(binomial), 3, 0.06);
  ok(
    "binomial sample in range",
    binomial.every((v) => v >= 0 && v <= 10),
  );
  const poisson = series(20000, () => call("poissonSample", { RATE: 5 }));
  within("poisson sample mean", mean(poisson), 5, 0.1);
  const geometric = series(20000, () =>
    call("geometricSample", { PROBABILITY: 0.25 }),
  );
  within("geometric sample mean", mean(geometric), 4, 0.2);
  const gamma = series(20000, () =>
    call("gammaSample", { SHAPE: 3, SCALE: 2 }),
  );
  within("gamma sample mean", mean(gamma), 6, 0.15);
  const beta = series(20000, () => call("betaSample", { A: 2, B: 3 }));
  within("beta sample mean", mean(beta), 0.4, 0.02);
  ok(
    "beta sample in range",
    beta.every((v) => v >= 0 && v <= 1),
  );
  const weibull = series(20000, () =>
    call("weibullSample", { SHAPE: 2, SCALE: 1 }),
  );
  within("weibull sample mean", mean(weibull), Math.sqrt(Math.PI) / 2, 0.02);
  const laplace = series(20000, () =>
    call("laplaceSample", { LOCATION: 0, SCALE: 1 }),
  );
  within("laplace sample mean", mean(laplace), 0, 0.05);
  const chi = series(20000, () =>
    call("chiSquareSample", { DEGREES_OF_FREEDOM: 4 }),
  );
  within("chi-square sample mean", mean(chi), 4, 0.15);
  const student = series(20000, () =>
    call("studentTSample", { DEGREES_OF_FREEDOM: 5 }),
  );
  within("student-t sample median", median(student), 0, 0.05);
  const hyper = series(5000, () =>
    call("hypergeometricSample", { DRAWN: 10, SUCCESSES: 4, POPULATION: 20 }),
  );
  within("hypergeometric sample mean", mean(hyper), 2, 0.1);
  const negativeBinomial = series(5000, () =>
    call("negativeBinomialSample", { SUCCESSES: 3, PROBABILITY: 0.5 }),
  );
  within("negative binomial sample mean", mean(negativeBinomial), 6, 0.3);
  const lognormal = series(20000, () =>
    call("logNormalSample", { MEAN: 0, DEVIATION: 1 }),
  );
  within("log-normal sample mean", mean(lognormal), Math.exp(0.5), 0.08);
  const cauchy = series(20000, () =>
    call("cauchySample", { LOCATION: 0, SCALE: 1 }),
  );
  within("cauchy sample median", median(cauchy), 0, 0.1);
  ok("cauchy sample has heavy tail", Math.max(...cauchy.map(Math.abs)) > 100);
  const shuffled = call("shuffledList", { LIST: lst([1, 2, 3, 4, 5, 6]) });
  eq("shuffled length", shuffled.length, 6);
  arrEq(
    "shuffled contents",
    [...shuffled].sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6],
  );
  const picked = call("randomSampleWithoutReplacement", {
    LIST: lst([1, 2, 3, 4, 5]),
    COUNT: 3,
  });
  eq("sample without replacement length", picked.length, 3);
  eq("sample without replacement unique", new Set(picked).size, 3);
  const bernoulli = series(20000, () =>
    call("bernoulliSample", { PROBABILITY: 0.25 }),
  );
  within("bernoulli sample mean", mean(bernoulli), 0.25, 0.02);
  ok(
    "bernoulli sample binary",
    bernoulli.every((v) => v === 0 || v === 1),
  );
}
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/* ---------------- summary ---------------- */
console.log(`checks run: ${checks}`);
if (failures.length) {
  console.log(`FAILURES: ${failures.length}`);
  for (const line of failures) console.log(" -", line);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
fs.writeFileSync(`${COVERAGE_DIR}/${TAG}.json`, JSON.stringify([...called]));
console.log(
  `opcodes exercised: ${called.size} / ${Object.keys(byOpcode).length}`,
);
console.log(
  "not exercised:",
  Object.keys(byOpcode)
    .filter((o) => !called.has(o))
    .join(" "),
);
