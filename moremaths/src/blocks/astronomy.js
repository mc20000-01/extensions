export function orbitalPeriod(args) {
  const radius = this.num(args.RADIUS);
  const mass = this.num(args.CENTRAL_MASS);
  if (!(radius > 0) || !(mass > 0)) return NaN;
  return (
    2 *
    Math.PI *
    Math.sqrt(
      (radius * radius * radius) /
        (PHYSICS_CONSTANTS.gravitationalConstant * mass),
    )
  );
}

export function orbitalRadius(args) {
  const period = this.num(args.PERIOD);
  const mass = this.num(args.CENTRAL_MASS);
  if (!(period > 0) || !(mass > 0)) return NaN;
  const inner =
    (PHYSICS_CONSTANTS.gravitationalConstant * mass) /
    ((2 * Math.PI) / period) ** 2;
  return inner ** (1 / 3);
}

export function orbitalSpeed(args) {
  const radius = Math.abs(this.num(args.RADIUS));
  if (!(radius > 0)) return NaN;
  return Math.sqrt(
    (PHYSICS_CONSTANTS.gravitationalConstant * this.num(args.CENTRAL_MASS)) /
      radius,
  );
}

export function circularOrbitSpeed(args) {
  const period = this.num(args.PERIOD);
  return period === 0
    ? NaN
    : (2 * Math.PI * Math.abs(this.num(args.RADIUS))) / period;
}

export function meanMotion(args) {
  const period = this.num(args.PERIOD);
  return period === 0 ? NaN : (2 * Math.PI) / Math.abs(period);
}

export function synodicPeriod(args) {
  const first = Math.abs(this.num(args.PERIOD1));
  const second = Math.abs(this.num(args.PERIOD2));
  if (!(first > 0) || !(second > 0) || first === second) return Infinity;
  return (first * second) / Math.abs(second - first);
}

export function escapeVelocity(args) {
  const radius = Math.abs(this.num(args.RADIUS));
  if (!(radius > 0)) return NaN;
  return Math.sqrt(
    (2 * PHYSICS_CONSTANTS.gravitationalConstant * this.num(args.MASS)) /
      radius,
  );
}

export function orbitalEscapeEnergy(args) {
  const mass = this.num(args.MASS);
  const radius = Math.abs(this.num(args.RADIUS));
  if (!(radius > 0)) return NaN;
  // Escape energy per kilogram is G*M/(2R), half the potential energy.
  return (PHYSICS_CONSTANTS.gravitationalConstant * mass) / (2 * radius);
}

export function schwarzschildRadius(args) {
  return (
    (2 * PHYSICS_CONSTANTS.gravitationalConstant * this.num(args.MASS)) /
    PHYSICS_CONSTANTS.speedOfLight ** 2
  );
}

export function orbitalEccentricity(args) {
  const total =
    Math.abs(this.num(args.PERIAPSIS)) + Math.abs(this.num(args.APOAPSIS));
  if (total === 0) return 0;
  return (
    Math.abs(
      Math.abs(this.num(args.APOAPSIS)) - Math.abs(this.num(args.PERIAPSIS)),
    ) / total
  );
}

export function semiMajorAxis(args) {
  return (
    (Math.abs(this.num(args.PERIAPSIS)) + Math.abs(this.num(args.APOAPSIS))) / 2
  );
}

export function hillRadius(args) {
  const axis = Math.abs(this.num(args.SEMI_MAJOR_AXIS));
  const body = this.num(args.BODY_MASS);
  const central = this.num(args.CENTRAL_MASS);
  if (!(axis > 0) || !(body > 0) || !(central > 0)) return NaN;
  const eccentricity = Math.min(
    Math.max(this.num(args.ECCENTRICITY), 0),
    0.999,
  );
  return axis * (1 - eccentricity) * (body / (3 * central)) ** (1 / 3);
}

export function rocheLimit(args) {
  const radius = Math.abs(this.num(args.BODY_RADIUS));
  const satelliteDensity = this.num(args.SATELLITE_DENSITY);
  if (!(radius > 0) || !(satelliteDensity > 0)) return NaN;
  return (
    2.44 * radius * (this.num(args.BODY_DENSITY) / satelliteDensity) ** (1 / 3)
  );
}

export function lightTravelSeconds(args) {
  return this.num(args.DISTANCE) / PHYSICS_CONSTANTS.speedOfLight;
}

