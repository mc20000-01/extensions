import * as constants from "./blocks/constants.js";
import * as rounding from "./blocks/rounding.js";
import * as trigonometry from "./blocks/trigonometry.js";
import * as logarithms from "./blocks/logarithms.js";
import * as algebra from "./blocks/algebra.js";
import * as combinatorics from "./blocks/combinatorics.js";
import * as numbertheory from "./blocks/numbertheory.js";
import * as digits from "./blocks/digits.js";
import * as logic from "./blocks/logic.js";
import * as utility from "./blocks/utility.js";
import * as geometry from "./blocks/geometry.js";
import * as vectors from "./blocks/vectors.js";
import * as calculus from "./blocks/calculus.js";
import * as statistics from "./blocks/statistics.js";
import * as special from "./blocks/special.js";
import * as probability from "./blocks/probability.js";
import * as finance from "./blocks/finance.js";
import * as units from "./blocks/units.js";
import * as distributions from "./blocks/distributions.js";
import * as physics from "./blocks/physics.js";
import * as astronomy from "./blocks/astronomy.js";
import * as discrete from "./blocks/discrete.js";
import * as data from "./blocks/data.js";
import * as helpers from "./helpers.js";

export { setup } from "./setup.js";

export const blocks = {
  ...constants,
  ...rounding,
  ...trigonometry,
  ...logarithms,
  ...algebra,
  ...combinatorics,
  ...numbertheory,
  ...digits,
  ...logic,
  ...utility,
  ...geometry,
  ...vectors,
  ...calculus,
  ...statistics,
  ...special,
  ...probability,
  ...finance,
  ...units,
  ...distributions,
  ...physics,
  ...astronomy,
  ...discrete,
  ...data,
};

export const methods = {
  ...helpers,
};
