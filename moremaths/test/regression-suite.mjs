// Regressions for the fixes: every check here covers a bug that used to ship.
import fs from "node:fs";
import {
  registered as ext,
  defaultArgs,
  blockSpecs,
  util,
} from "./harness.mjs";

const COVERAGE_DIR = new URL(".coverage/", import.meta.url).pathname;
fs.mkdirSync(COVERAGE_DIR, { recursive: true });
const TAG = "v6";

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
  return ext[opcode](defaultArgs(entry, overrides), util);
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
function isNan(name, actual) {
  checks += 1;
  if (!Number.isNaN(actual))
    failures.push(`${name}: expected NaN, got ${actual}`);
}
function ok(name, condition) {
  checks += 1;
  if (!condition) failures.push(`${name}: condition failed`);
}
const listVars = new Map();
let listCounter = 0;
function lst(value) {
  const name = `L${(listCounter += 1)}`;
  listVars.set(name, { id: name, type: "list", name, value });
  util.target.lookupVariableById = (id) => listVars.get(id) || null;
  util.target.lookupVariableByNameAndType = (nm) => listVars.get(nm) || null;
  util.target.lookupList = (nm) => listVars.get(nm) || null;
  return name;
}

/* ---------------- doppler shift ---------------- */
// The approaching flag used to be missing from the block text, so the input
// never existed and every source sounded like it was receding.
close(
  "doppler shift approaching",
  call("dopplerShift", { SPEED: 10, FREQUENCY: 440, APPROACHING: 1 }),
  (440 * 343) / (343 - 10),
);
close(
  "doppler shift receding",
  call("dopplerShift", { SPEED: 10, FREQUENCY: 440, APPROACHING: 0 }),
  (440 * 343) / (343 + 10),
);
ok(
  "doppler shift approaching raises the frequency",
  call("dopplerShift", { SPEED: 10, FREQUENCY: 440, APPROACHING: 1 }) > 440,
);

/* ---------------- unit conversions ---------------- */
close(
  "convert mass defaults",
  call("convertMass", { MASS: 1 }),
  2.2046226218487757,
);
close(
  "convert length defaults",
  call("convertLength", { LENGTH: 1 }),
  3.280839895013123,
);
close(
  "convert temperature defaults",
  call("convertTemperature", { TEMPERATURE: 0 }),
  32,
);
close("convert angle defaults", call("convertAngle", { ANGLE: 180 }), Math.PI);
close(
  "convert any unit defaults",
  call("convertUnit", { VALUE: 1 }),
  2.2046226218487757,
);
ok(
  "units in dimension",
  call("unitsInDimension", { DIMENSION: "mass" }).startsWith("kilogram (kg)"),
);
close(
  "physical constant",
  call("physicalConstant", { CONSTANT: "speedOfLight" }),
  299792458,
);
close("math constant", call("mathConstant", { CONSTANT: "pi" }), Math.PI);

/* ---------------- determinants ---------------- */
eq("determinant 2x2", call("determinant2x2", { A: 1, B: 2, C: 3, D: 4 }), -2);
eq(
  "determinant 3x3",
  call("determinant3x3", {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
  }),
  0,
);

/* ---------------- escape energy ---------------- */
// Escape energy per kilogram is G*M/(2R); the factor of two was missing.
close(
  "orbital escape energy",
  call("orbitalEscapeEnergy", { RADIUS: 6371000, MASS: 5.9722e24 }),
  (6.6743e-11 * 5.9722e24) / (2 * 6371000),
);

/* ---------------- cyclotron frequency ---------------- */
// f = qB/(2*pi*m) in hertz; the block used to return the angular frequency.
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

/* ---------------- tribonacci ---------------- */
// The single-value block disagreed with the sequence block.
eq("tribonacci", call("tribonacci", { N: 10 }), 81);
const tribonacciTerms = call("tribonacciSequenceList", { TERMS: 8 });
for (let i = 0; i < tribonacciTerms.length; i++) {
  eq(`tribonacci term ${i}`, call("tribonacci", { N: i }), tribonacciTerms[i]);
}

/* ---------------- z-scores ---------------- */
// normalisedList used the sample deviation while listZScore used the population
// deviation, so the two blocks disagreed about the same list.
const zList = lst([2, 4, 6]);
const zScores = call("normalisedList", { LIST: zList });
close("normalised list first", zScores[0], -1.224744871391589);
close("normalised list second", zScores[1], 0);
close("normalised list third", zScores[2], 1.224744871391589);
for (const value of [2, 4, 6]) {
  close(
    `normalised list agrees with listZScore for ${value}`,
    zScores[[2, 4, 6].indexOf(value)],
    call("listZScore", { VALUE: value, LIST: zList }),
  );
}

/* ---------------- lists keep their contents ---------------- */
eq(
  "list sorted text keeps text",
  call("listSortedText", { LIST: lst(["pear", 2, "apple"]) }),
  "2, apple, pear",
);
eq(
  "list sorted text sorts numbers",
  call("listSortedText", { LIST: lst([3, 1, 2]) }),
  "1, 2, 3",
);
{
  const source = ["x", 1, true];
  const shuffled = call("shuffledList", { LIST: lst(source) });
  eq("shuffled list keeps every item", shuffled.length, 3);
  ok(
    "shuffled list keeps item types",
    shuffled.includes("x") && shuffled.includes(1) && shuffled.includes(true),
    JSON.stringify(shuffled),
  );
  const sampled = call("randomSampleWithoutReplacement", {
    COUNT: 2,
    LIST: lst(source),
  });
  eq("sampled list keeps item types", sampled.length, 2);
  ok(
    "sampled list keeps its items",
    sampled.every((item) => source.includes(item)),
    JSON.stringify(sampled),
  );
}

/* ---------------- roots ---------------- */
// -3 % 2 is -1, so odd negative roots used to be treated as even roots.
close(
  "nth root negative odd index",
  call("nthRoot", { INDEX: -3, NUM: -8 }),
  -0.5,
);
close("nth root odd index", call("nthRoot", { INDEX: 3, NUM: -8 }), -2);
isNan(
  "nth root even index of negative",
  call("nthRoot", { INDEX: 2, NUM: -4 }),
);

/* ---------------- inverse error function ---------------- */
// The block carried its own copy of the helper's Newton iteration.
close(
  "inverse error function",
  call("inverseErrorFunction", { Y: 0.5 }),
  0.4769362762044699,
);
close(
  "inverse error function round trip",
  ext.erfOf(call("inverseErrorFunction", { Y: 0.25 })),
  0.25,
);
isNan(
  "inverse error function out of range",
  call("inverseErrorFunction", { Y: 2 }),
);

/* ---------------- arccotangent ---------------- */
// arccot(x) = 90 - arctan(x), so the answer is in (0, 180).
close("arccot of 1", call("arcCotangent", { VALUE: 1 }), 45);
close("arccot of -1", call("arcCotangent", { VALUE: -1 }), 135);
close("arccot of 0", call("arcCotangent", { VALUE: 0 }), 90);

/* ---------------- ideal gas ---------------- */
// The volume block carried an argument it never used.
ok(
  "ideal gas volume has no stray argument",
  !("VOLUME" in (byOpcode.idealGasVolume.arguments || {})),
);
close(
  "ideal gas volume",
  call("idealGasVolume", { AMOUNT: 1, TEMPERATURE: 300, PRESSURE: 101325 }),
  (1 * 8.314462618 * 300) / 101325,
);

/* ---------------- cauchy deviation ---------------- */
eq("cauchy stddev", call("cauchyStdDev"), Infinity);

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
