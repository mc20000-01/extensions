export function physicalConstant(args) {
  const entry = PHYSICS_CONSTANTS[String(args.CONSTANT)];
  return entry === undefined ? NaN : entry;
}

export function physicsConstantList() {
  return Object.keys(PHYSICS_CONSTANTS).join(", ");
}

export function kineticEnergy(args) {
  const mass = this.num(args.MASS);
  const velocity = this.num(args.VELOCITY);
  return 0.5 * mass * velocity * velocity;
}

export function potentialEnergy(args) {
  const mass = this.num(args.MASS);
  const height = this.num(args.HEIGHT);
  return mass * PHYSICS_CONSTANTS.standardGravity * height;
}

export function elasticEnergy(args) {
  const springConstant = this.num(args.SPRING_CONSTANT);
  const extension = this.num(args.EXTENSION);
  return 0.5 * springConstant * extension * extension;
}

export function momentumOf(args) {
  return this.num(args.MASS) * this.num(args.VELOCITY);
}

export function impulseOf(args) {
  return this.num(args.MASS) * this.num(args.CHANGE_IN_VELOCITY);
}

export function massFromMomentum(args) {
  const velocity = this.num(args.VELOCITY);
  return velocity === 0 ? NaN : this.num(args.MOMENTUM) / velocity;
}

export function speedFromKineticEnergy(args) {
  const mass = this.num(args.MASS);
  if (!(mass > 0)) return NaN;
  return Math.sqrt((2 * this.num(args.ENERGY)) / mass);
}

export function workDone(args) {
  const force = this.num(args.FORCE);
  const distance = this.num(args.DISTANCE);
  const angle = this.degreesToRadians(this.num(args.ANGLE));
  return force * distance * Math.cos(angle);
}

export function powerFromWork(args) {
  const time = this.num(args.TIME);
  return time === 0 ? NaN : this.num(args.WORK) / time;
}

export function forceFromAcceleration(args) {
  return this.num(args.MASS) * this.num(args.ACCELERATION);
}

export function accelerationFromForce(args) {
  const mass = this.num(args.MASS);
  return mass === 0 ? NaN : this.num(args.FORCE) / mass;
}

export function weightOf(args) {
  return this.num(args.MASS) * this.num(args.GRAVITY);
}

export function massFromWeight(args) {
  const gravity = this.num(args.GRAVITY);
  return gravity === 0 ? NaN : this.num(args.WEIGHT) / gravity;
}

export function gravitationalForce(args) {
  const first = this.num(args.MASS1);
  const second = this.num(args.MASS2);
  const distance = Math.abs(this.num(args.DISTANCE));
  if (distance === 0) return Infinity;
  return (
    (PHYSICS_CONSTANTS.gravitationalConstant * first * second) /
    (distance * distance)
  );
}

export function gravitationalField(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  if (distance === 0) return Infinity;
  return (
    (PHYSICS_CONSTANTS.gravitationalConstant * this.num(args.MASS)) /
    (distance * distance)
  );
}

export function surfaceGravityOf(args) {
  const mass = this.num(args.MASS);
  const radius = this.num(args.RADIUS);
  if (!(radius > 0)) return NaN;
  return (PHYSICS_CONSTANTS.gravitationalConstant * mass) / (radius * radius);
}

export function hookeLawForce(args) {
  return this.num(args.SPRING_CONSTANT) * this.num(args.EXTENSION);
}

export function centripetalForce(args) {
  const mass = this.num(args.MASS);
  const velocity = this.num(args.VELOCITY);
  const radius = Math.abs(this.num(args.RADIUS));
  if (radius === 0) return Infinity;
  return (mass * velocity * velocity) / radius;
}

export function centripetalAcceleration(args) {
  const velocity = this.num(args.VELOCITY);
  const radius = Math.abs(this.num(args.RADIUS));
  if (radius === 0) return Infinity;
  return (velocity * velocity) / radius;
}