export function distanceFromLightTime(args) {
  return this.num(args.SECONDS) * PHYSICS_CONSTANTS.speedOfLight;
}

export function lightTravelYears(args) {
  return this.num(args.LIGHT_YEARS);
}

export function lightTimeFromDistance(args) {
  return (
    this.num(args.DISTANCE) / PHYSICS_CONSTANTS.speedOfLight / 86400 / 365.25
  );
}

export function distanceFromParallax(args) {
  const parallax = this.num(args.PARALLAX);
  return parallax === 0 ? Infinity : 1 / Math.abs(parallax);
}

export function parallaxFromDistance(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  return distance === 0 ? Infinity : 1 / distance;
}

export function brightnessToMagnitude(args) {
  const brightness = this.num(args.BRIGHTNESS);
  if (!(brightness > 0)) return NaN;
  return -2.5 * Math.log10(brightness);
}

export function brightnessFromMagnitude(args) {
  return 10 ** (-0.4 * this.num(args.MAGNITUDE));
}

export function magnitudeDifference(args) {
  const first = this.num(args.BRIGHTNESS1);
  const second = this.num(args.BRIGHTNESS2);
  if (!(first > 0) || !(second > 0)) return NaN;
  return -2.5 * Math.log10(first / second);
}

export function absoluteMagnitude(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  if (!(distance > 0)) return NaN;
  return this.num(args.APPARENT) - 5 * Math.log10(distance / 10);
}

export function distanceFromAbsoluteMagnitude(args) {
  return 10 ** ((this.num(args.APPARENT) - this.num(args.ABSOLUTE) + 5) / 5);
}

export function angularDiameterDegrees(args) {
  const size = Math.abs(this.num(args.DIAMETER));
  const distance = Math.abs(this.num(args.DISTANCE));
  if (!(distance > 0)) return NaN;
  return this.radiansToDegrees(2 * Math.atan(size / (2 * distance)));
}

export function angularDiameterArcseconds(args) {
  return this.angularDiameterDegrees(args) * 3600;
}

export function distanceFromAngularSize(args) {
  const angle = this.degreesToRadians(this.num(args.ANGLE));
  if (angle === 0) return Infinity;
  return Math.abs(this.num(args.DIAMETER)) / (2 * Math.tan(angle / 2));
}

export function solarConstant(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  if (!(distance > 0)) return NaN;
  return (
    PHYSICS_CONSTANTS.solarLuminosity / (4 * Math.PI * distance * distance)
  );
}

export function starLuminosity(args) {
  const ratio = this.num(args.STAR_LUMINOSITY);
  if (!(ratio > 0)) return NaN;
  return ratio * PHYSICS_CONSTANTS.solarLuminosity;
}

export function habitableZoneInner(args) {
  const luminosity = this.num(args.STAR_LUMINOSITY);
  if (!(luminosity > 0)) return NaN;
  return PHYSICS_CONSTANTS.astronomicalUnit * Math.sqrt(luminosity / 1.107);
}

export function habitableZoneOuter(args) {
  const luminosity = this.num(args.STAR_LUMINOSITY);
  if (!(luminosity > 0)) return NaN;
  return PHYSICS_CONSTANTS.astronomicalUnit * Math.sqrt(luminosity / 0.356);
}

export function planckRadiance(args) {
  const wavelength = this.num(args.WAVELENGTH);
  const temperature = this.num(args.TEMPERATURE);
  if (!(wavelength > 0) || !(temperature > 0)) return 0;
  const h = PHYSICS_CONSTANTS.planckConstant;
  const c = PHYSICS_CONSTANTS.speedOfLight;
  const k = PHYSICS_CONSTANTS.boltzmannConstant;
  const exponent = (h * c) / (wavelength * k * temperature);
  if (exponent > 700) return 0;
  return (2 * h * c * c) / wavelength ** 5 / (Math.exp(exponent) - 1);
}

export function redshiftToVelocity(args) {
  const redshift = this.num(args.REDSHIFT);
  const c = PHYSICS_CONSTANTS.speedOfLight;
  const factor = (1 + redshift) ** 2;
  if (1 + redshift <= 0) return NaN;
  return (c * (factor - 1)) / (factor + 1);
}

export function velocityToRedshift(args) {
  const speed = this.num(args.VELOCITY);
  const ratio = speed / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return NaN;
  return Math.sqrt((1 + ratio) / (1 - ratio)) - 1;
}
