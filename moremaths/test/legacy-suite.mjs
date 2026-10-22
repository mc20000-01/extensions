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
const TAG = "v3";

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

/* ---------------- constants ---------------- */
close("constant pi", call("constantPi"), Math.PI);
close("constant e", call("constantE"), Math.E);
close("constant tau", call("constantTau"), Math.PI * 2);
close("constant phi", call("constantPhi"), (1 + Math.sqrt(5)) / 2);
close("constant sqrt2", call("constantSqrt2"), Math.SQRT2);
close("math constant pi", call("mathConstant", { CONSTANT: "pi" }), Math.PI);
close("math constant e", call("mathConstant", { CONSTANT: "e" }), Math.E);
isNan("math constant unknown", call("mathConstant", { CONSTANT: "banana" }));

/* ---------------- rounding ---------------- */
eq("round number", call("roundNumber", { NUM: 1.5 }), 2);
eq("round number negative", call("roundNumber", { NUM: -1.5 }), -1);
eq("floor number", call("floorNumber", { NUM: 1.7 }), 1);
eq("floor number negative", call("floorNumber", { NUM: -1.2 }), -2);
eq("ceiling number", call("ceilingNumber", { NUM: 1.2 }), 2);
eq("ceiling number negative", call("ceilingNumber", { NUM: -1.7 }), -1);
eq("truncate number", call("truncateNumber", { NUM: 1.7 }), 1);
eq("truncate number negative", call("truncateNumber", { NUM: -1.7 }), -1);
eq("round to places", call("roundToPlaces", { NUM: 3.14159, PLACES: 2 }), 3.14);
eq(
  "round to places negative",
  call("roundToPlaces", { NUM: -3.14159, PLACES: 2 }),
  -3.14,
);
eq(
  "round to places up",
  call("roundToPlaces", { NUM: 2.675, PLACES: 2 }),
  2.68,
);
eq("round half down", call("roundHalfDown", { NUM: 2.5, PLACES: 0 }), 2);
eq(
  "round half down negative",
  call("roundHalfDown", { NUM: -2.5, PLACES: 0 }),
  -2,
);
eq("round half even", call("roundHalfEven", { NUM: 2.5, PLACES: 0 }), 2);
eq("round half even three", call("roundHalfEven", { NUM: 3.5, PLACES: 0 }), 4);
eq(
  "round half even negative",
  call("roundHalfEven", { NUM: -2.5, PLACES: 0 }),
  -2,
);
close(
  "round to significant",
  call("roundToSignificant", { NUM: 1234.5678, FIGURES: 3 }),
  1230,
);
close(
  "round to significant decimals",
  call("roundToSignificant", { NUM: 0.00123456, FIGURES: 3 }),
  0.00123,
  1e-6,
);
eq("round to multiple", call("roundToMultiple", { NUM: 17, STEP: 5 }), 15);
eq("round to multiple up", call("roundToMultiple", { NUM: 18, STEP: 5 }), 20);
eq("floor to multiple", call("floorToMultiple", { NUM: 17, STEP: 5 }), 15);
eq("ceiling to multiple", call("ceilingToMultiple", { NUM: 17, STEP: 5 }), 20);
eq("absolute value", call("absoluteValue", { NUM: -5 }), 5);
eq("sign positive", call("signOfNumber", { NUM: -5 }), -1);
eq("sign zero", call("signOfNumber", { NUM: 0 }), 0);
eq("sign positive value", call("signOfNumber", { NUM: 5 }), 1);
close("fractional part", call("fractionalPart", { NUM: 2.75 }), 0.75);
close("fractional part negative", call("fractionalPart", { NUM: -2.75 }), 0.25);
eq("decimal places", call("decimalPlacesOf", { NUM: 2.75 }), 2);
eq("decimal places none", call("decimalPlacesOf", { NUM: 3 }), 0);
eq("absolute difference", call("absoluteDifference", { A: 3, B: 10 }), 7);

/* ---------------- trigonometry ---------------- */
close("sine", call("sine", { ANGLE: 30 }), 0.5);
close("sine 90", call("sine", { ANGLE: 90 }), 1);
close("cosine", call("cosine", { ANGLE: 60 }), 0.5);
close("tangent", call("tangent", { ANGLE: 45 }), 1);
close("secant", call("secant", { ANGLE: 60 }), 2);
close("cosecant", call("cosecant", { ANGLE: 30 }), 2);
close("cotangent", call("cotangent", { ANGLE: 45 }), 1);
close("arc sine", call("arcSine", { VALUE: 0.5 }), 30);
close("arc cosine", call("arcCosine", { VALUE: 0.5 }), 60);
close("arc tangent", call("arcTangent", { VALUE: 1 }), 45);
close("arc cotangent", call("arcCotangent", { VALUE: 1 }), 45);
close("arc tangent 2", call("arcTangent2", { Y: 1, X: 1 }), 45);
close("arc tangent 2 negative x", call("arcTangent2", { Y: 1, X: -1 }), 135);
close("hyperbolic sine", call("hyperbolicSine", { VALUE: 1 }), Math.sinh(1));
close(
  "hyperbolic cosine",
  call("hyperbolicCosine", { VALUE: 1 }),
  Math.cosh(1),
);
close(
  "hyperbolic tangent",
  call("hyperbolicTangent", { VALUE: 1 }),
  Math.tanh(1),
);
close(
  "hyperbolic secant",
  call("hyperbolicSecant", { VALUE: 1 }),
  1 / Math.cosh(1),
);
close(
  "hyperbolic cosecant",
  call("hyperbolicCosecant", { VALUE: 1 }),
  1 / Math.sinh(1),
);
close(
  "hyperbolic cotangent",
  call("hyperbolicCotangent", { VALUE: 1 }),
  1 / Math.tanh(1),
);
close(
  "arc hyperbolic sine",
  call("arcHyperbolicSine", { VALUE: 1 }),
  Math.asinh(1),
);
close(
  "arc hyperbolic cosine",
  call("arcHyperbolicCosine", { VALUE: 2 }),
  Math.acosh(2),
);
close(
  "arc hyperbolic tangent",
  call("arcHyperbolicTangent", { VALUE: 0.5 }),
  Math.atanh(0.5),
);
close(
  "arc hyperbolic secant",
  call("arcHyperbolicSecant", { VALUE: 0.5 }),
  Math.acosh(2),
);
close(
  "arc hyperbolic cosecant",
  call("arcHyperbolicCosecant", { VALUE: 1 }),
  Math.asinh(1),
);
close(
  "arc hyperbolic cotangent",
  call("arcHyperbolicCotangent", { VALUE: 2 }),
  Math.atanh(2),
);
close(
  "degrees to radians",
  call("degreesToRadiansBlock", { ANGLE: 180 }),
  Math.PI,
);
close(
  "radians to degrees",
  call("radiansToDegreesBlock", { RADIANS: Math.PI }),
  180,
);
close(
  "angle unit to degrees",
  call("angleUnitToDegrees", { ANGLE: Math.PI / 2, UNIT: "radians" }),
  90,
);
close(
  "angle unit to degrees default unit",
  call("angleUnitToDegrees", { ANGLE: 90, UNIT: menuItems.unit[0] }),
  90,
);
close(
  "degrees to angle unit",
  call("angleUnitToRadians", { ANGLE: 180, UNIT: "radians" }),
  Math.PI,
);
close("wrap angle", call("wrapAngle", { ANGLE: 450 }), 90);
close("wrap angle small", call("wrapAngle", { ANGLE: 45 }), 45);

