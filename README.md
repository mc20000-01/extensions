# extensions

TurboWarp extensions.

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/advancedtimers)
![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/moremaths)
![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/optomisedblocks)
![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/sensecolor)
![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sdisk-man/comments)

| Extension                           | What it does                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Advanced Timers](AdvancedTImers)   | Named timers on `performance.now()`, reported in s, ms, µs or ns.                               |
| [More Maths](moremaths)             | 583 blocks of advanced maths: trigonometry, statistics, units, distributions, physics and more. |
| [Optomised Blocks](OptomisedBlocks) | `all at once`, `at end of frame` and named functions for TurboWarp.                             |
| [Sense Color](SenseColor)           | Reports the average color under a sprite, with a cached backdrop.                               |
| [Comments](comments)                | Comment blocks that hold a note and do nothing.                                                 |

Build one of them with `twext build` in its folder, or build everything with
`./build-all.sh`. `./make-all.sh --authed -m "message"` (or `--token TOKEN`
instead of `--authed`) builds and publishes every extension, then commits and
pushes.
