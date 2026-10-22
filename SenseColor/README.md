# Sense Color

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/sensecolor)

TurboWarp extension with one reporter, `color under me`. It returns the
average hex color of the pixels under the sprite. Pixels offstage are not
counted. It works for clones.

The stage backdrop is cached in 2x2 px cells and filled in while the project
is idle (frame interval and script time are used to decide). Sprites and pen
layers above the backdrop are blended on every call.

Other blocks: `cache coverage %` and `clear color cache`.

Loads unsandboxed only.

    twext validate
    twext build        # dist/extension.js
    twext dev          # rebuild on save, serves the extension for TurboWarp