/* ---------------- logarithms and powers ---------------- */
close("natural log", call("naturalLog", { NUM: 10 }), Math.log(10));
close("log base 10", call("logBase10", { NUM: 1000 }), 3);
close("log base 2", call("logBase2", { NUM: 1024 }), 10);
close("log of base", call("logOfBase", { NUM: 81, BASE: 3 }), 4);
close("e to the", call("eToThe", { POWER: 2 }), Math.exp(2));
close("ten to the", call("tenToThe", { POWER: 3 }), 1000);
close("base to the", call("baseToThe", { BASE: 2, POWER: 10 }), 1024);
close("square root", call("squareRoot", { NUM: 144 }), 12);
close("cube root", call("cubeRoot", { NUM: 27 }), 3);
close("nth root", call("nthRoot", { INDEX: 3, NUM: 64 }), 4);
eq("nth root of negative", call("nthRoot", { INDEX: 3, NUM: -8 }), -2);
isNan("even root of negative", call("nthRoot", { INDEX: 2, NUM: -4 }));

/* ---------------- geometry and algebra ---------------- */
close("hypotenuse", call("hypotenuse", { A: 2, B: 3, C: 6 }), 7);
close("sigmoid", call("sigmoid", { VALUE: 0 }), 0.5);
close("sigmoid large", call("sigmoid", { VALUE: 20 }), 1 - 1e-9, 1e-6);
close("logit", call("logit", { PROBABILITY: 0.73 }), Math.log(0.73 / 0.27));
close(
  "solve linear equation",
  call("solveLinearEquation", { A: 2, B: 3, C: 11 }),
  4,
);
isNan(
  "solve linear equation zero slope",
  call("solveLinearEquation", { A: 0, B: 3, C: 11 }),
);
eq(
  "quadratic discriminant",
  call("quadraticDiscriminant", { A: 1, B: -3, C: 2 }),
  1,
);
eq("quadratic root 1", call("quadraticRoot1", { A: 1, B: -3, C: 2 }), 1);
eq("quadratic root 2", call("quadraticRoot2", { A: 1, B: -3, C: 2 }), 2);
close(
  "quadratic vertex x",
  call("quadraticVertexX", { A: 1, B: -3, C: 2 }),
  1.5,
);
close(
  "quadratic vertex y",
  call("quadraticVertexY", { A: 1, B: -3, C: 2 }),
  -0.25,
);
eq(
  "sum of quadratic roots",
  call("sumOfQuadraticRoots", { A: 1, B: -3, C: 2 }),
  3,
);
eq(
  "product of quadratic roots",
  call("productOfQuadraticRoots", { A: 1, B: -3, C: 2 }),
  2,
);
eq(
  "arithmetic nth term",
  call("arithmeticNthTerm", { INDEX: 10, FIRST: 2, STEP: 3 }),
  29,
);
eq(
  "geometric nth term",
  call("geometricNthTerm", { INDEX: 5, FIRST: 2, RATIO: 3 }),
  162,
);
eq(
  "arithmetic series sum",
  call("arithmeticSeriesSum", { INDEX: 10, FIRST: 2, STEP: 3 }),
  155,
);
eq(
  "geometric series sum",
  call("geometricSeriesSum", { INDEX: 5, FIRST: 2, RATIO: 3 }),
  242,
);
close(
  "infinite geometric sum",
  call("infiniteGeometricSum", { FIRST: 2, RATIO: 0.5 }),
  4,
);
isNan(
  "infinite geometric sum diverging",
  call("infiniteGeometricSum", { FIRST: 2, RATIO: 2 }),
);
eq("triangular number", call("triangularNumber", { INDEX: 10 }), 55);
eq(
  "square pyramidal number",
  call("squarePyramidalNumber", { INDEX: 10 }),
  385,
);
eq("sum of first odds", call("sumOfFirstOdds", { INDEX: 10 }), 100);
eq("sum of first evens", call("sumOfFirstEvens", { INDEX: 10 }), 110);
close(
  "harmonic number",
  call("harmonicNumber", { INDEX: 10 }),
  2.9289682539682538,
  1e-12,
);
eq("factorial", call("factorial", { N: 5 }), 120);
eq("factorial zero", call("factorial", { N: 0 }), 1);
eq("double factorial", call("doubleFactorial", { N: 7 }), 105);
eq("derangements", call("derangements", { N: 4 }), 9);
eq("permutations", call("permutations", { N: 5, K: 2 }), 20);
eq("combinations", call("combinations", { N: 5, K: 2 }), 10);
eq(
  "combinations with repetition",
  call("combinationsWithRepetition", { N: 5, K: 2 }),
  15,
);
eq("multinomial", call("multinomial", { N: 10, A: 3, B: 4, C: 3 }), 4200);
eq("stirling second kind", call("stirlingSecondKind", { N: 5, K: 2 }), 15);
eq("stirling first kind", call("stirlingFirstKind", { N: 5, K: 2 }), -50);
eq("catalan number", call("catalanNumber", { N: 5 }), 42);
eq("bell number", call("bellNumber", { N: 5 }), 52);
eq("fibonacci", call("fibonacci", { N: 10 }), 55);
eq("lucas", call("lucas", { N: 10 }), 123);
eq("tribonacci", call("tribonacci", { N: 10 }), 81);
close(
  "combination chance",
  call("combinationChance", { DRAW: 2, WINS: 3, TOTAL: 10 }),
  3 / 45,
  1e-9,
);