export function densityOf(args) {
  const volume = this.num(args.VOLUME);
  return volume === 0 ? NaN : this.num(args.MASS) / volume;
}

export function massFromDensity(args) {
  return this.num(args.DENSITY) * this.num(args.VOLUME);
}

export function pressureFromForce(args) {
  const area = this.num(args.AREA);
  return area === 0 ? NaN : this.num(args.FORCE) / area;
}

export function forceFromPressure(args) {
  return this.num(args.PRESSURE) * this.num(args.AREA);
}

export function buoyantForce(args) {
  return (
    this.num(args.VOLUME) *
    this.num(args.FLUID_DENSITY) *
    PHYSICS_CONSTANTS.standardGravity
  );
}

export function apparentWeightInFluid(args) {
  return (
    this.num(args.MASS) * PHYSICS_CONSTANTS.standardGravity -
    this.buoyantForce(args)
  );
}

export function archimedesDisplacedMass(args) {
  return this.num(args.VOLUME) * this.num(args.FLUID_DENSITY);
}

export function angularVelocityFromPeriod(args) {
  const period = this.num(args.PERIOD);
  return period === 0 ? NaN : (2 * Math.PI) / period;
}

export function periodFromAngularVelocity(args) {
  const omega = this.num(args.ANGULAR_VELOCITY);
  return omega === 0 ? NaN : (2 * Math.PI) / Math.abs(omega);
}

export function rpmToRadiansPerSecond(args) {
  return (this.num(args.RPM) * 2 * Math.PI) / 60;
}

export function radiansPerSecondToRpm(args) {
  return (this.num(args.RADIANS_PER_SECOND) * 60) / (2 * Math.PI);
}

export function momentOfInertiaPoint(args) {
  return this.num(args.MASS) * this.num(args.RADIUS) ** 2;
}

export function momentOfInertiaRod(args) {
  return (this.num(args.MASS) * this.num(args.LENGTH) ** 2) / 12;
}

export function momentOfInertiaSphere(args) {
  return (2 / 5) * this.num(args.MASS) * this.num(args.RADIUS) ** 2;
}

export function rotationalKineticEnergy(args) {
  const inertia = this.num(args.INERTIA);
  const omega = this.num(args.ANGULAR_VELOCITY);
  return 0.5 * inertia * omega * omega;
}

export function torqueFromForce(args) {
  const angle = this.degreesToRadians(this.num(args.ANGLE));
  return this.num(args.FORCE) * this.num(args.LEVER_ARM) * Math.sin(angle);
}

export function leverArmFromTorque(args) {
  const force = this.num(args.FORCE);
  return force === 0 ? NaN : this.num(args.TORQUE) / force;
}

export function momentOfForce(args) {
  return this.num(args.FORCE) * this.num(args.LEVER_ARM);
}

export function waveSpeed(args) {
  return this.num(args.FREQUENCY) * this.num(args.WAVELENGTH);
}

export function frequencyFromWave(args) {
  const wavelength = this.num(args.WAVELENGTH);
  return wavelength === 0 ? NaN : this.num(args.SPEED) / wavelength;
}

export function wavelengthFromWave(args) {
  const frequency = this.num(args.FREQUENCY);
  return frequency === 0 ? NaN : this.num(args.SPEED) / frequency;
}

export function wavePeriod(args) {
  const frequency = this.num(args.FREQUENCY);
  return frequency === 0 ? NaN : 1 / frequency;
}

export function speedInMedium(args) {
  const density = this.num(args.DENSITY);
  if (!(density > 0)) return NaN;
  return Math.sqrt(this.num(args.BULK_MODULUS) / density);
}

export function beatsPerSecond(args) {
  return Math.abs(
    this.num(args.FIRST_FREQUENCY) - this.num(args.SECOND_FREQUENCY),
  );
}

