export function sine(args) {
  return Math.sin(this.degreesToRadians(args.ANGLE));
}

export function cosine(args) {
  return Math.cos(this.degreesToRadians(args.ANGLE));
}

export function tangent(args) {
  return Math.tan(this.degreesToRadians(args.ANGLE));
}

export function secant(args) {
  return 1 / Math.cos(this.degreesToRadians(args.ANGLE));
}

export function cosecant(args) {
  return 1 / Math.sin(this.degreesToRadians(args.ANGLE));
}

export function cotangent(args) {
  const sine = Math.sin(this.degreesToRadians(args.ANGLE));
  return 1 / (Math.cos(this.degreesToRadians(args.ANGLE)) / sine);
}

export function arcSine(args) {
  return this.radiansToDegrees(Math.asin(this.num(args.VALUE)));
}

export function arcCosine(args) {
  return this.radiansToDegrees(Math.acos(this.num(args.VALUE)));
}

export function arcTangent(args) {
  return this.radiansToDegrees(Math.atan(this.num(args.VALUE)));
}

export function arcCotangent(args) {
  // arccot(x) = 90° - arctan(x), so the result lands in (0, 180).
  return 90 - this.radiansToDegrees(Math.atan(this.num(args.VALUE)));
}

export function arcTangent2(args) {
  return this.radiansToDegrees(Math.atan2(this.num(args.Y), this.num(args.X)));
}

export function hyperbolicSine(args) {
  return Math.sinh(this.num(args.VALUE));
}

export function hyperbolicCosine(args) {
  return Math.cosh(this.num(args.VALUE));
}

export function hyperbolicTangent(args) {
  return Math.tanh(this.num(args.VALUE));
}

export function hyperbolicSecant(args) {
  return 1 / Math.cosh(this.num(args.VALUE));
}

export function hyperbolicCosecant(args) {
  return 1 / Math.sinh(this.num(args.VALUE));
}

export function hyperbolicCotangent(args) {
  return 1 / Math.tanh(this.num(args.VALUE));
}

export function arcHyperbolicSine(args) {
  return Math.asinh(this.num(args.VALUE));
}

export function arcHyperbolicCosine(args) {
  return Math.acosh(this.num(args.VALUE));
}

export function arcHyperbolicTangent(args) {
  return Math.atanh(this.num(args.VALUE));
}

export function arcHyperbolicSecant(args) {
  return Math.acosh(1 / this.num(args.VALUE));
}

export function arcHyperbolicCosecant(args) {
  return Math.asinh(1 / this.num(args.VALUE));
}

export function arcHyperbolicCotangent(args) {
  return Math.atanh(1 / this.num(args.VALUE));
}

export function degreesToRadiansBlock(args) {
  return this.degreesToRadians(args.ANGLE);
}

export function radiansToDegreesBlock(args) {
  return this.radiansToDegrees(args.RADIANS);
}

export function angleUnitToDegrees(args) {
  const angle = this.num(args.ANGLE);
  switch (args.UNIT) {
    case "radians":
      return this.radiansToDegrees(angle);
    case "turns":
      return angle * 360;
    case "gradians":
      return (angle * 360) / 400;
    default:
      return angle;
  }
}

export function angleUnitToRadians(args) {
  const angle = this.num(args.ANGLE);
  switch (args.UNIT) {
    case "turns":
      return angle * 2 * Math.PI;
    case "gradians":
      return this.degreesToRadians((angle * 360) / 400);
    default:
      return this.degreesToRadians(angle);
  }
}

export function wrapAngle(args) {
  const angle = this.num(args.ANGLE);
  if (!Number.isFinite(angle)) return angle;
  let wrapped = this.positiveRemainder(angle + 180, 360) - 180;
  if (wrapped === -180) wrapped = 180;
  return wrapped;
}