/* ---------------- number theory ---------------- */
eq(
  "greatest common divisor",
  call("greatestCommonDivisor", { A: 12, B: 18 }),
  6,
);
eq("least common multiple", call("leastCommonMultiple", { A: 4, B: 6 }), 12);
eq("is prime", call("isPrime", { N: 97 }), true);
eq("is prime false", call("isPrime", { N: 91 }), false);
eq("nth prime", call("nthPrime", { INDEX: 10 }), 29);
eq("prime count", call("primeCountUpTo", { N: 100 }), 25);
eq("prime count table limit", call("primeCountUpTo", { N: 1000000 }), 78498);
eq(
  "prime count just past table limit",
  call("primeCountUpTo", { N: 1000001 }),
  78498,
);
eq("prime count sieved path", call("primeCountUpTo", { N: 10000000 }), 664579);
eq(
  "prime count segmented path",
  call("primeCountUpTo", { N: 123456789 }),
  7027260,
);
eq("prime count too large", call("primeCountUpTo", { N: 1e12 }), 0);
eq("prime count below two", call("primeCountUpTo", { N: 1 }), 0);
eq("next prime", call("nextPrime", { N: 100 }), 101);
eq("previous prime", call("previousPrime", { N: 100 }), 97);
eq("prime factors text", call("primeFactors", { N: 60 }), "2, 2, 3, 5");
eq("prime factor count", call("primeFactorCount", { N: 60 }), 3);
eq("smallest prime factor", call("smallestPrimeFactor", { N: 91 }), 7);
eq("largest prime factor", call("largestPrimeFactor", { N: 60 }), 5);
eq("all divisors", call("allDivisors", { N: 12 }), "1, 2, 3, 4, 6, 12");
eq("divisor count", call("divisorCount", { N: 12 }), 6);
eq("divisor sum", call("divisorSum", { N: 12 }), 28);
eq("proper divisor sum", call("properDivisorSum", { N: 12 }), 16);
eq("is perfect number", call("isPerfectNumber", { N: 28 }), true);
eq("is perfect number false", call("isPerfectNumber", { N: 12 }), false);
eq("is semiprime", call("isSemiprime", { N: 15 }), true);
eq("euler totient", call("eulerTotient", { N: 10 }), 4);
eq("mobius", call("mobius", { N: 30 }), -1);
eq("mobius square", call("mobius", { N: 36 }), 0);
eq("primorial", call("primorial", { N: 10 }), 210);
eq("collatz steps", call("collatzSteps", { N: 27 }), 111);
eq("digital root", call("digitalRoot", { N: 9875 }), 2);
eq("is armstrong number", call("isArmstrongNumber", { N: 153 }), true);
eq("is palindrome number", call("isPalindromeNumber", { N: 12321 }), true);
eq("factorial digit count", call("factorialDigitCount", { N: 100 }), 158);
eq("factorial trailing zeros", call("factorialTrailingZeros", { N: 100 }), 24);

/* ---------------- digits, bases, bits ---------------- */
eq("digit sum", call("digitSum", { N: 1234 }), 10);
eq("digit product", call("digitProduct", { N: 1234 }), 24);
eq("reverse digits", call("reverseDigits", { N: 1234 }), 4321);
eq("digit count", call("digitCount", { N: 12345 }), 5);
eq("digit at", call("digitAt", { INDEX: 2, N: 12345 }), 2);
eq("digit at out of range", call("digitAt", { INDEX: 9, N: 12345 }), 0);
eq("number to base", call("numberToBase", { N: 255, BASE: 16 }), "ff");
eq("base to number", call("baseToNumber", { TEXT: "ff", BASE: 16 }), 255);
eq("to binary", call("toBinary", { N: 10 }), "1010");
eq("to octal", call("toOctal", { N: 10 }), "12");
eq("to hexadecimal", call("toHexadecimal", { N: 255 }), "ff");
eq("to roman numerals", call("toRomanNumerals", { N: 1994 }), "MCMXCIV");
eq("from roman numerals", call("fromRomanNumerals", { TEXT: "MCMXCIV" }), 1994);
eq("set bit count", call("setBitCount", { N: 255 }), 8);
eq("bit length", call("bitLength", { N: 255 }), 8);
eq("pad with zeros", call("padWithZeros", { N: 42, WIDTH: 6 }), "000042");
eq("scientific notation", call("scientificNotation", { N: 12345 }), "1.2345e4");
eq("power of ten", call("powerOfTen", { N: 12345 }), 4);

/* ---------------- logic and utility ---------------- */
eq("boolean and", call("booleanAnd", { A: true, B: false }), false);
eq("boolean or", call("booleanOr", { A: true, B: false }), true);
eq("boolean xor", call("booleanXor", { A: true, B: true }), false);
eq("boolean nand", call("booleanNand", { A: true, B: true }), false);
eq("boolean nor", call("booleanNor", { A: false, B: false }), true);
eq("boolean not", call("booleanNot", { VALUE: false }), true);
eq("boolean to number", call("booleanToNumber", { VALUE: true }), 1);
eq("number to boolean", call("numberToBoolean", { VALUE: 0 }), false);
eq(
  "if then else",
  call("ifThenElse", { CONDITION: true, IF_TRUE: "yes", IF_FALSE: "no" }),
  "yes",
);
eq(
  "if then else false",
  call("ifThenElse", { CONDITION: false, IF_TRUE: "yes", IF_FALSE: "no" }),
  "no",
);
eq("strictly equals", call("strictlyEquals", { A: "1", B: "1.0" }), false);
eq("strictly equals same", call("strictlyEquals", { A: "1", B: "1" }), true);
eq("compare values", call("compareValues", { A: "3", B: "5" }), -1);
eq("compare values equal", call("compareValues", { A: "5", B: "5" }), 0);
eq("compare values greater", call("compareValues", { A: "7", B: "5" }), 1);
eq("is between", call("isBetween", { VALUE: 5, LOW: 1, HIGH: 10 }), true);
eq(
  "is between inclusive",
  call("isBetween", { VALUE: 1, LOW: 1, HIGH: 10 }),
  true,
);
eq("is divisible by", call("isDivisibleBy", { A: 12, B: 4 }), true);
eq("is even", call("isEven", { N: 4 }), true);
eq("is odd", call("isOdd", { N: 7 }), true);
eq("is integer", call("isInteger", { N: 4.5 }), false);
eq("is negative", call("isNegative", { N: -1 }), true);
eq("is positive", call("isPositive", { N: 1 }), true);
eq("is zero", call("isZero", { N: 0 }), true);
eq("is numeric", call("isNumeric", { VALUE: "3.5" }), true);
eq("is numeric false", call("isNumeric", { VALUE: "abc" }), false);
eq("is finite number", call("isFiniteNumber", { N: 4 }), true);
eq("clamp number", call("clampNumber", { VALUE: 15, LOW: 0, HIGH: 10 }), 10);
close("lerp", call("lerp", { FROM: 0, TO: 100, AMOUNT: 0.5 }), 50);
close(
  "inverse lerp",
  call("inverseLerp", { VALUE: 25, FROM: 0, TO: 100 }),
  0.25,
);
close(
  "remap number",
  call("remapNumber", {
    VALUE: 5,
    FROM_LOW: 0,
    FROM_HIGH: 10,
    TO_LOW: 0,
    TO_HIGH: 100,
  }),
  50,
);
eq("wrap number", call("wrapNumber", { VALUE: 12, LOW: 0, HIGH: 10 }), 2);
eq(
  "wrap number negative",
  call("wrapNumber", { VALUE: -1, LOW: 0, HIGH: 10 }),
  9,
);
close("smooth step", call("smoothStep", { VALUE: 5, LOW: 0, HIGH: 10 }), 0.5);
eq(
  "approach number up",
  call("approachNumber", { VALUE: 0, TARGET: 100, STEP: 7 }),
  7,
);
eq(
  "approach number down",
  call("approachNumber", { VALUE: 0, TARGET: -100, STEP: 7 }),
  -7,
);
eq(
  "approach number clamps",
  call("approachNumber", { VALUE: 98, TARGET: 100, STEP: 7 }),
  100,
);
eq("is close to", call("isCloseTo", { A: 0.1, B: 0.2, TOLERANCE: 0.15 }), true);
eq(
  "is close to false",
  call("isCloseTo", { A: 0.1, B: 0.2, TOLERANCE: 0.05 }),
  false,
);
close("average of two", call("averageOfTwo", { A: 2, B: 5 }), 3.5);
eq("smallest of three", call("smallestOfThree", { A: 3, B: 1, C: 2 }), 1);
eq("largest of three", call("largestOfThree", { A: 3, B: 1, C: 2 }), 3);
close("percent of", call("percentOf", { PERCENT: 15, NUM: 200 }), 30);
close("percent change", call("percentChange", { FROM: 80, TO: 100 }), 25);
eq("floor divide", call("floorDivide", { A: 7, B: 2 }), 3);
eq("floor divide negative", call("floorDivide", { A: -7, B: 2 }), -4);
eq("ceiling divide", call("ceilingDivide", { A: 7, B: 2 }), 4);
eq("ceiling divide negative", call("ceilingDivide", { A: -7, B: 2 }), -3);
eq("euclidean modulo", call("euclideanModulo", { A: -7, B: 3 }), 2);
isNan("euclidean modulo zero", call("euclideanModulo", { A: 7, B: 0 }));