export function dopplerShift(args) {
  const speed = this.num(args.SPEED);
  const frequency = this.num(args.FREQUENCY);
  const sign = this.num(args.APPROACHING) !== 0 ? -1 : 1;
  return (
    (frequency * PHYSICS_CONSTANTS.speedOfSoundInAir) /
    (PHYSICS_CONSTANTS.speedOfSoundInAir + sign * speed)
  );
}

export function snellRefraction(args) {
  const first = this.num(args.INDEX1);
  const second = this.num(args.INDEX2);
  const angle = this.degreesToRadians(this.num(args.ANGLE1));
  const ratio = (first * Math.sin(angle)) / second;
  if (Math.abs(ratio) > 1) return NaN;
  return (180 / Math.PI) * Math.asin(ratio);
}

export function criticalAngle(args) {
  const first = this.num(args.INDEX1);
  const second = this.num(args.INDEX2);
  const ratio = second / first;
  if (Math.abs(ratio) > 1) return NaN;
  return (180 / Math.PI) * Math.asin(ratio);
}

export function indexOfRefraction(args) {
  const speed = this.num(args.SPEED);
  return speed === 0 ? NaN : PHYSICS_CONSTANTS.speedOfLight / speed;
}

export function lensImageDistance(args) {
  const focal = this.num(args.FOCAL_LENGTH);
  const object = this.num(args.OBJECT_DISTANCE);
  const power = 1 / focal - 1 / object;
  return power === 0 ? Infinity : 1 / power;
}

export function lensMagnification(args) {
  const focal = this.num(args.FOCAL_LENGTH);
  const object = this.num(args.OBJECT_DISTANCE);
  const image = this.lensImageDistance({
    FOCAL_LENGTH: focal,
    OBJECT_DISTANCE: object,
  });
  if (!Number.isFinite(image)) return NaN;
  return -image / object;
}

export function photonEnergy(args) {
  return PHYSICS_CONSTANTS.planckConstant * this.num(args.FREQUENCY);
}

export function frequencyFromPhotonEnergy(args) {
  return this.num(args.ENERGY) / PHYSICS_CONSTANTS.planckConstant;
}

export function photonWavelength(args) {
  const energy = this.num(args.ENERGY);
  if (!(energy > 0)) return NaN;
  return (
    (PHYSICS_CONSTANTS.planckConstant * PHYSICS_CONSTANTS.speedOfLight) / energy
  );
}

export function deBroglieWavelength(args) {
  const momentum = this.num(args.MOMENTUM);
  if (momentum === 0) return Infinity;
  return PHYSICS_CONSTANTS.planckConstant / Math.abs(momentum);
}

export function bohrEnergyLevel(args) {
  const n = this.num(args.LEVEL);
  if (!(n > 0)) return NaN;
  return -(13.605693122994 * PHYSICS_CONSTANTS.elementaryCharge) / (n * n);
}

export function hydrogenWavelength(args) {
  const level = this.num(args.LEVEL);
  const target = this.num(args.TO_LEVEL);
  if (!(level > 0) || !(target > 0) || level === target) return NaN;
  const inverse = Math.abs((1 / target) ** 2 - (1 / level) ** 2);
  if (inverse === 0) return NaN;
  return 1e9 / (PHYSICS_CONSTANTS.rydbergConstant * inverse);
}

export function lorentzFactor(args) {
  const ratio = this.num(args.VELOCITY) / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return Infinity;
  return 1 / Math.sqrt(1 - ratio * ratio);
}

export function relativisticMass(args) {
  const ratio = this.num(args.VELOCITY) / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return Infinity;
  return this.num(args.REST_MASS) / Math.sqrt(1 - ratio * ratio);
}

export function relativisticMomentum(args) {
  const speed = this.num(args.VELOCITY);
  const mass = this.num(args.REST_MASS);
  const ratio = speed / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return Infinity;
  return (mass * speed) / Math.sqrt(1 - ratio * ratio);
}

