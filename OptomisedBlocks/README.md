# Optomised Blocks

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sandisk/optomisedblocks)

Unsandboxed TurboWarp extension.

- `all at once { }` runs its contents like `if <1 = 1>`. This is the old
  Scratch 2 block, which is hidden in the palette but still in the VM.
- `at end of frame { }` stores its contents and runs them after every main
  script has finished for the frame, just before the redraw.
- Named functions: `add blocks to function [F] { }` stores blocks (they are
  not run in place), `run function [F]` runs them now, and
  `run function [F] at end of frame` defers the run. Remove blocks with
  `remove block [N]` or `remove blocks [A] to [B]`, count with `blocks in [F]`.

Each function is a private block container, so TurboWarp compiles it once and
reuses the result until the function changes. `clear function [F]` before
re-running an `add` script, otherwise the blocks are added again.

Limits: custom blocks (`define`) can't be called inside a function, functions
are not saved with the project, and deferred code can't hand results back to
the script that queued it in the same frame.

    twext validate
    twext build
    twext dev