/* ---------------- list statistics ---------------- */
const data = lst([1, 2, 2, 3, 4, 8, 13]);
eq("list length", call("listLength", { LIST: data }), 7);
eq("list sum", call("listSum", { LIST: data }), 33);
close("list mean", call("listMean", { LIST: data }), 33 / 7);
close("list median", call("listMedian", { LIST: data }), 3);
close("list mode", call("listMode", { LIST: data }), 2);
eq("list smallest", call("listSmallest", { LIST: data }), 1);
eq("list largest", call("listLargest", { LIST: data }), 13);
eq("list range", call("listRange", { LIST: data }), 12);
close("list midrange", call("listMidrange", { LIST: data }), 7);
close(
  "list population variance",
  call("listPopulationVariance", { LIST: data }),
  15.918367346938773,
  1e-12,
);
close(
  "list sample variance",
  call("listSampleVariance", { LIST: data }),
  18.571428571428571,
  1e-12,
);
close(
  "list population stddev",
  call("listPopulationStdDev", { LIST: data }),
  Math.sqrt(15.918367346938773),
  1e-12,
);
close(
  "list sample stddev",
  call("listSampleStdDev", { LIST: data }),
  Math.sqrt(18.571428571428571),
  1e-12,
);
close(
  "list standard error",
  call("listStandardError", { LIST: data }),
  Math.sqrt(15.918367346938773 / 7),
  1e-12,
);
close(
  "list geometric mean",
  call("listGeometricMean", { LIST: data }),
  Math.pow(1 * 2 * 2 * 3 * 4 * 8 * 13, 1 / 7),
  1e-12,
);
close(
  "list harmonic mean",
  call("listHarmonicMean", { LIST: data }),
  7 / (1 / 1 + 1 / 2 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 8 + 1 / 13),
  1e-12,
);
close(
  "list trimmed mean",
  call("listTrimmedMean", { LIST: data, TRIM: 10 }),
  3.8,
  1e-12,
);
close(
  "list percentile",
  call("listPercentile", { PERCENT: 90, LIST: data }),
  10,
  1e-12,
);
close(
  "list quartile 1",
  call("listQuartile", { QUARTILE: 1, LIST: data }),
  2,
  1e-12,
);
close(
  "list quartile 3",
  call("listQuartile", { QUARTILE: 3, LIST: data }),
  6,
  1e-12,
);
close(
  "list interquartile range",
  call("listInterquartileRange", { LIST: data }),
  4,
  1e-12,
);
close(
  "list median absolute deviation",
  call("listMedianAbsoluteDeviation", { LIST: data }),
  1,
  1e-12,
);
close(
  "list z-score",
  call("listZScore", { VALUE: 13, LIST: data }),
  (13 - 33 / 7) / Math.sqrt(15.918367346938773),
  1e-12,
);
close(
  "list weighted mean",
  call("listWeightedMean", { LIST: lst([1, 2, 3]), WEIGHTS: lst([1, 1, 2]) }),
  9 / 4,
);
const xs = lst([1, 2, 3, 4, 5]);
const ys = lst([2, 4, 5, 4, 5]);
close(
  "list covariance sample",
  call("listCovariance", { XS: xs, YS: ys, SAMPLE: true }),
  1.5,
  1e-12,
);
close(
  "list covariance population",
  call("listCovariance", { XS: xs, YS: ys, SAMPLE: false }),
  1.2,
  1e-12,
);
close(
  "list correlation",
  call("listCorrelation", { XS: xs, YS: ys }),
  6 / Math.sqrt(10 * 6),
  1e-12,
);
close(
  "list regression slope",
  call("listRegressionSlope", { XS: xs, YS: ys }),
  0.6,
  1e-12,
);
close(
  "list regression intercept",
  call("listRegressionIntercept", { XS: xs, YS: ys }),
  2.2,
  1e-12,
);
close(
  "list regression r squared",
  call("listRegressionRSquared", { XS: xs, YS: ys }),
  0.6,
  1e-12,
);
eq(
  "list sorted text",
  call("listSortedText", { LIST: data }),
  "1, 2, 2, 3, 4, 8, 13",
);
eq(
  "list cumulative sum text",
  call("listCumulativeSum", { LIST: lst([1, 2, 3]) }),
  "1, 3, 6",
);
eq("list count of", call("listCountOf", { VALUE: 2, LIST: data }), 2);
eq("list all true", call("listAllTrue", { LIST: lst([1, 2, 3]) }), true);
eq("list all true false", call("listAllTrue", { LIST: lst([1, 0, 3]) }), false);
eq("list any true", call("listAnyTrue", { LIST: lst([0, 0, 1]) }), true);
eq("list any true false", call("listAnyTrue", { LIST: lst([0, 0]) }), false);

