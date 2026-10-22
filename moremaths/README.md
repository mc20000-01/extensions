# More Maths

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/moremaths)

583 blocks of advanced maths for TurboWarp. Everything is unsandboxed, so the
blocks can use lists, the `util` object and real `Math` calls.

The palette is grouped into sections such as Constants, Rounding & Signs,
Trigonometry, Logarithms Roots & Powers, Equations & Series, Combinations &
Sequences, Number Theory, Digits & Bases, Logic & Comparisons, Scaling &
Interpolation, Statistics, Geometry, Vectors & Matrices, Calculus, Special
Functions, Probability & Random, Money, Units & Conversion, Distributions,
Sampling, Physics, Astronomy, Discrete Maths and Data & Fitting.

- Statistics blocks read a list, like `mean of list [LIST]` and
  `z-score of [VALUE] in list [LIST]`.
- Fitting blocks work on two lists, like
  `least squares fit of list [YS] against [XS] to degree [DEGREE]`.
- Units come from menus (`mass`, `length`, `temperature`, `volume and time`),
  and the unit menus report their dimension, so
  `convert mass [MASS] from [FROM] to [TO]` knows what it is converting.
- Distribution blocks have their mean, standard deviation, quantile, PDF and
  CDF forms, plus samplers.

Blocks that have no sensible answer return `NaN` or `Infinity` rather than
guessing. `standard deviation of cauchy distribution` is always `Infinity`,
because the Cauchy distribution has no standard deviation.

    twext validate
    twext build
    twext dev
