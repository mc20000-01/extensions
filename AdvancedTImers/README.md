# Advanced Timers

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/advancedtimers)

Named timers on `performance.now()`, reported in s, ms, µs or ns.

- `start timer [NAME]` / `timer [NAME] in [UNIT]`
- `time this as [NAME] { ... }` wraps blocks and stores how long they took
- `last time of [NAME] in [UNIT]` reads that value

Browsers round `performance.now()` (about 5 µs on cross-origin isolated
pages, 100 µs elsewhere, coarser in Firefox). To time something very fast,
repeat it 100 or 1000 times inside the timer and divide.

To time real block cost, run the blocks in a custom block set to run without
screen refresh. Otherwise the number includes waiting for the next frame.

    twext validate
    twext build
    twext dev