export function relativisticEnergy(args) {
  const speed = this.num(args.VELOCITY);
  const mass = this.num(args.REST_MASS);
  const ratio = speed / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return Infinity;
  const root = Math.sqrt(1 - ratio * ratio);
  return (mass * PHYSICS_CONSTANTS.speedOfLight ** 2 * (1 - root)) / root;
}

export function timeDilation(args) {
  const ratio = this.num(args.VELOCITY) / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return Infinity;
  return this.num(args.PROPER_TIME) / Math.sqrt(1 - ratio * ratio);
}

export function lengthContraction(args) {
  const ratio = this.num(args.VELOCITY) / PHYSICS_CONSTANTS.speedOfLight;
  if (Math.abs(ratio) >= 1) return NaN;
  return this.num(args.PROPER_LENGTH) * Math.sqrt(1 - ratio * ratio);
}

export function energyFromMass(args) {
  const mass = this.num(args.MASS);
  return mass * PHYSICS_CONSTANTS.speedOfLight ** 2;
}

export function massFromEnergy(args) {
  return this.num(args.ENERGY) / PHYSICS_CONSTANTS.speedOfLight ** 2;
}

export function energyMomentumRelation(args) {
  const energy = this.num(args.ENERGY);
  const momentum = this.num(args.MOMENTUM);
  const difference =
    energy * energy - momentum * momentum * PHYSICS_CONSTANTS.speedOfLight ** 2;
  if (difference < 0) return NaN;
  return Math.sqrt(difference) / PHYSICS_CONSTANTS.speedOfLight ** 2;
}

export function coulombForce(args) {
  const first = this.num(args.CHARGE1);
  const second = this.num(args.CHARGE2);
  const distance = Math.abs(this.num(args.DISTANCE));
  if (distance === 0) return Infinity;
  return (
    (first * second) /
    (4 * Math.PI * PHYSICS_CONSTANTS.vacuumPermittivity * distance * distance)
  );
}

export function electricFieldOfCharge(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  if (distance === 0) return Infinity;
  return (
    this.num(args.CHARGE) /
    (4 * Math.PI * PHYSICS_CONSTANTS.vacuumPermittivity * distance * distance)
  );
}

export function electricPotentialOfCharge(args) {
  const distance = Math.abs(this.num(args.DISTANCE));
  if (distance === 0) return Infinity;
  return (
    this.num(args.CHARGE) /
    (4 * Math.PI * PHYSICS_CONSTANTS.vacuumPermittivity * distance)
  );
}

export function electricPotentialEnergy(args) {
  return (
    this.num(args.CHARGE1) *
    this.electricPotentialOfCharge({
      CHARGE: this.num(args.CHARGE2),
      DISTANCE: args.DISTANCE,
    })
  );
}

export function currentFromPower(args) {
  const voltage = this.num(args.VOLTAGE);
  return voltage === 0 ? NaN : this.num(args.POWER) / voltage;
}

export function voltageFromCurrent(args) {
  return this.num(args.CURRENT) * this.num(args.RESISTANCE);
}

export function resistanceFromOhm(args) {
  const current = this.num(args.CURRENT);
  return current === 0 ? NaN : this.num(args.VOLTAGE) / current;
}

export function electricalPower(args) {
  return this.num(args.VOLTAGE) * this.num(args.CURRENT);
}

export function resistanceFromGeometry(args) {
  const area = this.num(args.AREA);
  if (area === 0) return NaN;
  return (this.num(args.RESISTIVITY) * this.num(args.LENGTH)) / area;
}

export function capacitanceFromEnergy(args) {
  const voltage = this.num(args.VOLTAGE);
  if (voltage === 0) return NaN;
  return (2 * this.num(args.ENERGY)) / (voltage * voltage);
}

export function capacitorEnergy(args) {
  return 0.5 * this.num(args.CAPACITANCE) * this.num(args.VOLTAGE) ** 2;
}

export function magneticForce(args) {
  const angle = this.degreesToRadians(this.num(args.ANGLE));
  return (
    this.num(args.CHARGE) *
    this.num(args.VELOCITY) *
    this.num(args.FIELD) *
    Math.sin(angle)
  );
}