/* ---------------- coordinate geometry ---------------- */
close(
  "distance between points",
  call("distanceBetweenPoints", { X1: 0, Y1: 0, X2: 3, Y2: 4 }),
  5,
);
eq("midpoint x", call("midpointX", { X1: 0, X2: 10 }), 5);
eq("midpoint y", call("midpointY", { Y1: 0, Y2: 10 }), 5);
close("angle of point", call("angleOfPoint", { X: 1, Y: 1 }), 45);
close(
  "polar to x",
  call("polarToX", { RADIUS: 10, ANGLE: 30 }),
  10 * Math.cos((30 * Math.PI) / 180),
);
close("polar to y", call("polarToY", { RADIUS: 10, ANGLE: 30 }), 5);
close("area of triangle", call("areaOfTriangle", { A: 3, B: 4, C: 5 }), 6);
close("area of circle", call("areaOfCircle", { RADIUS: 3 }), 9 * Math.PI);
eq("area of rectangle", call("areaOfRectangle", { WIDTH: 4, HEIGHT: 5 }), 20);
close("area of ellipse", call("areaOfEllipse", { A: 3, B: 2 }), 6 * Math.PI);
close(
  "area of regular polygon",
  call("areaOfRegularPolygon", { SIDES: 6, SIDE: 4 }),
  (6 * 16) / (4 * Math.tan(Math.PI / 6)),
);
eq(
  "perimeter of rectangle",
  call("perimeterOfRectangle", { WIDTH: 4, HEIGHT: 5 }),
  18,
);
close(
  "circle circumference",
  call("circleCircumference", { RADIUS: 3 }),
  6 * Math.PI,
);
close("arc length", call("arcLength", { RADIUS: 10, ANGLE: 90 }), 5 * Math.PI);
close(
  "chord length",
  call("chordLength", { RADIUS: 10, ANGLE: 90 }),
  10 * Math.SQRT2,
);
close(
  "sector area",
  call("sectorArea", { ANGLE: 90, RADIUS: 10 }),
  25 * Math.PI,
);
close("law of cosines", call("lawOfCosines", { A: 3, B: 4, ANGLE: 90 }), 5);
close(
  "law of sines",
  call("lawOfSines", { SIDE: 3, SIDE_ANGLE: 30, OTHER_ANGLE: 45 }),
  (3 * Math.sin((75 * Math.PI) / 180)) / 0.5,
);
eq(
  "polygon area",
  call("polygonArea", { POINTS: lst([0, 0, 4, 0, 4, 3, 0, 3]) }),
  12,
);
close(
  "polygon perimeter",
  call("polygonPerimeter", { POINTS: lst([0, 0, 4, 0, 4, 3, 0, 3]) }),
  14,
);

/* ---------------- vectors and determinants ---------------- */
close("magnitude 2d", call("magnitude2d", { X: 3, Y: 4 }), 5);
close("magnitude 3d", call("magnitude3d", { X: 1, Y: 2, Z: 2 }), 3);
eq(
  "dot product",
  call("dotProduct", { X1: 1, Y1: 2, Z1: 3, X2: 4, Y2: 5, Z2: 6 }),
  32,
);
eq(
  "cross product magnitude",
  call("crossProductMagnitude", { X1: 1, Y1: 0, Z1: 0, X2: 0, Y2: 1, Z2: 0 }),
  1,
);
close(
  "angle between vectors",
  call("angleBetweenVectors", { X1: 1, Y1: 0, X2: 0, Y2: 1 }),
  90,
);
close(
  "angle between vectors 45",
  call("angleBetweenVectors", { X1: 1, Y1: 0, X2: 1, Y2: 1 }),
  45,
);
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
eq(
  "determinant 3x3 nonzero",
  call("determinant3x3", {
    A: 6,
    B: 1,
    C: 1,
    D: 4,
    E: -2,
    F: 5,
    G: 2,
    H: 8,
    I: 7,
  }),
  -306,
);

/* ---------------- polynomials ---------------- */
eq(
  "polynomial at",
  call("polynomialAt", { COEFFICIENTS: lst([1, 2, 3]), X: 2 }),
  11,
);
eq(
  "polynomial degree",
  call("polynomialDegree", { COEFFICIENTS: lst([1, 2, 3]) }),
  2,
);
eq(
  "polynomial derivative at",
  call("polynomialDerivativeAt", { COEFFICIENTS: lst([1, 2, 3]), X: 2 }),
  6,
);
close(
  "polynomial integral",
  call("polynomialIntegral", { COEFFICIENTS: lst([0, 1]), FROM: 0, TO: 2 }),
  2,
);
eq(
  "polynomial limit",
  call("polynomialLimit", { COEFFICIENTS: lst([1, 2]), X: 3 }),
  5,
);
eq(
  "polynomial derivative terms",
  call("polynomialDerivativeTerms", { COEFFICIENTS: lst([1, 2, 3]) }),
  "2, 2",
);

/* ---------------- special functions ---------------- */
close("gamma function", call("gammaFunction", { X: 5 }), 24);
close("log gamma function", call("logGammaFunction", { X: 5 }), Math.log(24));
close("beta function", call("betaFunction", { A: 2, B: 3 }), 1 / 12);
close(
  "error function",
  call("errorFunction", { X: 1 }),
  0.8427007929497149,
  1e-12,
);
close(
  "inverse error function",
  call("inverseErrorFunction", { Y: 0.5 }),
  0.4769362762044699,
  1e-9,
);
close(
  "stirling approximation",
  call("stirlingApproximation", { N: 20 }),
  Math.sqrt(2 * Math.PI * 20) * Math.pow(20 / Math.E, 20),
  1e-12,
);

