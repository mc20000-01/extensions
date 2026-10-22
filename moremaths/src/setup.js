// Everything here ends up at the top of the built file, so the block
// handlers and helpers in src/ can use these names. Handlers are copied
// out as text, so they can't import anything.
export function setup() {
  const NUMBER_WORDS = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const TENS_WORDS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const SCALE_WORDS = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
  ];

  const PHYSICS_CONSTANTS = {
    speedOfLight: 299792458,
    speedOfSoundInAir: 343,
    speedOfSoundInWater: 1481,
    planckConstant: 6.62607015e-34,
    reducedPlanckConstant: 1.054571817e-34,
    planckLength: 1.616255e-35,
    planckTime: 5.391247e-44,
    planckMass: 2.176434e-8,
    planckTemperature: 1.416784e32,
    gravitationalConstant: 6.6743e-11,
    standardGravity: 9.80665,
    boltzmannConstant: 1.380649e-23,
    avogadroConstant: 6.02214076e23,
    molarGasConstant: 8.314462618,
    faradayConstant: 96485.33212,
    elementaryCharge: 1.602176634e-19,
    electronMass: 9.1093837015e-31,
    protonMass: 1.67262192369e-27,
    neutronMass: 1.67492749804e-27,
    atomicMassConstant: 1.6605390666e-27,
    bohrRadius: 5.29177210903e-11,
    rydbergConstant: 10973731.56816,
    fineStructureConstant: 7.2973525693e-3,
    stefanBoltzmannConstant: 5.670374419e-8,
    vacuumPermittivity: 8.8541878128e-12,
    vacuumPermeability: 1.25663706212e-6,
    impedanceOfFreeSpace: 376.730313668,
    atmospherePressure: 101325,
    waterFreezingPoint: 273.15,
    waterBoilingPoint: 373.15,
    carbon14HalfLife: 5730,
    solarLuminosity: 3.828e26,
    solarMass: 1.98847e30,
    solarRadius: 6.957e8,
    earthMass: 5.9722e24,
    earthRadius: 6.371e6,
    moonDistance: 3.844e8,
    earthMoonMassRatio: 0.0123,
    astronomicalUnit: 1.495978707e11,
    parsec: 3.0856775814913673e16,
    lightYear: 9.4607304725808e15,
  };

  const UNITS = {
    kilogram: ["mass", 1, "kg", "kilogram"],
    gram: ["mass", 0.001, "g", "gram"],
    milligram: ["mass", 1e-6, "mg", "milligram"],
    microgram: ["mass", 1e-9, "µg", "microgram"],
    nanogram: ["mass", 1e-12, "ng", "nanogram"],
    metricTonne: ["mass", 1000, "t", "metric tonne"],
    pound: ["mass", 0.45359237, "lb", "pound"],
    ounce: ["mass", 0.028349523125, "oz", "ounce"],
    stone: ["mass", 6.35029318, "st", "stone"],
    shortTon: ["mass", 907.18474, "ton", "short ton"],
    longTon: ["mass", 1016.0469088, "long ton", "long ton"],
    hundredweight: ["mass", 45.359237, "cwt", "hundredweight"],
    carat: ["mass", 0.0002, "ct", "carat"],
    grain: ["mass", 6.479891e-5, "gr", "grain"],
    dram: ["mass", 0.0017718451953125, "dr", "dram"],
    slug: ["mass", 14.5939029372064, "slug", "slug"],
    atomicMassUnit: ["mass", 1.6605390666e-27, "u", "atomic mass unit"],
    earthMass: ["mass", 5.9722e24, "M⊕", "Earth mass"],
    jupiterMass: ["mass", 1.8982e27, "M♃", "Jupiter mass"],
    solarMass: ["mass", 1.98847e30, "M☉", "solar mass"],

    metre: ["length", 1, "m", "metre"],
    kilometre: ["length", 1000, "km", "kilometre"],
    centimetre: ["length", 0.01, "cm", "centimetre"],
    millimetre: ["length", 0.001, "mm", "millimetre"],
    micrometre: ["length", 1e-6, "µm", "micrometre"],
    nanometre: ["length", 1e-9, "nm", "nanometre"],
    picometre: ["length", 1e-12, "pm", "picometre"],
    inch: ["length", 0.0254, "in", "inch"],
    foot: ["length", 0.3048, "ft", "foot"],
    yard: ["length", 0.9144, "yd", "yard"],
    mile: ["length", 1609.344, "mi", "mile"],
    nauticalMile: ["length", 1852, "nmi", "nautical mile"],
    furlong: ["length", 201.168, "fur", "furlong"],
    chain: ["length", 20.1168, "ch", "chain"],
    rod: ["length", 5.0292, "rd", "rod"],
    hand: ["length", 0.1016, "hand", "hand"],
    fathom: ["length", 1.8288, "fathom", "fathom"],
    mil: ["length", 2.54e-5, "mil", "mil"],
    lightYear: ["length", 9.4607304725808e15, "ly", "light year"],
    astronomicalUnit: ["length", 1.495978707e11, "au", "astronomical unit"],
    parsec: ["length", 3.0856775814913673e16, "pc", "parsec"],
    angstrom: ["length", 1e-10, "Å", "ångström"],
    fermi: ["length", 1e-15, "fm", "fermi"],
    planckLength: ["length", 1.616255e-35, "ℓP", "Planck length"],

    squareMetre: ["area", 1, "m²", "square metre"],
    squareKilometre: ["area", 1e6, "km²", "square kilometre"],
    squareCentimetre: ["area", 1e-4, "cm²", "square centimetre"],
    squareMillimetre: ["area", 1e-6, "mm²", "square millimetre"],
    hectare: ["area", 10000, "ha", "hectare"],
    acre: ["area", 4046.8564224, "acre", "acre"],
    squareMile: ["area", 2589988.110336, "mi²", "square mile"],
    squareFoot: ["area", 0.09290304, "ft²", "square foot"],
    squareInch: ["area", 6.4516e-4, "in²", "square inch"],
    squareYard: ["area", 0.83612736, "yd²", "square yard"],
    barn: ["area", 1e-28, "b", "barn"],

    cubicMetre: ["volume", 1, "m³", "cubic metre"],
    litre: ["volume", 0.001, "L", "litre"],
    millilitre: ["volume", 1e-6, "mL", "millilitre"],
    cubicCentimetre: ["volume", 1e-6, "cm³", "cubic centimetre"],
    cubicKilometre: ["volume", 1e9, "km³", "cubic kilometre"],
    cubicFoot: ["volume", 0.028316846592, "ft³", "cubic foot"],
    cubicInch: ["volume", 1.6387064e-5, "in³", "cubic inch"],
    gallonUS: ["volume", 0.003785411784, "gal (US)", "US gallon"],
    gallonImperial: ["volume", 0.00454609, "gal (imp)", "imperial gallon"],
    quart: ["volume", 0.000946352946, "qt", "quart"],
    pint: ["volume", 0.000473176473, "pt", "pint"],
    cup: ["volume", 0.0002365882365, "cup", "cup"],
    fluidOunce: ["volume", 2.95735295625e-5, "fl oz", "fluid ounce"],
    tablespoon: ["volume", 1.478676478125e-5, "tbsp", "tablespoon"],
    teaspoon: ["volume", 4.92892159375e-6, "tsp", "teaspoon"],
    barrel: ["volume", 0.158987294928, "bbl", "oil barrel"],
    bushel: ["volume", 0.0352390702, "bu", "bushel"],

    second: ["time", 1, "s", "second"],
    millisecond: ["time", 0.001, "ms", "millisecond"],
    microsecond: ["time", 1e-6, "µs", "microsecond"],
    nanosecond: ["time", 1e-9, "ns", "nanosecond"],
    minute: ["time", 60, "min", "minute"],
    hour: ["time", 3600, "h", "hour"],
    day: ["time", 86400, "d", "day"],
    week: ["time", 604800, "wk", "week"],
    fortnight: ["time", 1209600, "fortnight", "fortnight"],
    month: ["time", 2629746, "mo", "month"],
    year: ["time", 31556952, "yr", "year"],
    decade: ["time", 315569520, "decade", "decade"],
    century: ["time", 3155695200, "century", "century"],
    millennium: ["time", 31556952000, "millennium", "millennium"],
    shake: ["time", 1e-8, "shake", "shake"],

    metrePerSecond: ["speed", 1, "m/s", "metre per second"],
    kilometrePerHour: [
      "speed",
      0.2777777777777778,
      "km/h",
      "kilometre per hour",
    ],
    milePerHour: ["speed", 0.44704, "mph", "mile per hour"],
    footPerSecond: ["speed", 0.3048, "ft/s", "foot per second"],
    kilometrePerSecond: ["speed", 1000, "km/s", "kilometre per second"],
    milePerSecond: ["speed", 1609.344, "mi/s", "mile per second"],
    knot: ["speed", 0.514444444444, "kn", "knot"],
    mach: ["speed", 340.29, "Mach", "Mach (at sea level)"],
    speedOfLight: ["speed", 299792458, "c", "speed of light"],

    metrePerSecondSquared: [
      "acceleration",
      1,
      "m/s²",
      "metre per second squared",
    ],
    standardGravity: ["acceleration", 9.80665, "g₀", "standard gravity"],
    galileo: ["acceleration", 0.01, "Gal", "gal"],
    footPerSecondSquared: [
      "acceleration",
      0.3048,
      "ft/s²",
      "foot per second squared",
    ],

    kelvin: ["temperature", 1, "K", "kelvin", 0],
    celsius: ["temperature", 1, "°C", "degree Celsius", 273.15],
    fahrenheit: [
      "temperature",
      0.5555555555555556,
      "°F",
      "degree Fahrenheit",
      459.67,
    ],
    rankine: ["temperature", 0.5555555555555556, "°R", "degree Rankine", 0],

    pascal: ["pressure", 1, "Pa", "pascal"],
    kilopascal: ["pressure", 1000, "kPa", "kilopascal"],
    megapascal: ["pressure", 1e6, "MPa", "megapascal"],
    hectopascal: ["pressure", 100, "hPa", "hectopascal"],
    bar: ["pressure", 100000, "bar", "bar"],
    millibar: ["pressure", 100, "mbar", "millibar"],
    atmosphere: ["pressure", 101325, "atm", "atmosphere"],
    torr: ["pressure", 133.32236842105263, "Torr", "torr"],
    millimetreOfMercury: [
      "pressure",
      133.322387415,
      "mmHg",
      "millimetre of mercury",
    ],
    inchOfMercury: ["pressure", 3386.388640341, "inHg", "inch of mercury"],
    psi: ["pressure", 6894.757293168361, "psi", "pound per square inch"],
    kilopoundPerSquareInch: [
      "pressure",
      6894757.293168361,
      "ksi",
      "kilopound per square inch",
    ],
    dynePerSquareCentimetre: [
      "pressure",
      0.1,
      "dyn/cm²",
      "dyne per square centimetre",
    ],

    joule: ["energy", 1, "J", "joule"],
    kilojoule: ["energy", 1000, "kJ", "kilojoule"],
    megajoule: ["energy", 1e6, "MJ", "megajoule"],
    gigajoule: ["energy", 1e9, "GJ", "gigajoule"],
    wattHour: ["energy", 3600, "Wh", "watt hour"],
    kilowattHour: ["energy", 3.6e6, "kWh", "kilowatt hour"],
    calorie: ["energy", 4.184, "cal", "calorie"],
    kilocalorie: ["energy", 4184, "kcal", "kilocalorie"],
    btu: ["energy", 1055.05585262, "BTU", "British thermal unit"],
    erg: ["energy", 1e-7, "erg", "erg"],
    footPound: ["energy", 1.3558179483314004, "ft·lb", "foot pound"],
    electronVolt: ["energy", 1.602176634e-19, "eV", "electron volt"],
    kiloelectronVolt: ["energy", 1.602176634e-16, "keV", "kiloelectron volt"],
    megaelectronVolt: ["energy", 1.602176634e-13, "MeV", "megaelectron volt"],
    gigaelectronVolt: ["energy", 1.602176634e-10, "GeV", "gigaelectron volt"],
    kilotonTnt: ["energy", 4.184e12, "kt", "kilotonne of TNT"],
    megatonTnt: ["energy", 4.184e15, "Mt", "megatonne of TNT"],

    watt: ["power", 1, "W", "watt"],
    kilowatt: ["power", 1000, "kW", "kilowatt"],
    megawatt: ["power", 1e6, "MW", "megawatt"],
    gigawatt: ["power", 1e9, "GW", "gigawatt"],
    horsepower: ["power", 745.6998715822702, "hp", "mechanical horsepower"],
    metricHorsepower: ["power", 735.49875, "PS", "metric horsepower"],
    btuPerHour: ["power", 0.2930710701722222, "BTU/h", "BTU per hour"],
    tonOfRefrigeration: [
      "power",
      3516.8528420667006,
      "TR",
      "ton of refrigeration",
    ],
    caloriePerSecond: ["power", 4.184, "cal/s", "calorie per second"],

    newton: ["force", 1, "N", "newton"],
    kilonewton: ["force", 1000, "kN", "kilonewton"],
    dyne: ["force", 1e-5, "dyn", "dyne"],
    poundForce: ["force", 4.4482216152605, "lbf", "pound force"],
    kilogramForce: ["force", 9.80665, "kgf", "kilogram force"],
    kip: ["force", 4448.2216152605, "kip", "kip"],
    poundal: ["force", 0.138254954376, "pdl", "poundal"],

    bit: ["data", 0.125, "bit", "bit"],
    nibble: ["data", 0.5, "nibble", "nibble"],
    byte: ["data", 1, "B", "byte"],
    kilobit: ["data", 125, "kbit", "kilobit"],
    kibibit: ["data", 128, "Kibit", "kibibit"],
    kilobyte: ["data", 1000, "kB", "kilobyte"],
    kibibyte: ["data", 1024, "KiB", "kibibyte"],
    megabit: ["data", 125000, "Mbit", "megabit"],
    megabyte: ["data", 1e6, "MB", "megabyte"],
    mebibyte: ["data", 1048576, "MiB", "mebibyte"],
    gigabit: ["data", 125000000, "Gbit", "gigabit"],
    gigabyte: ["data", 1e9, "GB", "gigabyte"],
    gibibyte: ["data", 1073741824, "GiB", "gibibyte"],
    terabit: ["data", 125000000000, "Tbit", "terabit"],
    terabyte: ["data", 1e12, "TB", "terabyte"],
    tebibyte: ["data", 1099511627776, "TiB", "tebibyte"],
    petabyte: ["data", 1e15, "PB", "petabyte"],

    hertz: ["frequency", 1, "Hz", "hertz"],
    kilohertz: ["frequency", 1000, "kHz", "kilohertz"],
    megahertz: ["frequency", 1e6, "MHz", "megahertz"],
    gigahertz: ["frequency", 1e9, "GHz", "gigahertz"],
    revolutionsPerMinute: [
      "frequency",
      1 / 60,
      "rpm",
      "revolutions per minute",
    ],
    radiansPerSecond: [
      "frequency",
      1 / (2 * Math.PI),
      "rad/s",
      "radian per second",
    ],

    kilogramPerCubicMetre: ["density", 1, "kg/m³", "kilogram per cubic metre"],
    gramPerCubicCentimetre: [
      "density",
      1000,
      "g/cm³",
      "gram per cubic centimetre",
    ],
    kilogramPerLitre: ["density", 1000, "kg/L", "kilogram per litre"],
    gramPerLitre: ["density", 1, "g/L", "gram per litre"],
    milligramPerLitre: ["density", 0.001, "mg/L", "milligram per litre"],
    poundPerCubicFoot: [
      "density",
      16.018463373960143,
      "lb/ft³",
      "pound per cubic foot",
    ],
    poundPerCubicInch: [
      "density",
      27679.904710203125,
      "lb/in³",
      "pound per cubic inch",
    ],
    ouncePerCubicInch: [
      "density",
      1729.9940443876953,
      "oz/in³",
      "ounce per cubic inch",
    ],

    degrees: ["angle", 1, "°", "degree"],
    radians: ["angle", 57.29577951308232, "rad", "radian"],
    milliradians: ["angle", 17.453292519943295, "mrad", "milliradian"],
    turns: ["angle", 360, "turn", "turn"],
    gradians: ["angle", 0.9, "grad", "gradian"],
    arcminutes: ["angle", 1 / 60, "′", "arcminute"],
    arcseconds: ["angle", 1 / 3600, "″", "arcsecond"],

    milesPerGallonUS: [
      "fuel",
      0.4251437074976,
      "mpg (US)",
      "US miles per gallon",
    ],
    kilometresPerLitre: ["fuel", 1, "km/L", "kilometres per litre"],
    litresPer100Kilometres: [
      "fuel",
      0.01,
      "L/100km",
      "litres per 100 kilometres",
    ],

    cubicMetrePerSecond: ["flow", 1, "m³/s", "cubic metre per second"],
    cubicMetrePerHour: ["flow", 1 / 3600, "m³/h", "cubic metre per hour"],
    litrePerSecond: ["flow", 0.001, "L/s", "litre per second"],
    litrePerMinute: ["flow", 1 / 60000, "L/min", "litre per minute"],
    gallonPerMinute: [
      "flow",
      3.785411784e-3 / 60,
      "gal/min",
      "US gallon per minute",
    ],
    cubicFootPerMinute: [
      "flow",
      0.028316846592 / 60,
      "ft³/min",
      "cubic foot per minute",
    ],

    newtonMetre: ["torque", 1, "N·m", "newton metre"],
    kilonewtonMetre: ["torque", 1000, "kN·m", "kilonewton metre"],
    poundFoot: ["torque", 1.3558179483314004, "ft·lb", "pound foot"],
    kilopondMetre: ["torque", 9.80665, "kp·m", "kilopond metre"],

    becquerel: ["activity", 1, "Bq", "becquerel"],
    kilobecquerel: ["activity", 1000, "kBq", "kilobecquerel"],
    megabecquerel: ["activity", 1e6, "MBq", "megabecquerel"],
    gigabecquerel: ["activity", 1e9, "GBq", "gigabecquerel"],
    curie: ["activity", 3.7e10, "Ci", "curie"],
    rutherford: ["activity", 1e6, "Rd", "rutherford"],

    sievert: ["dose", 1, "Sv", "sievert"],
    millisievert: ["dose", 0.001, "mSv", "millisievert"],
    microsievert: ["dose", 1e-6, "µSv", "microsievert"],
    gray: ["dose", 1, "Gy", "gray"],
    milligray: ["dose", 0.001, "mGy", "milligray"],
    rad: ["dose", 0.01, "rad", "rad"],
    rem: ["dose", 0.01, "rem", "rem"],
  };

  const PRIME_TABLE_LIMIT = 1000000;
  const SIEVE_LIMIT = 10000000;
  let primeTable = null;
  let sieveCache = null;

  function buildPrimeTable() {
    if (primeTable !== null) return;
    const composite = new Uint8Array(PRIME_TABLE_LIMIT + 1);
    const counts = new Int32Array(PRIME_TABLE_LIMIT + 1);
    let count = 0;
    for (let i = 2; i <= PRIME_TABLE_LIMIT; i++) {
      if (composite[i] === 0) {
        count += 1;
        for (let j = i * i; j <= PRIME_TABLE_LIMIT; j += i) composite[j] = 1;
      }
      counts[i] = count;
    }
    primeTable = counts;
  }

  function sieveTo(limit) {
    const cap = Math.min(Math.max(Math.trunc(limit), 0), SIEVE_LIMIT);
    if (sieveCache !== null && sieveCache.cap >= cap) return sieveCache.primes;
    const composite = new Uint8Array(cap + 1);
    const primes = [];
    for (let i = 2; i <= cap; i++) {
      if (composite[i] === 0) {
        primes.push(i);
        for (let j = i * i; j <= cap; j += i) composite[j] = 1;
      }
    }
    sieveCache = { cap, primes };
    return primes;
  }

  function primesUpTo(limit) {
    const cap = Math.min(Math.max(Math.trunc(limit), 0), SIEVE_LIMIT);
    const primes = sieveTo(cap);
    let low = 0;
    let high = primes.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (primes[middle] <= cap) low = middle + 1;
      else high = middle;
    }
    return primes.slice(0, low);
  }

  function countPrimesUpTo(limit) {
    const n = Math.trunc(Scratch.Cast.toNumber(limit));
    if (!Number.isFinite(n) || n < 2) return 0;
    if (n <= PRIME_TABLE_LIMIT) {
      buildPrimeTable();
      return primeTable[n];
    }
    const root = Math.floor(Math.sqrt(n));
    const small = new Float64Array(root + 1);
    const large = new Float64Array(root + 1);
    for (let i = 1; i <= root; i++) {
      small[i] = i - 1;
      large[i] = Math.floor(n / i) - 1;
    }
    for (let prime = 2; prime <= root; prime++) {
      if (small[prime] === small[prime - 1]) continue;
      const previous = small[prime - 1];
      const square = prime * prime;
      const limit = Math.min(root, Math.floor(n / square));
      for (let i = 1; i <= limit; i++) {
        const step = i * prime;
        large[i] -=
          (step <= root ? large[step] : small[Math.floor(n / step)]) - previous;
      }
      for (let j = root; j >= square; j--) {
        small[j] -= small[Math.floor(j / prime)] - previous;
      }
    }
    return large[1];
  }
}