export function cyclotronFrequency(args) {
  const mass = this.num(args.MASS);
  if (mass === 0) return NaN;
  // Cyclotron frequency in hertz: f = qB/(2*pi*m).
  return (
    (Math.abs(this.num(args.CHARGE)) * this.num(args.FIELD)) /
    (2 * Math.PI * Math.abs(mass))
  );
}

export function thermalEnergyChange(args) {
  return (
    this.num(args.MASS) *
    this.num(args.SPECIFIC_HEAT) *
    this.num(args.TEMPERATURE_CHANGE)
  );
}

export function heatTransferred(args) {
  return this.num(args.POWER) * this.num(args.TIME);
}

export function specificHeatFromEnergy(args) {
  const product = this.num(args.MASS) * this.num(args.TEMPERATURE_CHANGE);
  return product === 0 ? NaN : this.num(args.ENERGY) / product;
}

export function idealGasPressure(args) {
  const amount = this.num(args.AMOUNT);
  const volume = this.num(args.VOLUME);
  return volume === 0
    ? NaN
    : (amount *
        PHYSICS_CONSTANTS.molarGasConstant *
        this.num(args.TEMPERATURE)) /
        volume;
}

export function idealGasVolume(args) {
  const pressure = this.num(args.PRESSURE);
  return pressure === 0
    ? NaN
    : (this.num(args.AMOUNT) *
        PHYSICS_CONSTANTS.molarGasConstant *
        this.num(args.TEMPERATURE)) /
        pressure;
}

export function idealGasTemperature(args) {
  const divisor = this.num(args.AMOUNT) * PHYSICS_CONSTANTS.molarGasConstant;
  return divisor === 0
    ? NaN
    : (this.num(args.PRESSURE) * this.num(args.VOLUME)) / divisor;
}

export function vanDerWaalsPressure(args) {
  const amount = this.num(args.AMOUNT);
  const volume = this.num(args.VOLUME);
  const excluded = volume - amount * this.num(args.B);
  if (excluded === 0 || volume === 0) return NaN;
  const ideal =
    (amount * PHYSICS_CONSTANTS.molarGasConstant * this.num(args.TEMPERATURE)) /
    excluded;
  const correction = (this.num(args.A) * amount * amount) / (volume * volume);
  return ideal - correction;
}

export function thermalEfficiency(args) {
  const input = this.num(args.HEAT_INPUT);
  return input === 0 ? NaN : this.num(args.WORK_OUTPUT) / input;
}

export function carnotEfficiency(args) {
  const hot = this.num(args.HOT_TEMPERATURE);
  const cold = this.num(args.COLD_TEMPERATURE);
  return hot === 0 ? NaN : 1 - cold / hot;
}

export function heatEngineWork(args) {
  return this.num(args.HEAT_INPUT) - this.num(args.HEAT_OUTPUT);
}

export function stefanBoltzmannFlux(args) {
  const temperature = this.num(args.TEMPERATURE);
  return PHYSICS_CONSTANTS.stefanBoltzmannConstant * temperature ** 4;
}

export function peakWavelength(args) {
  const temperature = this.num(args.TEMPERATURE);
  return temperature === 0 ? Infinity : 2.897771955e-3 / temperature;
}

export function photonFluxOfPower(args) {
  const energy = this.num(args.FREQUENCY) * PHYSICS_CONSTANTS.planckConstant;
  return energy === 0 ? Infinity : this.num(args.POWER) / energy;
}

export function halfLifeRemaining(args) {
  const halfLife = this.num(args.HALF_LIFE);
  if (halfLife <= 0) return 0;
  return 0.5 ** (this.num(args.ELAPSED) / halfLife);
}

export function activityFromDecay(args) {
  const lambda = Math.LN2 / this.num(args.HALF_LIFE);
  return lambda * this.num(args.ATOMS);
}
