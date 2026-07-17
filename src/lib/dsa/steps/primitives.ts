import type { Step, ConceptPayload } from "../types";

const c = (title: string, body: string, bullets: string[], example?: string): Step[] => [{
  line: 1, note: title,
  payload: { title, body, bullets, example } satisfies ConceptPayload,
}];

export const intFloatSteps = () => c(
  "Integers & Floating-Points",
  "Fundamental numeric primitives with fixed binary storage.",
  [
    "int32: range −2,147,483,648 … 2,147,483,647 (4 bytes, two's complement)",
    "int64: range ±9.2×10^18 (8 bytes)",
    "float32 (IEEE 754): 1 sign + 8 exponent + 23 mantissa bits — ~7 decimal digits precision",
    "float64 (double): 1 + 11 + 52 bits — ~15–17 decimal digits precision",
    "Integer overflow wraps; float overflow → ±Infinity, invalid → NaN",
  ],
  `// JavaScript Number is always float64\nconsole.log(0.1 + 0.2);   // 0.30000000000000004\nconsole.log(Number.MAX_SAFE_INTEGER); // 2^53 - 1`,
);

export const boolSteps = () => c(
  "Booleans",
  "1-bit logical values (usually stored in 1 byte).",
  [
    "Truthy/falsy coercion rules vary by language",
    "Support AND, OR, NOT, XOR",
    "Short-circuit evaluation: && and || stop at first decisive operand",
  ],
  `const canRide = age >= 12 && height >= 140;\nconst isWeekend = day === "Sat" || day === "Sun";`,
);

export const charStringSteps = () => c(
  "Characters & Strings",
  "Characters are single code points; strings are ordered sequences of characters. UTF-16 in JS/JVM, UTF-8 in Rust/Go, byte arrays in C.",
  [
    "Immutable in JS/Java/Python — mutations create new strings",
    "Access by index: O(1) for fixed encodings, O(n) for variable encodings",
    "Common ops: concat, slice, split, indexOf, replace, comparison",
  ],
  `const s = "hello";\ns[0]      // 'h'\ns.length  // 5\ns.toUpperCase()  // 'HELLO'`,
);

export const pointerSteps = () => c(
  "Pointers & References",
  "A pointer stores a memory address. A reference is a bound alias. High-level languages hide raw pointers; only object identity is exposed.",
  [
    "Enable pass-by-reference and dynamic data structures (lists, trees)",
    "Dangerous in C/C++: null deref, use-after-free, buffer overflows",
    "GC languages track references and free unreachable memory",
    "Smart pointers: unique_ptr, shared_ptr enforce ownership rules",
  ],
  `int x = 10;\nint* p = &x;   // p points to x\n*p = 20;       // x is now 20\n\n// JS: everything is a reference for objects\nconst a = { v: 1 }; const b = a; b.v = 2;\nconsole.log(a.v); // 2`,
);
