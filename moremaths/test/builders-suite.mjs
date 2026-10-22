import {
  registered as ext,
  defaultArgs,
  blockSpecs,
  menuItems,
  util,
} from "./harness.mjs";

import fs from "node:fs";

const COVERAGE_DIR = new URL(".coverage/", import.meta.url).pathname;
fs.mkdirSync(COVERAGE_DIR, { recursive: true });
const TAG = "v5";

let checks = 0;
const failures = [];
const byOpcode = Object.fromEntries(blockSpecs().map((b) => [b.opcode, b]));
const called = new Set();
function call(opcode, overrides = {}) {
  called.add(opcode);
  const entry = byOpcode[opcode];
  if (!entry) throw new Error(`unknown opcode ${opcode}`);
  for (const name of Object.keys(overrides)) {
    if (!(name in (entry.arguments || {})))
      failures.push(`${opcode}: unknown argument ${name}`);
  }
  const result = ext[opcode](defaultArgs(entry, overrides), util);
  return Array.isArray(result) ? result.join(", ") : result;
}
function eq(name, actual, expected) {
  checks += 1;
  if (!Object.is(actual, expected))
    failures.push(
      `${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
}
function close(name, actual, expected, relTol = 1e-9) {
  checks += 1;
  if (typeof actual !== "number" || !Number.isFinite(actual)) {
    failures.push(`${name}: expected ~${expected}, got ${actual}`);
    return;
  }
  const rel = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-30);
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
function isNan(name, actual) {
  checks += 1;
  if (!Number.isNaN(actual))
    failures.push(`${name}: expected NaN, got ${actual}`);
}
function ok(name, condition) {
  checks += 1;
  if (!condition) failures.push(`${name}: condition failed`);
}
function contains(name, actual, needle) {
  checks += 1;
  if (typeof actual !== "string" || !actual.includes(needle))
    failures.push(
      `${name}: expected text containing ${JSON.stringify(needle)}, got ${JSON.stringify(actual)}`,
    );
}
const listVars = new Map();
let listCounter = 0;
function lst(value) {
  const name = `L${(listCounter += 1)}`;
  let n = 0;
  const key = name;
  listVars.set(key, { id: key, type: "list", name: key, value });
  n += 1;
  util.target.lookupVariableById = (id) => listVars.get(id) || null;
  util.target.lookupVariableByNameAndType = (nm) => listVars.get(nm) || null;
  util.target.lookupList = (nm) => listVars.get(nm) || null;
  return key;
}

/* ---------------- generic dimension converters ---------------- */
const roundTrip = (name, opcode, valueArg, value, from, to, back) => {
  const forward = call(opcode, { [valueArg]: value, FROM: from, TO: to });
  close(`${name} forward`, forward, back.expected, 1e-12);
  const reverse = call(opcode, { [valueArg]: forward, FROM: to, TO: from });
  within(
    `${name} round trip`,
    reverse,
    value,
    1e-9 * Math.max(1, Math.abs(value)),
  );
};
roundTrip("convert length", "convertLength", "LENGTH", 1, "metre", "foot", {
  expected: 1 / 0.3048,
});
roundTrip(
  "convert area",
  "convertArea",
  "AREA",
  1,
  "squareMetre",
  "squareFoot",
  { expected: 1 / 0.09290304 },
);
roundTrip("convert volume", "convertVolume", "VOLUME", 1, "litre", "gallonUS", {
  expected: 0.001 / 0.003785411784,
});
roundTrip("convert time", "convertTime", "TIME", 90, "second", "minute", {
  expected: 1.5,
});
roundTrip(
  "convert speed",
  "convertSpeed",
  "SPEED",
  1,
  "metrePerSecond",
  "kilometrePerHour",
  { expected: 3.6 },
);
roundTrip(
  "convert acceleration",
  "convertAcceleration",
  "ACCELERATION",
  1,
  "metrePerSecondSquared",
  "standardGravity",
  { expected: 1 / 9.80665 },
);
roundTrip(
  "convert pressure",
  "convertPressure",
  "PRESSURE",
  101325,
  "pascal",
  "atmosphere",
  { expected: 1 },
);
roundTrip(
  "convert energy",
  "convertEnergy",
  "ENERGY",
  4184,
  "joule",
  "kilocalorie",
  { expected: 1 },
);
roundTrip("convert power", "convertPower", "POWER", 1000, "watt", "kilowatt", {
  expected: 1,
});
roundTrip("convert force", "convertForce", "FORCE", 1, "newton", "poundForce", {
  expected: 1 / 4.4482216152605,
});
roundTrip(
  "convert frequency",
  "convertFrequency",
  "FREQUENCY",
  1000,
  "hertz",
  "kilohertz",
  { expected: 1 },
);
roundTrip(
  "convert density",
  "convertDensity",
  "DENSITY",
  1000,
  "kilogramPerCubicMetre",
  "gramPerLitre",
  { expected: 1000 },
);
roundTrip(
  "convert flow",
  "convertFlow",
  "FLOW",
  1,
  "cubicMetrePerSecond",
  "litrePerMinute",
  { expected: 60000 },
);
roundTrip(
  "convert torque",
  "convertTorque",
  "TORQUE",
  1,
  "newtonMetre",
  "poundFoot",
  { expected: 1 / 1.3558179483314004 },
);
roundTrip(
  "convert radioactivity",
  "convertRadioactivity",
  "VALUE",
  1,
  "becquerel",
  "curie",
  { expected: 1 / 3.7e10 },
);
roundTrip("convert dose", "convertDose", "DOSE", 1, "gray", "sievert", {
  expected: 1,
});
close(
  "convert dose rad",
  call("convertDose", { DOSE: 1, FROM: "gray", TO: "rad" }),
  100,
  1e-12,
);
close(
  "convert dose milligray",
  call("convertDose", { DOSE: 2.5, FROM: "milligray", TO: "microsievert" }),
  2500,
  1e-12,
);
isNan(
  "convert dose cross dimension",
  call("convertDose", { DOSE: 1, FROM: "gray", TO: "becquerel" }),
);
close(
  "convert area hectares",
  call("convertArea", { AREA: 2, FROM: "hectare", TO: "acre" }),
  20000 / 4046.8564224,
  1e-12,
);
isNan(
  "convert unknown unit",
  call("convertLength", { LENGTH: 1, FROM: "banana", TO: "metre" }),
);
isNan(
  "convert unknown source",
  call("convertForce", { FORCE: 1, FROM: "banana", TO: "newton" }),
);

/* ---------------- sequence and list builders ---------------- */
eq(
  "arithmetic sequence list",
  call("arithmeticSequenceList", { TERMS: 6, FIRST: 1, DIFFERENCE: 2 }),
  "1, 3, 5, 7, 9, 11",
);
eq(
  "arithmetic sequence descending",
  call("arithmeticSequenceList", { TERMS: 4, FIRST: 10, DIFFERENCE: -2.5 }),
  "10, 7.5, 5, 2.5",
);
eq(
  "geometric sequence list",
  call("geometricSequenceList", { TERMS: 6, FIRST: 1, RATIO: 2 }),
  "1, 2, 4, 8, 16, 32",
);
eq(
  "geometric sequence fractional",
  call("geometricSequenceList", { TERMS: 3, FIRST: 8, RATIO: 0.5 }),
  "8, 4, 2",
);
eq(
  "fibonacci sequence list",
  call("fibonacciSequenceList", { TERMS: 8 }),
  "0, 1, 1, 2, 3, 5, 8, 13",
);
eq(
  "tribonacci sequence list",
  call("tribonacciSequenceList", { TERMS: 8 }),
  "0, 0, 1, 1, 2, 4, 7, 13",
);
eq(
  "happy number sequence",
  call("happyNumberSequence", { VALUE: 19, TERMS: 8 }),
  "19, 82, 68, 100, 1",
);
eq(
  "first differences",
  call("firstDifferencesList", { LIST: lst([1, 4, 9, 16]) }),
  "3, 5, 7",
);
eq(
  "second differences",
  call("secondDifferencesList", { LIST: lst([1, 4, 9, 16, 25]) }),
  "2, 2, 2",
);
eq(
  "running product",
  call("runningProductList", { LIST: lst([1, 2, 3, 4]) }),
  "1, 2, 6, 24",
);
eq(
  "cumulative mean",
  call("cumulativeMeanList", { LIST: lst([2, 4, 6]) }),
  "2, 3, 4",
);
eq(
  "normalised list",
  call("normalisedList", { LIST: lst([2, 4, 6]) }),
  "-1.224744871391589, 0, 1.224744871391589",
);
eq(
  "moving average",
  call("movingAverageOfList", { LIST: lst([1, 2, 3, 4, 5]), WINDOW: 3 }),
  "1, 1.5, 2, 3, 4",
);
eq(
  "moving average clamped window",
  call("movingAverageOfList", { LIST: lst([1, 2, 3, 4]), WINDOW: 1 }),
  "1, 2, 3, 4",
);

function naiveContinuedFraction(x, terms) {
  const out = [];
  let value = Math.abs(x);
  for (let i = 0; i < terms; i++) {
    const whole = Math.floor(value);
    out.push(whole);
    const rest = value - whole;
    if (!(rest > 0)) break;
    value = 1 / rest;
    if (!Number.isFinite(value)) break;
  }
  return out;
}
for (const value of [Math.PI, 2.5, 0.6180339887, 7]) {
  const expected = naiveContinuedFraction(value, 6).join(", ");
  eq(
    `continued fraction ${value}`,
    call("continuedFractionList", { VALUE: value, TERMS: 6 }),
    expected,
  );
}
eq(
  "rational approximation pi",
  call("rationalApproximationList", {
    VALUE: 3.14159265358979,
    MAX_DENOMINATOR: 100,
  }),
  "22, 7",
);
eq(
  "rational approximation pi fine",
  call("rationalApproximationList", {
    VALUE: 3.14159265358979,
    MAX_DENOMINATOR: 1000,
  }),
  "355, 113",
);
const sqrt2Approx = call("rationalApproximationList", {
  VALUE: 1.4142135,
  MAX_DENOMINATOR: 50,
})
  .split(", ")
  .map(Number);
eq("rational approximation sqrt2", sqrt2Approx.join(", "), "41, 29");
close(
  "rational approximation value",
  sqrt2Approx[0] / sqrt2Approx[1],
  1.4142135,
  1e-3,
);

const bins = call("histogramCountsList", {
  LIST: lst([1, 2, 2, 3, 4, 8, 13]),
  BINS: 4,
});
eq("histogram counts", bins, "4, 1, 1, 1");
eq(
  "histogram total",
  bins.split(", ").reduce((a, b) => a + Number(b), 0),
  7,
);
eq(
  "histogram equal values",
  call("histogramCountsList", { LIST: lst([5, 5, 5]), BINS: 3 }),
  "3, 0, 0",
);

const interval = call("confidenceIntervalList", {
  LIST: lst([1, 2, 2, 3, 4, 8, 13]),
  LEVEL: 0.95,
})
  .split(", ")
  .map(Number);
ok(
  "confidence interval brackets mean",
  interval[0] < 33 / 7 && interval[1] > 33 / 7,
);
close(
  "confidence interval margin",
  (interval[1] - interval[0]) / 2,
  1.959963984540054 * Math.sqrt(18.571428571428571 / 7),
  1e-9,
);
eq(
  "confidence interval bad level",
  call("confidenceIntervalList", { LIST: lst([1, 2, 3]), LEVEL: 1.5 }),
  "NaN, NaN",
);

const xs = lst([1, 2, 3, 4, 5]);
const ys = lst([2, 4, 5, 4, 5]);
const linearFit = call("polynomialFitList", { XS: xs, YS: ys, DEGREE: 1 })
  .split(", ")
  .map(Number);
close("polynomial fit slope", linearFit[0], 0.6, 1e-12);
close("polynomial fit intercept", linearFit[1], 2.2, 1e-12);
eq(
  "polynomial fit exact quadratic",
  call("polynomialFitList", {
    XS: lst([1, 2, 3]),
    YS: lst([2, 5, 10]),
    DEGREE: 2,
  }),
  "1, 0, 1",
);

/* ---------------- random list blocks ---------------- */
{
  const sample = call("randomSampleWithoutReplacement", {
    COUNT: 3,
    LIST: lst([1, 2, 3, 4, 5]),
  }).split(", ");
  eq("sample without replacement size", sample.length, 3);
  ok("sample without replacement unique", new Set(sample).size === 3);
  ok(
    "sample without replacement members",
    sample.every((v) => ["1", "2", "3", "4", "5"].includes(v)),
  );
  const tooMany = call("randomSampleWithoutReplacement", {
    COUNT: 9,
    LIST: lst([1, 2]),
  }).split(", ");
  eq("sample without replacement clamped", tooMany.length, 2);
  const shuffleSource = [1, 2, 3, 4, 5, 6, 7, 8];
  const shuffled = call("shuffledList", { LIST: lst(shuffleSource) })
    .split(", ")
    .map(Number)
    .sort((a, b) => a - b);
  eq("shuffled keeps multiset", shuffled.join(","), shuffleSource.join(","));
  let sawDifferent = false;
  for (let i = 0; i < 20; i++) {
    if (
      call("shuffledList", { LIST: lst(shuffleSource) }) !==
      shuffleSource.join(", ")
    )
      sawDifferent = true;
  }
  ok("shuffled reorders", sawDifferent);
  eq("shuffled empty", call("shuffledList", { LIST: lst([]) }), "");
}

/* ---------------- ideal gas ---------------- */
close(
  "ideal gas volume",
  call("idealGasVolume", { AMOUNT: 1, TEMPERATURE: 300, PRESSURE: 101325 }),
  (8.314462618 * 300) / 101325,
  1e-12,
);
close(
  "ideal gas volume twice",
  call("idealGasVolume", { AMOUNT: 2, TEMPERATURE: 273.15, PRESSURE: 101325 }),
  (2 * 8.314462618 * 273.15) / 101325,
  1e-12,
);
isNan(
  "ideal gas volume zero pressure",
  call("idealGasVolume", { AMOUNT: 1, TEMPERATURE: 300, PRESSURE: 0 }),
);

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
