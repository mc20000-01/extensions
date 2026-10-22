// Manifest checks that mirror what the Scratch VM does when it builds a block.
// Every "[name]" in a block's text becomes an input; if the name does not match
// a declared argument the input never binds and the handler reads undefined.
import { menuItems, registered, blockSpecs } from "./harness.mjs";

let checks = 0;
const failures = [];
const ok = (name, condition, detail = "") => {
  checks += 1;
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

const PLACEHOLDER = /\[(.+?)]/g;

for (const entry of blockSpecs()) {
  const text = entry.text;
  if (typeof text !== "string") continue;
  const found = [];
  let match;
  PLACEHOLDER.lastIndex = 0;
  while ((match = PLACEHOLDER.exec(text)) !== null) found.push(match[1]);
  const declared = Object.keys(entry.arguments || {});

  for (const name of found) {
    ok(
      `${entry.opcode}: [${name}] is a declared argument`,
      declared.includes(name),
      `declared: ${declared.join(",") || "none"}`,
    );
  }
  for (const name of declared) {
    ok(
      `${entry.opcode}: argument ${name} appears in the text`,
      found.includes(name),
      text,
    );
  }
  for (const name of new Set(found)) {
    ok(
      `${entry.opcode}: [${name}] appears once`,
      found.filter((item) => item === name).length === 1,
    );
  }
  const stray = text.replace(PLACEHOLDER, "");
  ok(
    `${entry.opcode}: no stray brackets`,
    !stray.includes("[") && !stray.includes("]"),
    text,
  );
  for (const name of declared) {
    ok(
      `${entry.opcode}: argument ${name} is a plain name`,
      /^[A-Za-z_$][\w$]*$/.test(name),
      name,
    );
  }
}

/* ---------------- menu arguments ---------------- */
for (const entry of blockSpecs()) {
  for (const [name, def] of Object.entries(entry.arguments || {})) {
    if (!def.menu) continue;
    ok(
      `${entry.opcode}.${name}: menu ${def.menu} is declared`,
      Object.prototype.hasOwnProperty.call(menuItems, def.menu),
    );
    const items = menuItems[def.menu];
    // The list menu is built at runtime from the project's lists.
    if (!items || items.length === 0) continue;
    ok(
      `${entry.opcode}.${name}: has a default value`,
      def.defaultValue !== undefined,
    );
    ok(
      `${entry.opcode}.${name}: default is a menu item`,
      items.includes(def.defaultValue),
      `${def.defaultValue} in ${def.menu}`,
    );
  }
}

/* ---------------- opcodes and handlers ---------------- */
const opcodes = blockSpecs().map((entry) => entry.opcode);
ok("no duplicate opcodes", new Set(opcodes).size === opcodes.length);
for (const opcode of opcodes) {
  ok(`${opcode}: has a handler`, typeof registered[opcode] === "function");
}

/* ---------------- menus are all used ---------------- */
const usedMenus = new Set();
for (const entry of blockSpecs()) {
  for (const def of Object.values(entry.arguments || {})) {
    if (def.menu) usedMenus.add(def.menu);
  }
}
for (const menu of Object.keys(menuItems)) {
  ok(`menu ${menu} is used by a block`, usedMenus.has(menu));
}
for (const menu of usedMenus) {
  ok(
    `menu ${menu} is declared`,
    Object.prototype.hasOwnProperty.call(menuItems, menu),
  );
}

/* ---------------- summary ---------------- */
console.log(`checks run: ${checks}`);
if (failures.length) {
  console.log(`FAILURES: ${failures.length}`);
  for (const line of failures.slice(0, 40)) console.log(" -", line);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
