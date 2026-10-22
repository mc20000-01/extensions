# Comments

![version + downloads](https://twexts.sdisk.us/api/v2/badge/@sdisk-man/comments)

Comments for Scratch mods. The blocks do nothing except hold a note, so
blocks that were deleted from a project can be left in place.

- `comment: [COMMENT]` is a command, it only holds text.
- `comment: [COMMENT] run: [RUN]` is a C block, it runs its contents when
  `RUN` is `yes`.
- `comment: [COMMENT] passthrough: [PASS]` is a reporter, it returns `PASS`
  unchanged.

Build it with:

    twext validate
    twext build
    twext dev