/* ---------------- distributions at block level ---------------- */
close(
  "normal cdf",
  call("normalCdf", { VALUE: 1, MEAN: 0, DEVIATION: 1 }),
  0.8413447460685429,
  1e-12,
);
close(
  "normal pdf",
  call("normalPdf", { VALUE: 1, MEAN: 0, DEVIATION: 1 }),
  0.24197072451914337,
  1e-12,
);
close(
  "normal quantile",
  call("normalQuantile", { PROBABILITY: 0.975 }),
  1.959963984540054,
  1e-9,
);
close("normal z-score", call("normalZScore", { VALUE: 1.5 }), 1.5);
close("normal mean block", call("normalMean", { MEAN: 3, DEVIATION: 2 }), 3);
close(
  "normal variance block",
  call("normalVariance", { MEAN: 3, DEVIATION: 2 }),
  4,
);
close(
  "normal stddev block",
  call("normalStdDev", { MEAN: 3, DEVIATION: 2 }),
  2,
);
close("uniform pdf", call("uniformPdf", { X: 0.5, LOW: 0, HIGH: 1 }), 1);
close("uniform cdf", call("uniformCdf", { X: 0.25, LOW: 0, HIGH: 1 }), 0.25);
close(
  "exponential pdf",
  call("exponentialPdf", { X: 1, RATE: 1 }),
  Math.exp(-1),
  1e-12,
);
close(
  "exponential cdf",
  call("exponentialCdf", { X: 1, RATE: 1 }),
  1 - Math.exp(-1),
  1e-12,
);
close(
  "exponential quantile",
  call("exponentialQuantile", { PROBABILITY: 0.5, RATE: 1 }),
  Math.log(2),
  1e-9,
);
close("exponential mean block", call("exponentialMean", { RATE: 4 }), 0.25);
close(
  "exponential variance block",
  call("exponentialVariance", { RATE: 4 }),
  0.0625,
);
close("exponential stddev block", call("exponentialStdDev", { RATE: 4 }), 0.25);
close(
  "log-normal pdf",
  call("logNormalPdf", { X: 1, MEAN: 0, DEVIATION: 1 }),
  1 / Math.sqrt(2 * Math.PI),
  1e-12,
);
close(
  "log-normal cdf",
  call("logNormalCdf", { X: 1, MEAN: 0, DEVIATION: 1 }),
  0.5,
  1e-12,
);
close(
  "log-normal quantile",
  call("logNormalQuantile", { PROBABILITY: 0.5 }),
  1,
  1e-6,
);
close(
  "log-normal mean block",
  call("logNormalMean", { MEAN: 0, DEVIATION: 1 }),
  Math.exp(0.5),
  1e-12,
);
close(
  "log-normal variance block",
  call("logNormalVariance", { MEAN: 0, DEVIATION: 1 }),
  4.670774270471604,
  1e-12,
);
close(
  "log-normal stddev block",
  call("logNormalStdDev", { MEAN: 0, DEVIATION: 1 }),
  Math.sqrt(4.670774270471604),
  1e-12,
);
close(
  "gamma pdf",
  call("gammaPdf", { X: 1, SHAPE: 2, SCALE: 1 }),
  1 * Math.exp(-1),
  1e-12,
);
close(
  "gamma cdf block",
  call("gammaCdf", { X: 1, SHAPE: 2, SCALE: 1 }),
  1 - 2 / Math.E,
  1e-12,
);
close(
  "gamma quantile block",
  call("gammaQuantile", { PROBABILITY: 0.5, SHAPE: 2, SCALE: 1 }),
  1.6783469900166605,
  1e-9,
);
close("gamma mean block", call("gammaMean", { SHAPE: 2, SCALE: 1 }), 2);
close("gamma variance block", call("gammaVariance", { SHAPE: 2, SCALE: 1 }), 2);
close(
  "gamma stddev block",
  call("gammaStdDev", { SHAPE: 2, SCALE: 1 }),
  Math.SQRT2,
);
close("beta pdf", call("betaPdf", { X: 0.5, A: 2, B: 3 }), 1.5, 1e-12);
close("beta cdf block", call("betaCdf", { X: 0.5, A: 2, B: 3 }), 0.6875, 1e-12);
close(
  "beta quantile block",
  call("betaQuantile", { PROBABILITY: 0.5, A: 2, B: 3 }),
  0.3857275681323906,
  1e-9,
);
close("beta mean block", call("betaMean", { A: 2, B: 3 }), 0.4);
close("beta variance block", call("betaVariance", { A: 2, B: 3 }), 0.04);
close("beta stddev block", call("betaStdDev", { A: 2, B: 3 }), 0.2);
close(
  "weibull pdf",
  call("weibullPdf", { X: 1, SHAPE: 2, SCALE: 1 }),
  2 / Math.E,
  1e-12,
);
close(
  "weibull cdf block",
  call("weibullCdf", { X: 1, SHAPE: 2, SCALE: 1 }),
  1 - 1 / Math.E,
  1e-12,
);
close(
  "weibull mean block",
  call("weibullMean", { SHAPE: 2, SCALE: 1 }),
  Math.sqrt(Math.PI) / 2,
  1e-12,
);
close(
  "weibull variance block",
  call("weibullVariance", { SHAPE: 2, SCALE: 1 }),
  1 - Math.pow(Math.sqrt(Math.PI) / 2, 2),
  1e-12,
);
close(
  "weibull stddev block",
  call("weibullStdDev", { SHAPE: 2, SCALE: 1 }),
  Math.sqrt(1 - Math.PI / 2),
  1e-12,
);
close(
  "cauchy pdf",
  call("cauchyPdf", { X: 0, LOCATION: 0, SCALE: 1 }),
  1 / Math.PI,
  1e-12,
);
close(
  "cauchy cdf block",
  call("cauchyCdf", { X: 0, LOCATION: 0, SCALE: 1 }),
  0.5,
);
close(
  "cauchy quantile block",
  call("cauchyQuantile", { PROBABILITY: 0.75, LOCATION: 0, SCALE: 1 }),
  1,
);
close("cauchy mean block", call("cauchyMean", { LOCATION: 2, SCALE: 1 }), 2);
eq("cauchy stddev undefined", call("cauchyStdDev"), Infinity);
close("laplace pdf", call("laplacePdf", { X: 0, LOCATION: 0, SCALE: 1 }), 0.5);
close(
  "laplace cdf block",
  call("laplaceCdf", { X: 0, LOCATION: 0, SCALE: 1 }),
  0.5,
);
close(
  "laplace quantile block",
  call("laplaceQuantile", { PROBABILITY: 0.5 }),
  0,
);
close("laplace mean block", call("laplaceMean", { LOCATION: 3, SCALE: 2 }), 3);
close(
  "laplace variance block",
  call("laplaceVariance", { LOCATION: 3, SCALE: 2 }),
  8,
);
close(
  "laplace stddev block",
  call("laplaceStdDev", { LOCATION: 3, SCALE: 2 }),
  Math.sqrt(8),
);
close(
  "student-t pdf",
  call("studentTPdf", { X: 0, DEGREES_OF_FREEDOM: 10 }),
  0.38910838396603084,
  1e-12,
);
close(
  "student-t cdf block",
  call("studentTCdf", { X: 0, DEGREES_OF_FREEDOM: 10 }),
  0.5,
);
close(
  "student-t quantile block",
  call("studentTQuantile", { PROBABILITY: 0.975, DEGREES_OF_FREEDOM: 10 }),
  2.2281388519649385,
  1e-6,
);
close(
  "chi-square pdf",
  call("chiSquarePdf", { X: 1, DEGREES_OF_FREEDOM: 1 }),
  Math.exp(-0.5) / Math.sqrt(2 * Math.PI),
  1e-12,
);
close(
  "chi-square cdf block",
  call("chiSquareCdf", { X: 4, DEGREES_OF_FREEDOM: 4 }),
  1 - 3 * Math.exp(-2),
  1e-9,
);
close(
  "f distribution cdf",
  call("fDistributionCdf", {
    X: 1,
    NUMERATOR_DEGREES: 3,
    DENOMINATOR_DEGREES: 10,
  }),
  0.5676627969783062,
  1e-9,
);
close(
  "poisson pmf",
  call("poissonPmf", { K: 2, RATE: 4 }),
  Math.exp(-4) * 8,
  1e-12,
);
close(
  "poisson cdf",
  call("poissonCdf", { K: 2, RATE: 4 }),
  Math.exp(-4) * 13,
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
  252 / 1024,
  1e-12,
);
close(
  "binomial cdf",
  call("binomialCdf", { K: 5, TRIALS: 10, PROBABILITY: 0.5 }),
  638 / 1024,
  1e-12,
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
close("geometric pmf", call("geometricPmf", { K: 2, PROBABILITY: 0.5 }), 0.25);
close("geometric cdf", call("geometricCdf", { K: 2, PROBABILITY: 0.5 }), 0.75);
close(
  "negative binomial pmf",
  call("negativeBinomialPmf", { K: 5, SUCCESSES: 3, PROBABILITY: 0.5 }),
  0.1875,
);
close(
  "negative binomial cdf",
  call("negativeBinomialCdf", { K: 5, SUCCESSES: 3, PROBABILITY: 0.5 }),
  0.5,
);
close(
  "hypergeometric pmf",
  call("hypergeometricPmf", { K: 2, DRAWN: 10, SUCCESSES: 4, POPULATION: 20 }),
  0.4179566563467486,
  1e-9,
);
close(
  "hypergeometric cdf",
  call("hypergeometricCdf", { K: 2, DRAWN: 10, SUCCESSES: 4, POPULATION: 20 }),
  0.7089783281733767,
  1e-9,
);
close(
  "binomial mean block",
  call("binomialMean", { TRIALS: 10, PROBABILITY: 0.5 }),
  5,
);
close(
  "binomial variance block",
  call("binomialVariance", { TRIALS: 10, PROBABILITY: 0.5 }),
  2.5,
);
close(
  "binomial stddev block",
  call("binomialStdDev", { TRIALS: 10, PROBABILITY: 0.5 }),
  Math.sqrt(2.5),
);
close("poisson mean block", call("poissonMean", { RATE: 4 }), 4);
close("poisson variance block", call("poissonVariance", { RATE: 4 }), 4);
close("poisson stddev block", call("poissonStdDev", { RATE: 4 }), 2);
close("geometric mean block", call("geometricMean", { PROBABILITY: 0.5 }), 2);
close(
  "geometric variance block",
  call("geometricVariance", { PROBABILITY: 0.5 }),
  2,
);
close(
  "geometric stddev block",
  call("geometricStdDev", { PROBABILITY: 0.5 }),
  Math.SQRT2,
);
close("uniform mean block", call("uniformMean", { LOW: 0, HIGH: 1 }), 0.5);
close(
  "uniform variance block",
  call("uniformVariance", { LOW: 0, HIGH: 1 }),
  1 / 12,
);
close(
  "uniform stddev block",
  call("uniformStdDev", { LOW: 0, HIGH: 1 }),
  Math.sqrt(1 / 12),
);
close(
  "list shannon entropy",
  call("listShannonEntropy", { LIST: lst([1, 1, 2, 2]) }),
  1.9182958340544896,
  1e-12,
);
contains("physics constant list", call("physicsConstantList"), "speedOfLight");

/* ---------------- physics at block level ---------------- */
close(
  "acceleration from force",
  call("accelerationFromForce", { MASS: 3, FORCE: 30 }),
  10,
);
close(
  "mass from weight",
  call("massFromWeight", { WEIGHT: 686, GRAVITY: 9.80665 }),
  686 / 9.80665,
  1e-9,
);
close(
  "gravitational field",
  call("gravitationalField", { MASS: 5.9722e24, DISTANCE: 6371000 }),
  9.8203,
  1e-3,
);
close(
  "mass from density",
  call("massFromDensity", { DENSITY: 1000, VOLUME: 2 }),
  2000,
);
close(
  "force from pressure",
  call("forceFromPressure", { PRESSURE: 200, AREA: 0.5 }),
  100,
);
close(
  "electric potential of charge",
  call("electricPotentialOfCharge", { CHARGE: 1e-6, DISTANCE: 1 }),
  8987.551792261171,
  1e-6,
);
close(
  "voltage from current",
  call("voltageFromCurrent", { CURRENT: 2, RESISTANCE: 230 }),
  460,
);
close(
  "capacitance from energy",
  call("capacitanceFromEnergy", { ENERGY: 0.5, VOLTAGE: 10 }),
  1e-2,
  1e-12,
);
close(
  "frequency from photon energy",
  call("frequencyFromPhotonEnergy", { ENERGY: 3e-19 }),
  4.5276e14,
  1e-3,
);
close(
  "heat transferred",
  call("heatTransferred", { POWER: 1000, TIME: 60 }),
  60000,
);
close(
  "orbital escape energy",
  call("orbitalEscapeEnergy", { RADIUS: 6371000, MASS: 5.9722e24 }),
  (6.6743e-11 * 5.9722e24) / (2 * 6371000),
  1e-9,
);

/* ---------------- finance ---------------- */
close(
  "simple interest",
  call("simpleInterest", { PRINCIPAL: 1000, RATE: 5, YEARS: 3 }),
  150,
);
close(
  "compound amount",
  call("compoundAmount", { PRINCIPAL: 1000, RATE: 5, YEARS: 10, PERIODS: 12 }),
  1000 * Math.pow(1 + 0.05 / 12, 120),
  1e-12,
);
close(
  "continuous compound amount",
  call("continuousCompoundAmount", { PRINCIPAL: 1000, RATE: 5, YEARS: 10 }),
  1000 * Math.exp(0.5),
  1e-12,
);
close(
  "annual percentage yield",
  call("annualPercentageYield", { RATE: 5, PERIODS: 12 }),
  (Math.pow(1 + 0.05 / 12, 12) - 1) * 100,
  1e-12,
);
close("rule of 72", call("ruleOf72", { RATE: 6 }), 12);
close(
  "doubling time",
  call("doublingTime", { RATE: 6 }),
  Math.log(2) / Math.log(1.06),
  1e-12,
);
close(
  "monthly loan payment",
  call("monthlyLoanPayment", { PRINCIPAL: 10000, RATE: 6, MONTHS: 60 }),
  (10000 * 0.005) / (1 - Math.pow(1.005, -60)),
  1e-9,
);
close(
  "present value",
  call("presentValue", { AMOUNT: 1000, RATE: 5, YEARS: 10 }),
  1000 / Math.pow(1.05, 10),
  1e-12,
);

/* ---------------- unit helpers ---------------- */
close(
  "kilometres to miles",
  call("kilometresToMiles", { KM: 1 }),
  0.6213711922373339,
  1e-12,
);
close("miles to feet", call("milesToFeet", { MI: 1 }), 5280);
close("feet to miles", call("feetToMiles", { FT: 5280 }), 1);
close("pounds to stone", call("poundsToStone", { LB: 14 }), 1);
close("stone to pounds", call("stoneToPounds", { ST: 1 }), 14);
close("ounces to grams", call("ouncesToGrams", { OZ: 1 }), 28.349523125);
close("grams to ounces", call("gramsToOunces", { G: 28.349523125 }), 1, 1e-12);
close(
  "fahrenheit to kelvin",
  call("fahrenheitToKelvin", { F: 32 }),
  273.15,
  1e-12,
);
close(
  "litres to gallons",
  call("litresToGallons", { L: 1 }),
  0.2641720523581484,
  1e-12,
);
close(
  "gallons to litres",
  call("gallonsToLitres", { GAL: 1 }),
  3.785411784,
  1e-12,
);
close(
  "kilometres per hour to mph",
  call("kilometresPerHourToMilesPerHour", { KPH: 100 }),
  62.13711922373339,
  1e-12,
);
eq("unit dimension", call("unitDimension", { UNIT: "kilogram" }), "mass");
eq("unit symbol", call("unitSymbol", { UNIT: "kilogram" }), "kg");
eq("unit name", call("unitName", { UNIT: "kilogram" }), "kilogram");
contains("unit detail", call("unitDetail", { UNIT: "kilogram" }), "kg");
eq(
  "unit key for symbol",
  call("unitKeyForSymbol", { SYMBOL: "kg" }),
  "kilogram",
);
contains(
  "units in dimension",
  call("unitsInDimension", { DIMENSION: "mass" }),
  "kilogram",
);
contains("unit dimensions list", call("unitDimensionsList"), "mass");
close(
  "convert unit cross dimension",
  call("convertUnit", { VALUE: 1, FROM: "kilogram", TO: "gram" }),
  1000,
);

/* ---------------- random blocks (statistical) ---------------- */
const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
const variance = (v) =>
  v.reduce((a, b) => a + (b - mean(v)) ** 2, 0) / (v.length - 1);
const series = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
within(
  "random normal mean",
  mean(series(20000, () => call("randomNormal", { MEAN: 5, DEVIATION: 2 }))),
  5,
  0.1,
);
within(
  "random normal sd",
  Math.sqrt(
    variance(
      series(20000, () => call("randomNormal", { MEAN: 5, DEVIATION: 2 })),
    ),
  ),
  2,
  0.1,
);
within(
  "random exponential mean",
  mean(series(20000, () => call("randomExponential", { RATE: 2 }))),
  0.5,
  0.02,
);
ok(
  "random exponential positive",
  series(2000, () => call("randomExponential", { RATE: 1 })).every(
    (v) => v >= 0,
  ),
);
const triangles = series(20000, () =>
  call("randomTriangular", { LOW: 0, HIGH: 1, MODE: 0.25 }),
);
within("random triangular mean", mean(triangles), 1.25 / 3, 0.02);
ok(
  "random triangular range",
  triangles.every((v) => v >= 0 && v <= 1),
);
const dice = series(2000, () => call("rollDiceSum", { COUNT: 2, SIDES: 6 }));
within("dice sum mean", mean(dice), 7, 0.15);
ok(
  "dice sum range",
  dice.every((v) => v >= 2 && v <= 12 && Number.isInteger(v)),
);
const weighted = series(3000, () =>
  call("randomWeightedFromList", {
    LIST: lst([1, 2, 3]),
    WEIGHTS: lst([1, 1, 8]),
  }),
);
within("weighted pick mean", mean(weighted), (1 + 2 + 24) / 10, 0.15);
{
  const draws = series(10000, () =>
    call("binomialSample", { TRIALS: 10, PROBABILITY: 0.3 }),
  );
  within("binomial sample block mean", mean(draws), 3, 0.06);
  const ints = series(3000, () =>
    call("uniformIntegerSample", { LOW: 1, HIGH: 6 }),
  );
  within("uniform integer block mean", mean(ints), 3.5, 0.13);
  const uni = series(3000, () => call("uniformSample", { LOW: 2, HIGH: 4 }));
  within("uniform block mean", mean(uni), 3, 0.05);
  const bern = series(3000, () =>
    call("bernoulliSample", { PROBABILITY: 0.25 }),
  );
  within("bernoulli block mean", mean(bern), 0.25, 0.026);
  const pois = series(5000, () => call("poissonSample", { RATE: 5 }));
  within("poisson block mean", mean(pois), 5, 0.13);
  const geo = series(5000, () =>
    call("geometricSample", { PROBABILITY: 0.25 }),
  );
  within("geometric block mean", mean(geo), 4, 0.2);
  const hyp = series(3000, () =>
    call("hypergeometricSample", { DRAWN: 10, SUCCESSES: 4, POPULATION: 20 }),
  );
  within("hypergeometric block mean", mean(hyp), 2, 0.1);
  const neg = series(3000, () =>
    call("negativeBinomialSample", { SUCCESSES: 3, PROBABILITY: 0.5 }),
  );
  within("negative binomial block mean", mean(neg), 6, 0.3);
  const chi = series(5000, () =>
    call("chiSquareSample", { DEGREES_OF_FREEDOM: 4 }),
  );
  within("chi-square block mean", mean(chi), 4, 0.15);
  const logn = series(5000, () =>
    call("logNormalSample", { MEAN: 0, DEVIATION: 1 }),
  );
  within("log-normal block mean", mean(logn), Math.exp(0.5), 0.1);
  const gam = series(5000, () => call("gammaSample", { SHAPE: 3, SCALE: 2 }));
  within("gamma block mean", mean(gam), 6, 0.18);
  const bet = series(5000, () => call("betaSample", { A: 2, B: 3 }));
  within("beta block mean", mean(bet), 0.4, 0.02);
  const wei = series(5000, () => call("weibullSample", { SHAPE: 2, SCALE: 1 }));
  within("weibull block mean", mean(wei), Math.sqrt(Math.PI) / 2, 0.02);
  const cau = series(5000, () =>
    call("cauchySample", { LOCATION: 0, SCALE: 1 }),
  );
  const med = (v) => {
    const sorted = [...v].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  within("cauchy block median", med(cau), 0, 0.1);
  const lap = series(5000, () =>
    call("laplaceSample", { LOCATION: 0, SCALE: 1 }),
  );
  within("laplace block mean", mean(lap), 0, 0.065);
  const stu = series(5000, () =>
    call("studentTSample", { DEGREES_OF_FREEDOM: 5 }),
  );
  within("student-t block median", med(stu), 0, 0.1);
  ok("student-t block sd heavy", Math.sqrt(variance(stu)) > 1);
  const std = series(5000, () => call("standardNormalSample"));
  within("standard normal block mean", mean(std), 0, 0.05);
  ok("standard normal block variance", Math.abs(variance(std) - 1) < 0.07);
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
