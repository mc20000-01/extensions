// End-to-end check that the Twext build of moremaths is a loadable Scratch extension:
// the compiled bundle registers itself through Scratch.extensions.register, scratch-vm
// accepts its block/menu metadata, the runtime wires up a primitive per opcode, and the
// primitives behave the same way when they run against scratch-vm's real Cast and Variable.
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = new URL("../../", import.meta.url);
const fromRoot = (path) => require(new URL(path, root).pathname);

let VirtualMachine;
try {
  VirtualMachine = require("scratch-vm");
} catch {
  console.log(
    "scratch-vm is not installed; skipping (npm install -D scratch-vm)",
  );
  process.exit(0);
}
const Cast = fromRoot("node_modules/scratch-vm/src/util/cast.js");
const ArgumentType = fromRoot(
  "node_modules/scratch-vm/src/extension-support/argument-type.js",
);
// TurboWarp adds LABEL to the block types it exposes to custom extensions.
const BlockType = {
  ...fromRoot("node_modules/scratch-vm/src/extension-support/block-type.js"),
  LABEL: "label",
};
const Variable = fromRoot("node_modules/scratch-vm/src/engine/variable.js");

let checks = 0;
const failures = [];
const ok = (name, condition, detail = "") => {
  checks += 1;
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

/* ---------------- load the built bundle ---------------- */
const bundle = new URL("dist/moremaths.js", root);
if (!fs.existsSync(bundle)) {
  console.error(
    "dist/moremaths.js is missing; run npm run build:moremaths first",
  );
  process.exit(1);
}
const code = fs.readFileSync(bundle, "utf8");
const registered = [];
const sandbox = {
  Scratch: {
    // moremaths is declared unsandboxed, so it refuses to load in a sandbox.
    extensions: {
      unsandboxed: true,
      register: (extension) => registered.push(extension),
    },
    Cast,
    BlockType,
    ArgumentType,
    vm: null,
  },
  console,
};
vm.runInNewContext(code, sandbox, { filename: "moremaths.js" });

ok(
  "one extension registered",
  registered.length === 1,
  `got ${registered.length}`,
);
const extension = registered[0];
ok("extension exposes getInfo", typeof extension.getInfo === "function");
const info = extension.getInfo();
ok("extension id", info.id === "moremaths", info.id);
ok("extension name", info.name === "More Maths", info.name);
ok("extension colors", /^#[0-9a-f]{6}$/i.test(info.color1 || ""), info.color1);
ok(
  "extension has blocks",
  Array.isArray(info.blocks) && info.blocks.length > 600,
  `${info.blocks && info.blocks.length}`,
);
ok("extension has menus", info.menus && Object.keys(info.menus).length > 0);
ok("extension needs no other extensions", typeof info.requires === "undefined");

/* ---------------- block and menu metadata ---------------- */
const labelBlocks = info.blocks.filter(
  (block) => block.blockType === BlockType.LABEL,
);
const opcodes = info.blocks
  .filter((block) => block.opcode)
  .map((block) => block.opcode);
ok("no duplicate opcodes", new Set(opcodes).size === opcodes.length);
ok(
  "every opcode has a handler",
  opcodes.every((opcode) => typeof extension[opcode] === "function"),
  opcodes.filter((opcode) => typeof extension[opcode] !== "function").join(" "),
);
ok(
  "every block has text",
  info.blocks.every(
    (block) => typeof block.text === "string" && block.text.length > 0,
  ),
);
const knownTypes = [
  BlockType.LABEL,
  BlockType.REPORTER,
  BlockType.BOOLEAN,
  BlockType.COMMAND,
  BlockType.EVENT,
];
ok(
  "known block types only",
  info.blocks.every((block) => knownTypes.includes(block.blockType)),
  [...new Set(info.blocks.map((block) => block.blockType))].join(" "),
);
const badLabels = labelBlocks.filter(
  (block) => "opcode" in block || "func" in block,
);
ok(
  "label blocks carry only text",
  badLabels.length === 0,
  badLabels.map((block) => block.text).join(" "),
);

const badArgs = [];
for (const block of info.blocks) {
  for (const [name, def] of Object.entries(block.arguments || {})) {
    const validType = [
      ArgumentType.ANGLE,
      ArgumentType.COLOR,
      ArgumentType.NUMBER,
      ArgumentType.STRING,
      ArgumentType.BOOLEAN,
      ArgumentType.MATRIX,
    ].includes(def.type);
    if (!validType && !def.menu)
      badArgs.push(`${block.opcode}.${name} type ${def.type}`);
    if (def.menu && !info.menus[def.menu])
      badArgs.push(`${block.opcode}.${name} menu ${def.menu}`);
    if (
      def.type === ArgumentType.NUMBER &&
      def.defaultValue !== undefined &&
      typeof def.defaultValue !== "number"
    ) {
      badArgs.push(`${block.opcode}.${name} number default`);
    }
  }
}
ok(
  "argument declarations valid",
  badArgs.length === 0,
  badArgs.slice(0, 8).join(" "),
);

// scratch-vm turns every "[name]" in a block's text into an input, so a name
// that is not a declared argument silently turns into plain message text and
// the handler reads undefined for that argument.
const badPlaceholders = [];
for (const block of info.blocks) {
  if (!block.opcode || typeof block.text !== "string") continue;
  const declared = Object.keys(block.arguments || {});
  const found = [];
  let match;
  const pattern = /\[(.+?)]/g;
  while ((match = pattern.exec(block.text)) !== null) found.push(match[1]);
  for (const name of found) {
    if (!declared.includes(name))
      badPlaceholders.push(`${block.opcode} [${name}]`);
  }
  for (const name of declared) {
    if (!found.includes(name)) badPlaceholders.push(`${block.opcode} ${name}`);
  }
}
ok(
  "block text placeholders match the declared arguments",
  badPlaceholders.length === 0,
  badPlaceholders.slice(0, 8).join(" "),
);

const menuNames = Object.keys(info.menus);
for (const name of menuNames) {
  const items = info.menus[name].items;
  const populated = Array.isArray(items)
    ? items.length > 0
    : typeof items === "string" && items.length > 0;
  ok(`menu ${name} has items`, populated);
}
const staticMenus = menuNames.filter((name) =>
  Array.isArray(info.menus[name].items),
);
// Dynamic menus name a method on the extension instead of listing items.
const dynamicMenus = menuNames.filter(
  (name) => typeof info.menus[name].items === "string",
);
ok(
  "the list menu is dynamic",
  dynamicMenus.includes("list"),
  dynamicMenus.join(" "),
);
ok(
  "dynamic menus name an extension method",
  dynamicMenus.every(
    (name) => typeof extension[info.menus[name].items] === "function",
  ),
  dynamicMenus.map((name) => info.menus[name].items).join(" "),
);
ok(
  "static menus have unique values",
  staticMenus.every((name) => {
    const values = info.menus[name].items.map((item) =>
      Array.isArray(item) ? item[1] : item,
    );
    return new Set(values).size === values.length;
  }),
  staticMenus.join(" "),
);

/* ---------------- scratch-vm loads the extension ---------------- */
const machine = new VirtualMachine();
// Label blocks are a TurboWarp extension feature that stock scratch-vm cannot parse, so
// hand it the blocks only. getInfo() itself is asserted above.
const withoutLabels = Object.assign({}, info, {
  blocks: info.blocks.filter((block) => block.blockType !== BlockType.LABEL),
});
let serviceName = null;
let prepare = null;
try {
  const realGetInfo = extension.getInfo.bind(extension);
  extension.getInfo = () => withoutLabels;
  serviceName = machine.extensionManager._registerInternalExtension(extension);
  extension.getInfo = realGetInfo;
  machine.extensionManager._loadedExtensions.set(info.id, serviceName);
  prepare = machine.extensionManager._prepareExtensionInfo(
    serviceName,
    withoutLabels,
  );
} catch (error) {
  failures.push(`scratch-vm registration: ${error.message}`);
}
ok("scratch-vm accepts the extension", Boolean(serviceName));
ok(
  "scratch-vm considers it loaded",
  machine.extensionManager.isExtensionLoaded(info.id),
);

if (prepare) {
  ok(
    "scratch-vm keeps every opcode",
    prepare.blocks.length === opcodes.length,
    `${prepare.blocks.length} of ${opcodes.length}`,
  );
  ok(
    "scratch-vm wires a func per block",
    prepare.blocks.every((block) => typeof block.func === "function"),
  );
  ok(
    "scratch-vm keeps every menu",
    Object.keys(prepare.menus).length === menuNames.length,
  );
  ok(
    "static menus survive preparation",
    staticMenus.every((name) => Array.isArray(prepare.menus[name].items)),
  );
  ok(
    "dynamic menus are bound to the extension",
    dynamicMenus.every(
      (name) => typeof prepare.menus[name].items === "function",
    ),
  );
}

/* ---------------- scratch-vm turns them into block JSON ---------------- */
await new Promise((resolve) => setTimeout(resolve, 500));
const category = machine.runtime._blockInfo.find(
  (entry) => entry.id === info.id,
);
ok("runtime exposes one category", machine.runtime._blockInfo.length === 1);
ok(
  "runtime category holds every block",
  category && category.blocks.length === opcodes.length,
  category ? `${category.blocks.length} of ${opcodes.length}` : "no category",
);
ok(
  "runtime category uses the extension name",
  category && category.name === info.name,
);
const prefixed = opcodes.map((opcode) => `${info.id}_${opcode}`);
const registeredPrimitives = Object.keys(machine.runtime._primitives).filter(
  (key) => key.startsWith(`${info.id}_`),
);
ok(
  "runtime registers a primitive per opcode",
  registeredPrimitives.length === opcodes.length,
  `${registeredPrimitives.length} of ${opcodes.length}`,
);
ok(
  "runtime primitive names are prefixed",
  prefixed.every(
    (key) => typeof machine.runtime._primitives[key] === "function",
  ),
);
if (category) {
  ok(
    "block JSON types are prefixed",
    category.blocks.every((block) => prefixed.includes(block.json.type)),
  );
  ok(
    "block JSON is valid",
    category.blocks.every(
      (block) =>
        block.json && block.json.type && block.json.category === info.name,
    ),
  );
  const reporters = category.blocks.filter((block) => block.json.output);
  ok(
    "reporters have an output shape",
    reporters.every((block) => typeof block.json.outputShape === "number"),
    `${reporters.length} reporters`,
  );
  ok(
    "commands have statement connectors",
    category.blocks
      .filter(
        (block) =>
          block.json.previousStatement !== undefined &&
          block.json.output === undefined,
      )
      .every(
        (block) =>
          "previousStatement" in block.json && "nextStatement" in block.json,
      ),
  );
}

/* ---------------- running a registered primitive ---------------- */
const normalCdf = machine.runtime._primitives[`${info.id}_normalCdf`];
if (typeof normalCdf === "function") {
  const computed = Number(
    normalCdf(
      { VALUE: "1", MEAN: "0", DEVIATION: "1" },
      { target: { lookupVariableById: () => null } },
    ),
  );
  ok(
    "registered primitive computes a normal CDF",
    Math.abs(computed - 0.8413447460685429) < 1e-12,
    String(computed),
  );
}

/* ---------------- real Cast semantics ---------------- */
const noTarget = { target: { lookupVariableById: () => null } };
const call = (opcode, args) => extension[opcode](args, noTarget);
ok(
  "real cast: number stays number",
  Math.abs(
    call("normalCdf", { VALUE: Cast.toNumber("1"), MEAN: 0, DEVIATION: 1 }) -
      0.8413447460685429,
  ) < 1e-12,
);
ok(
  "real cast: numeric string",
  Math.abs(call("squareRoot", { NUM: Cast.toNumber("16") }) - 4) < 1e-12,
);
ok(
  "real cast: boolean becomes 1",
  Math.abs(call("absoluteValue", { NUM: Cast.toNumber(true) }) - 1) < 1e-12,
);
ok(
  "real cast: empty string becomes 0",
  call("squareRoot", { NUM: Cast.toNumber("") }) === 0,
);
ok(
  "real cast: garbage becomes 0",
  call("squareRoot", { NUM: Cast.toNumber("abc") }) === 0,
);
ok(
  "real cast: complex roots stay NaN",
  Number.isNaN(call("quadraticRoot1", { A: 1, B: 2, C: 3 })),
);
ok(
  "constants need no arguments",
  Math.abs(call("constantPi", {}) - Math.PI) < 1e-15,
);

/* ---------------- real Variable lists ---------------- */
const variables = new Map();
sandbox.Scratch.vm = { runtime: machine.runtime };
let listCounter = 0;
const listRef = (value) => {
  const id = `list-${(listCounter += 1)}`;
  const variable = new Variable(
    id,
    `list${listCounter}`,
    Variable.LIST_TYPE,
    false,
  );
  variable.value = value;
  variables.set(id, variable);
  return id;
};
const util = {
  target: {
    lookupVariableById: (id) => variables.get(id) || null,
    lookupVariableByNameAndType: (name) =>
      [...variables.values()].find((v) => v.name === name) || null,
  },
  ioQuery: () => 0,
};
const run = (opcode, args) => {
  const value = extension[opcode](args, util);
  return Array.isArray(value) ? value.join(", ") : value;
};
const data = listRef([1, 2, 2, 3, 4, 8, 13]);
ok("real variable: list length", run("listLength", { LIST: data }) === 7);
ok("real variable: list sum", run("listSum", { LIST: data }) === 33);
ok(
  "real variable: list mean",
  Math.abs(run("listMean", { LIST: data }) - 33 / 7) < 1e-12,
);
ok(
  "real variable: list extremes",
  run("listSmallest", { LIST: data }) === 1 &&
    run("listLargest", { LIST: data }) === 13,
);
ok("real variable: list range", run("listRange", { LIST: data }) === 12);
ok(
  "real variable: sorted text",
  run("listSortedText", { LIST: data }) === "1, 2, 2, 3, 4, 8, 13",
);
ok(
  "real variable: cumulative sums",
  run("listCumulativeSum", { LIST: listRef([1, 2, 3]) }) === "1, 3, 6",
);
ok(
  "real variable: summary",
  run("listSummary", { LIST: data }).startsWith("count 7"),
);
ok(
  "real variable: empty summary",
  run("listSummary", { LIST: listRef([]) }) === "empty list",
);
ok(
  "real variable: all true",
  run("listAllTrue", { LIST: listRef([1, true]) }) === true &&
    run("listAllTrue", { LIST: listRef([true, false]) }) === false,
);
ok(
  "real variable: any true",
  run("listAnyTrue", { LIST: listRef([0, 0, 1]) }) === true &&
    run("listAnyTrue", { LIST: listRef([0, 0]) }) === false,
);
ok(
  "real variable: missing list behaves like an empty list",
  run("listMean", { LIST: "not-a-list" }) === 0 &&
    run("listLength", { LIST: "not-a-list" }) === 0,
);
ok(
  "real variable: histogram",
  run("histogramCountsList", { LIST: listRef([1, 2, 3, 4, 5, 6]), BINS: 3 }) ===
    "2, 2, 2",
);
ok(
  "real variable: weighted mean",
  Math.abs(
    run("listWeightedMean", {
      LIST: listRef([1, 2, 3]),
      WEIGHTS: listRef([1, 1, 2]),
    }) -
      9 / 4,
  ) < 1e-12,
);
ok(
  "real variable: shuffled list keeps values",
  run("shuffledList", { LIST: listRef([1, 2, 3]) })
    .split(", ")
    .map(Number)
    .sort((a, b) => a - b)
    .join(",") === "1,2,3",
);
ok(
  "real variable: first differences",
  run("firstDifferencesList", { LIST: listRef([1, 4, 9]) }) === "3, 5",
);
ok(
  "real variable: cumulative mean",
  run("cumulativeMeanList", { LIST: listRef([1, 2, 3]) }) === "1, 1.5, 2",
);

/* ---------------- variable menus come from the target ---------------- */
const listMenuItems = machine.extensionManager._getExtensionMenuItems(
  { calcListMenuItems: () => [{ text: "data list", value: data }] },
  "calcListMenuItems",
);
ok(
  "list menu is generated on demand",
  Array.isArray(listMenuItems) &&
    listMenuItems.length === 1 &&
    listMenuItems[0][0] === "data list" &&
    listMenuItems[0][1] === data,
  JSON.stringify(listMenuItems),
);
ok(
  "list menu items accept plain strings too",
  JSON.stringify(
    machine.extensionManager._getExtensionMenuItems(
      { calcListMenuItems: () => ["score"] },
      "calcListMenuItems",
    ),
  ) === JSON.stringify([["score", "score"]]),
);

console.log(`vm integration checks run: ${checks}`);
if (failures.length) {
  console.log(`FAILURES: ${failures.length}`);
  for (const line of failures) console.log(" -", line);
  process.exit(1);
}
console.log("VM INTEGRATION OK");
console.log(
  `${opcodes.length} opcodes, ${labelBlocks.length} labels, ${menuNames.length} menus, ${staticMenus.length} static + ${dynamicMenus.length} dynamic menus`,
);
