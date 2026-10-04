export function commentReporter(args, util) {
  return args.PASS;
}

export function commentInline(args, util) {
  /* empty */
}

export function commentCblock(args, util) {
  if (args.RUN === "true") {
    return true;
  }
  return false;
}
