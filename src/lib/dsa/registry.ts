import type { TopicDef, Step } from "./types";
import * as L from "./steps/linear";
import * as H from "./steps/hash";
import * as T from "./steps/trees";
import * as G from "./steps/graphsDS";
import * as S from "./steps/sorting";
import * as SR from "./steps/searching";
import * as P from "./steps/patterns";
import * as TR from "./steps/traversals";
import * as AG from "./steps/advGraph";
import * as AV from "./steps/advanced";
import * as PR from "./steps/primitives";

const t = (o: Partial<TopicDef> & Pick<TopicDef, "slug" | "name" | "category" | "group" | "generateSteps" | "renderer">): TopicDef => ({
  emoji: "•",
  complexity: { time: "—", space: "—" },
  defaultInput: "",
  code: "// pseudocode",
  explanation: "",
  useCases: [],
  ...o,
});

export const TOPICS: TopicDef[] = [
  // ---- Primitives ----
  t({ slug: "int-float", name: "Integers & Floats", emoji: "🔢", category: "ds", group: "Primitives", renderer: "concept",
      complexity: { time: "O(1)", space: "O(1)" }, generateSteps: () => PR.intFloatSteps(),
      code: `int32  i = 42;\nfloat  f = 3.14;\ndouble d = 3.14159265358979;`,
      explanation: "Numeric primitives stored in fixed binary width." }),
  t({ slug: "boolean", name: "Booleans", emoji: "🔘", category: "ds", group: "Primitives", renderer: "concept",
      complexity: { time: "O(1)", space: "O(1)" }, generateSteps: () => PR.boolSteps(),
      code: `bool b = true;\nif (a && !b) { ... }`,
      explanation: "Logical true/false values." }),
  t({ slug: "char-string", name: "Characters & Strings", emoji: "🔤", category: "ds", group: "Primitives", renderer: "concept",
      complexity: { time: "O(n)", space: "O(n)" }, generateSteps: () => PR.charStringSteps(),
      code: `string s = "hello";\nchar c = s[0];`,
      explanation: "Ordered sequences of characters." }),
  t({ slug: "pointer", name: "Pointers & References", emoji: "👉", category: "ds", group: "Primitives", renderer: "concept",
      complexity: { time: "O(1)", space: "O(1)" }, generateSteps: () => PR.pointerSteps(),
      code: `int *p = &x;\n*p = 20;`,
      explanation: "Memory addresses / bindings referencing distinct entities." }),

  // ---- Linear ----
  t({ slug: "static-array", name: "Static Array", emoji: "📋", category: "ds", group: "Linear", renderer: "cells",
      defaultInput: "10, 20, 30, 40, 50", inputHint: "comma-separated numbers",
      complexity: { time: "O(1) access", space: "O(n)" }, generateSteps: L.staticArraySteps,
      code: `1  int a[5] = {10,20,30,40,50};\n2  x = a[i];   // O(1)\n3  // size cannot change`,
      explanation: "Fixed-size contiguous memory. O(1) random access, cannot resize.",
      useCases: ["Buffers", "matrices", "lookup tables"] }),
  t({ slug: "dynamic-array", name: "Dynamic Array", emoji: "🧺", category: "ds", group: "Linear", renderer: "cells",
      defaultInput: "1,2,3,4,5,6,7", complexity: { time: "amortized O(1) push", space: "O(n)" },
      generateSteps: L.dynamicArraySteps,
      code: `1  arr = []          // cap=2\n2  if size==cap: resize x2\n3  arr.push(v)\n4  // amortized O(1)`,
      explanation: "Grows by doubling capacity when full. Amortized O(1) push.",
      useCases: ["JS Array", "C++ vector", "Java ArrayList"] }),
  t({ slug: "singly-linked-list", name: "Singly Linked List", emoji: "🔗", category: "ds", group: "Linear", renderer: "list",
      defaultInput: "10,20,30,40", complexity: { time: "O(n) search, O(1) head insert", space: "O(n)" },
      generateSteps: L.singlyListSteps,
      code: `1  head = null\n2  insert(v): node.next = head; head = node\n3  traverse: curr = head; while curr: ...`,
      explanation: "Nodes with a single next pointer. No random access." }),
  t({ slug: "doubly-linked-list", name: "Doubly Linked List", emoji: "⇄", category: "ds", group: "Linear", renderer: "list",
      defaultInput: "1,2,3,4", complexity: { time: "O(n) search, O(1) insert/delete", space: "O(n)" },
      generateSteps: L.doublyListSteps,
      code: `1  each node has prev & next\n2  insert(v) at tail\n3  traverse forward or back`,
      explanation: "Bidirectional links enable O(1) deletion given the node." }),
  t({ slug: "circular-linked-list", name: "Circular Linked List", emoji: "🔁", category: "ds", group: "Linear", renderer: "list",
      defaultInput: "A,B,C,D", complexity: { time: "O(n)", space: "O(n)" },
      generateSteps: L.circularListSteps,
      code: `1  build ring\n2  insert nodes\n3  traverse\n4  tail.next = head`,
      explanation: "Tail loops back to head — no null terminator." }),
  t({ slug: "stack", name: "Stack", emoji: "📚", category: "ds", group: "Linear", renderer: "cells",
      defaultInput: "3,7,1,9", complexity: { time: "O(1) push/pop", space: "O(n)" },
      generateSteps: L.stackSteps,
      code: `1  s = []\n2  push(v)\n3  x = pop()\n4  // LIFO`,
      explanation: "Last-In-First-Out." }),
  t({ slug: "queue", name: "Queue", emoji: "📦", category: "ds", group: "Linear", renderer: "cells",
      defaultInput: "1,2,3,4", complexity: { time: "O(1) enqueue/dequeue", space: "O(n)" },
      generateSteps: L.queueSteps,
      code: `1  q = []\n2  enqueue(v) at back\n3  x = dequeue() from front\n4  // FIFO`,
      explanation: "First-In-First-Out." }),
  t({ slug: "deque", name: "Deque", emoji: "↔️", category: "ds", group: "Linear", renderer: "cells",
      defaultInput: "1,2,3", complexity: { time: "O(1) both ends", space: "O(n)" },
      generateSteps: L.dequeSteps,
      code: `1  dq = []\n2  pushBack(v)\n3  pushFront(99)\n4  popBack\n5  popFront\n6  final`,
      explanation: "Insertions and removals at both ends in O(1)." }),

  // ---- Hash ----
  t({ slug: "hash-map", name: "Hash Map", emoji: "🗂️", category: "ds", group: "Hash", renderer: "hash",
      defaultInput: "cat:🐱, dog:🐶, fox:🦊, ant:🐜, owl:🦉",
      complexity: { time: "avg O(1)", space: "O(n)" }, generateSteps: H.hashMapSteps,
      code: `1  map = new buckets\n2  idx = hash(key) % buckets\n3  bucket[idx].append({k,v})\n4  get(key): search chain\n5  return v`,
      explanation: "Key→value via hash function, collisions handled by chaining." }),
  t({ slug: "hash-set", name: "Hash Set", emoji: "🧮", category: "ds", group: "Hash", renderer: "hash",
      defaultInput: "5,2,8,5,1,2,9,8", complexity: { time: "avg O(1)", space: "O(n)" },
      generateSteps: H.hashSetSteps,
      code: `1  set = new buckets\n2  add(v): hash → bucket\n3  if present: skip\n4  else insert`,
      explanation: "Stores unique values only via hashing." }),

  // ---- Trees ----
  t({ slug: "binary-tree", name: "Binary Tree", emoji: "🌲", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "1,2,3,4,5,6,7", complexity: { time: "O(n) traversal", space: "O(n)" },
      generateSteps: T.binaryTreeSteps,
      code: `1  build level-order\n2  each node has left & right`,
      explanation: "Each node has at most two children." }),
  t({ slug: "bst", name: "Binary Search Tree", emoji: "🌳", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "5,3,8,1,4,7,9,2", complexity: { time: "avg O(log n)", space: "O(n)" },
      generateSteps: T.bstSteps,
      code: `1  if empty: root=v\n2  compare v vs current\n3  go left if smaller, right if larger\n4  BST built`,
      explanation: "Left subtree < node < right subtree." }),
  t({ slug: "avl", name: "AVL Tree", emoji: "⚖️", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "10,20,30,40,50,25", complexity: { time: "O(log n)", space: "O(n)" },
      generateSteps: T.avlSteps,
      code: `1  insert like BST\n2  compute balance factor\n3  rotate LL/LR/RR/RL to restore |bf|≤1`,
      explanation: "Self-balancing BST via rotations after each insert." }),
  t({ slug: "red-black", name: "Red-Black Tree", emoji: "🎨", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "10,20,30,40,50,25", complexity: { time: "O(log n)", space: "O(n)" },
      generateSteps: T.rbSteps,
      code: `1  insert red node\n2  fix violations by recoloring & rotations\n3  guarantees O(log n) height`,
      explanation: "BST with color invariants ensuring balance." }),
  t({ slug: "splay", name: "Splay Tree", emoji: "🌀", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "10,20,30,40,50,25", complexity: { time: "amortized O(log n)", space: "O(n)" },
      generateSteps: T.splaySteps,
      code: `1  insert\n2  splay accessed node to root via rotations`,
      explanation: "Recently used keys move to root, improving locality." }),
  t({ slug: "btree", name: "B-Tree / B+ Tree", emoji: "🗃️", category: "ds", group: "Trees", renderer: "grid",
      defaultInput: "10,20,5,6,12,30,7,17", complexity: { time: "O(log n)", space: "O(n)" },
      generateSteps: T.btreeSteps,
      code: `1  root = []\n2  insert into leaf, keep sorted\n3  split when full → promote median\n4  final`,
      explanation: "Multi-way tree used in filesystems and databases." }),
  t({ slug: "heap", name: "Heap (Min/Max)", emoji: "🏔️", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "8,3,5,1,7,2,6", complexity: { time: "O(log n) insert/extract", space: "O(n)" },
      generateSteps: T.heapSteps,
      code: `1  append at end\n2  sift up while smaller than parent\n3  swap\n4  root is min`,
      explanation: "Complete tree with heap property." }),
  t({ slug: "trie", name: "Trie (Prefix Tree)", emoji: "🌿", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "cat,car,cart,dog,do,done", complexity: { time: "O(L) per op", space: "O(Σ·N)" },
      generateSteps: T.trieSteps,
      code: `1  root = {}\n2  for each char: create/move child\n3  mark end-of-word`,
      explanation: "Prefix tree for strings; enables fast prefix search." }),
  t({ slug: "segment-tree", name: "Segment Tree", emoji: "📊", category: "ds", group: "Trees", renderer: "tree",
      defaultInput: "1,3,5,7,9,11", complexity: { time: "O(log n) query/update", space: "O(n)" },
      generateSteps: T.segmentTreeSteps,
      code: `1  build: each node stores segment sum\n2  query(l..r): descend nodes covering range`,
      explanation: "Interval tree for range queries and updates." }),
  t({ slug: "fenwick", name: "Fenwick Tree (BIT)", emoji: "📈", category: "ds", group: "Trees", renderer: "grid",
      defaultInput: "3,2,-1,6,5,4,-3,3,7,2", complexity: { time: "O(log n)", space: "O(n)" },
      generateSteps: T.fenwickSteps,
      code: `1  BIT[1..n] = 0\n2  update(i,v): while i≤n: BIT[i]+=v; i += i&-i\n3  prefixSum(i): while i>0: sum += BIT[i]; i -= i&-i`,
      explanation: "Compact structure for prefix sums with O(log n) updates." }),

  // ---- Graph DS ----
  t({ slug: "adj-matrix", name: "Adjacency Matrix", emoji: "🔲", category: "ds", group: "Graph DS", renderer: "grid",
      defaultInput: "a-b, a-c, b-d, c-d, d-e", complexity: { time: "O(1) lookup", space: "O(V²)" },
      generateSteps: G.adjMatrixSteps,
      code: `1  M = V × V zeros\n2  for edge (u,v): M[u][v]=M[v][u]=1\n3  lookup in O(1)`,
      explanation: "V×V grid where cell (i,j)=1 iff edge exists." }),
  t({ slug: "adj-list", name: "Adjacency List", emoji: "📇", category: "ds", group: "Graph DS", renderer: "graph",
      defaultInput: "a-b, a-c, b-d, c-d, d-e", complexity: { time: "O(deg)", space: "O(V+E)" },
      generateSteps: G.adjListSteps,
      code: `1  adj[v] = []\n2  add edges\n3  iterate neighbors`,
      explanation: "Array of neighbor lists per vertex — space efficient for sparse graphs." }),
  t({ slug: "dsu", name: "DSU / Union-Find", emoji: "🧷", category: "ds", group: "Graph DS", renderer: "graph",
      defaultInput: "1-2,3-4,2-3,5-6,4-5", complexity: { time: "α(n) per op", space: "O(n)" },
      generateSteps: G.dsuSteps,
      code: `1  parent[x] = x\n2  union(a,b): link roots\n3  find(x): follow parent, path-compress\n4  merged components`,
      explanation: "Disjoint set structure supporting union and find." }),

  // ---- Algorithms ----
  // Core
  t({ slug: "bit-manipulation", name: "Bit Manipulation", emoji: "🧮", category: "algo", group: "Core", renderer: "bits",
      defaultInput: "12, 10", complexity: { time: "O(1)", space: "O(1)" }, generateSteps: AV.bitSteps,
      code: `1  input A, B\n2  A & B (AND)\n3  A | B (OR)\n4  A ^ B (XOR)\n5  ~A (NOT)\n6  A << 1\n7  A >> 1\n8  popcount(A)`,
      explanation: "Direct binary transformations using AND/OR/XOR/NOT/shifts." }),
  t({ slug: "recursion", name: "Recursion", emoji: "🌀", category: "algo", group: "Core", renderer: "bars",
      defaultInput: "5", complexity: { time: "O(n)", space: "O(n) stack" }, generateSteps: AV.recursionSteps,
      code: `1  factorial(n): if n<=1 return 1\n2  return n * factorial(n-1)\n3  base case unwinds`,
      explanation: "Functions invoking themselves on smaller sub-problems." }),
  t({ slug: "divide-and-conquer", name: "Divide & Conquer", emoji: "✂️", category: "algo", group: "Core", renderer: "bars",
      defaultInput: "3,1,4,1,5,9,2,6,5,3,5", complexity: { time: "O(n log n)", space: "O(log n)" },
      generateSteps: AV.divideConquerSteps,
      code: `1  divide problem into halves\n2  solve each & combine\n3  answer`,
      explanation: "Split, solve, combine (e.g. merge sort, max subarray)." }),
  t({ slug: "greedy", name: "Greedy Paradigm", emoji: "💰", category: "algo", group: "Core", renderer: "bars",
      defaultInput: "1-3, 2-5, 4-7, 6-9, 5-8, 8-10", complexity: { time: "O(n log n)", space: "O(n)" },
      generateSteps: AV.greedySteps,
      code: `1  sort by finish time\n2  pick if start ≥ lastEnd\n3  else skip\n4  return picks`,
      explanation: "Locally optimal choice at each step (activity selection example)." }),
  t({ slug: "dp", name: "Dynamic Programming", emoji: "🧠", category: "algo", group: "Core", renderer: "grid",
      defaultInput: "8", complexity: { time: "O(n)", space: "O(n)" }, generateSteps: AV.dpSteps,
      code: `1  dp[0]=0, dp[1]=1\n2  dp[i] = dp[i-1] + dp[i-2]\n3  return dp[n]`,
      explanation: "Solve overlapping sub-problems by memoization (Fibonacci example)." }),

  // Sorting
  t({ slug: "bubble-sort", name: "Bubble Sort", emoji: "🫧", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "5,2,8,1,9,3,7,4", complexity: { time: "O(n²)", space: "O(1)" }, generateSteps: S.bubbleSortSteps,
      code: `1  for i in 0..n\n2    for j in 0..n-i-1: compare\n3      if a[j]>a[j+1]: swap\n4  sorted`,
      explanation: "Repeatedly swap adjacent out-of-order pairs." }),
  t({ slug: "selection-sort", name: "Selection Sort", emoji: "🎯", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "64,25,12,22,11", complexity: { time: "O(n²)", space: "O(1)" }, generateSteps: S.selectionSortSteps,
      code: `1  for i\n2    min = i\n3    scan j>i for smaller\n4    swap a[i] with a[min]\n5  sorted`,
      explanation: "Repeatedly select the minimum and place at front." }),
  t({ slug: "insertion-sort", name: "Insertion Sort", emoji: "📌", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "5,2,4,6,1,3", complexity: { time: "O(n²)", space: "O(1)" }, generateSteps: S.insertionSortSteps,
      code: `1  start with sorted[0]\n2  key = a[i]\n3  shift larger right\n4  insert key`,
      explanation: "Insert each element into the sorted prefix." }),
  t({ slug: "merge-sort", name: "Merge Sort", emoji: "🧩", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "38,27,43,3,9,82,10", complexity: { time: "O(n log n)", space: "O(n)" }, generateSteps: S.mergeSortSteps,
      code: `1  start\n2  split at mid\n3  merge sorted halves\n4  segment merged\n5  sorted`,
      explanation: "Divide-and-conquer sort with guaranteed O(n log n)." }),
  t({ slug: "quick-sort", name: "Quick Sort", emoji: "⚡", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "10,7,8,9,1,5", complexity: { time: "avg O(n log n)", space: "O(log n)" }, generateSteps: S.quickSortSteps,
      code: `1  start\n2  pivot = a[r]\n3  compare\n4  swap smaller left\n5  place pivot\n6  recurse partitions`,
      explanation: "Partition around pivot and recurse." }),
  t({ slug: "heap-sort", name: "Heap Sort", emoji: "⛰️", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "4,10,3,5,1,8,2", complexity: { time: "O(n log n)", space: "O(1)" }, generateSteps: S.heapSortSteps,
      code: `1  build max heap\n2  heapify subtree\n3  heap done\n4  swap root with end\n5  sorted`,
      explanation: "Repeatedly extract max from heap into the back." }),
  t({ slug: "counting-sort", name: "Counting Sort", emoji: "🔢", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "4,2,2,8,3,3,1", complexity: { time: "O(n+k)", space: "O(k)" }, generateSteps: S.countingSortSteps,
      code: `1  find max\n2  count[v]++\n3  emit v count[v] times\n4  sorted`,
      explanation: "Linear-time sort for bounded integer ranges." }),
  t({ slug: "radix-sort", name: "Radix Sort", emoji: "🔟", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "170,45,75,90,802,24,2,66", complexity: { time: "O(d·(n+b))", space: "O(n+b)" }, generateSteps: S.radixSortSteps,
      code: `1  start\n2  distribute by digit\n3  collect\n4  sorted`,
      explanation: "LSD radix: bucket by each digit from least significant." }),
  t({ slug: "bucket-sort", name: "Bucket Sort", emoji: "🪣", category: "algo", group: "Sorting", renderer: "bars",
      defaultInput: "29,25,3,49,9,37,21,43", complexity: { time: "avg O(n)", space: "O(n)" }, generateSteps: S.bucketSortSteps,
      code: `1  create k buckets\n2  scatter values\n3  sort each & append\n4  sorted`,
      explanation: "Distribute into buckets then sort each — linear when uniform." }),

  // Searching
  t({ slug: "linear-search", name: "Linear Search", emoji: "🔍", category: "algo", group: "Searching", renderer: "bars",
      defaultInput: "3,5,7,2,9,4,6 | 9", inputHint: "array | target",
      complexity: { time: "O(n)", space: "O(1)" }, generateSteps: SR.linearSearchSteps,
      code: `1  set target\n2  scan i=0..n\n3  return i if match\n4  not found`,
      explanation: "Check each element from start to end." }),
  t({ slug: "binary-search", name: "Binary Search", emoji: "🎯", category: "algo", group: "Searching", renderer: "bars",
      defaultInput: "1,3,5,7,9,11,13,15,17,19 | 13", inputHint: "sorted array | target",
      complexity: { time: "O(log n)", space: "O(1)" }, generateSteps: SR.binarySearchSteps,
      code: `1  l=0, r=n-1\n2  m=(l+r)/2\n3  if a[m]==target return\n4  narrow half\n5  not found`,
      explanation: "Log-time lookup on sorted arrays." }),
  t({ slug: "ternary-search", name: "Ternary Search", emoji: "🎚️", category: "algo", group: "Searching", renderer: "bars",
      defaultInput: "", complexity: { time: "O(log₃ n)", space: "O(1)" }, generateSteps: SR.ternarySearchSteps,
      code: `1  start l=0, r=n-1\n2  m1, m2 split into thirds\n3  narrow toward smaller\n4  min found`,
      explanation: "Find extremum of unimodal function by trisecting." }),

  // Two-pointer / window
  t({ slug: "two-pointers", name: "Two Pointers", emoji: "👉👈", category: "algo", group: "Patterns", renderer: "bars",
      defaultInput: "1,2,3,4,5,6,7,8 | 9", inputHint: "sorted array | target sum",
      complexity: { time: "O(n)", space: "O(1)" }, generateSteps: P.twoPointersSteps,
      code: `1  sort input\n2  compute a[L]+a[R]\n3  return pair if equal\n4  no pair`,
      explanation: "Two indices converge based on comparison." }),
  t({ slug: "sliding-window", name: "Sliding Window", emoji: "🪟", category: "algo", group: "Patterns", renderer: "bars",
      defaultInput: "2,1,5,1,3,2,7,1 | 3", inputHint: "array | window size k",
      complexity: { time: "O(n)", space: "O(1)" }, generateSteps: P.slidingWindowSteps,
      code: `1  build initial window\n2  slide: add new, drop old\n3  return best window`,
      explanation: "Maintain running metric over a sliding contiguous window." }),
  t({ slug: "floyd-cycle", name: "Floyd's Cycle (Fast/Slow)", emoji: "🐢🐇", category: "algo", group: "Patterns", renderer: "list",
      defaultInput: "1,2,3,4,5,6,7,8", complexity: { time: "O(n)", space: "O(1)" }, generateSteps: P.floydCycleSteps,
      code: `1  slow=fast=head\n2  slow=next, fast=next.next\n3  if slow==fast → cycle`,
      explanation: "Two pointers at 1× and 2× speed meet inside any cycle." }),
  t({ slug: "prefix-sum", name: "Prefix Sum", emoji: "➕", category: "algo", group: "Patterns", renderer: "cells",
      defaultInput: "3,1,4,1,5,9,2,6", complexity: { time: "O(n) build, O(1) query", space: "O(n)" },
      generateSteps: P.prefixSumSteps,
      code: `1  input array\n2  prefix[i+1] = prefix[i] + a[i]\n3  sum(l,r) = prefix[r+1]-prefix[l]`,
      explanation: "Precompute cumulative sums to answer range queries in O(1)." }),

  // Traversals
  t({ slug: "bfs", name: "Breadth-First Search", emoji: "📡", category: "algo", group: "Traversals", renderer: "graph",
      defaultInput: "a-b, a-c, b-d, c-d, d-e, e-f", complexity: { time: "O(V+E)", space: "O(V)" },
      generateSteps: TR.bfsSteps,
      code: `1  start node\n2  enqueue start\n3  pop front\n4  discover neighbors\n5  done`,
      explanation: "Level-order exploration using a queue." }),
  t({ slug: "dfs", name: "Depth-First Search", emoji: "🕳️", category: "algo", group: "Traversals", renderer: "graph",
      defaultInput: "a-b, a-c, b-d, c-d, d-e, e-f", complexity: { time: "O(V+E)", space: "O(V)" },
      generateSteps: TR.dfsSteps,
      code: `1  start\n2  visit u\n3  explore edge u→v\n4  backtrack\n5  done`,
      explanation: "Explore as deep as possible before backtracking." }),
  t({ slug: "tree-traversals", name: "Tree Traversals", emoji: "🌳", category: "algo", group: "Traversals", renderer: "tree",
      defaultInput: "5,3,8,1,4,7,9 | inorder", inputHint: "values | preorder|inorder|postorder",
      complexity: { time: "O(n)", space: "O(h)" }, generateSteps: TR.treeTraversalSteps,
      code: `1  build BST\n2  preorder: N,L,R\n3  inorder:  L,N,R\n4  postorder: L,R,N\n5  sequence`,
      explanation: "Structured recursive walks over binary trees." }),

  // Advanced graph
  t({ slug: "dijkstra", name: "Dijkstra", emoji: "🛣️", category: "algo", group: "Advanced Graph", renderer: "graph",
      defaultInput: "a-b:4, a-c:1, c-b:2, b-d:1, c-d:5, d-e:3, b-e:5", complexity: { time: "O((V+E)log V)", space: "O(V)" },
      generateSteps: AG.dijkstraSteps,
      code: `1  dist[src]=0\n2  pick unvisited min\n3  relax neighbors\n4  done`,
      explanation: "Shortest paths from a source on non-negative weighted graphs." }),
  t({ slug: "bellman-ford", name: "Bellman-Ford", emoji: "🔄", category: "algo", group: "Advanced Graph", renderer: "graph",
      defaultInput: "a-b:4, a-c:1, c-b:-2, b-d:1, c-d:5, d-e:3", complexity: { time: "O(V·E)", space: "O(V)" },
      generateSteps: AG.bellmanFordSteps,
      code: `1  dist[src]=0\n2  relax all edges V-1 times\n3  done (detect neg cycles otherwise)`,
      explanation: "Handles negative weights; slower than Dijkstra." }),
  t({ slug: "floyd-warshall", name: "Floyd-Warshall", emoji: "🕸️", category: "algo", group: "Advanced Graph", renderer: "grid",
      defaultInput: "a-b:3, a-c:8, b-d:1, c-b:4, c-d:2, d-a:2", complexity: { time: "O(V³)", space: "O(V²)" },
      generateSteps: AG.floydWarshallSteps,
      code: `1  init D matrix\n2  for k,i,j: D[i][j] = min(D[i][j], D[i][k]+D[k][j])\n3  done`,
      explanation: "All-pairs shortest paths via DP." }),
  t({ slug: "kruskal", name: "Kruskal's MST", emoji: "🌉", category: "algo", group: "Advanced Graph", renderer: "graph",
      defaultInput: "a-b:4, a-c:1, c-b:2, b-d:1, c-d:5, d-e:3, b-e:5", complexity: { time: "O(E log E)", space: "O(V)" },
      generateSteps: AG.kruskalSteps,
      code: `1  sort edges by weight\n2  consider each\n3  union if different components\n4  else skip (cycle)\n5  MST done`,
      explanation: "Build MST by adding lightest safe edges (uses DSU)." }),
  t({ slug: "prim", name: "Prim's MST", emoji: "🌱", category: "algo", group: "Advanced Graph", renderer: "graph",
      defaultInput: "a-b:4, a-c:1, c-b:2, b-d:1, c-d:5, d-e:3, b-e:5", complexity: { time: "O(E log V)", space: "O(V)" },
      generateSteps: AG.primSteps,
      code: `1  start at any node\n2  pick lightest edge crossing to outside\n3  repeat until spans V`,
      explanation: "Grow MST one lightest crossing edge at a time." }),
  t({ slug: "topological-sort", name: "Topological Sort (Kahn)", emoji: "📏", category: "algo", group: "Advanced Graph", renderer: "graph",
      defaultInput: "a-b, a-c, b-d, c-d, d-e, c-e", complexity: { time: "O(V+E)", space: "O(V)" },
      generateSteps: AG.topoSortSteps,
      code: `1  enqueue in-degree 0 nodes\n2  pop → append to order\n3  decrement neighbors\n4  final order`,
      explanation: "Linear ordering of DAG vertices — Kahn's BFS-style algorithm." }),

  // Advanced paradigms
  t({ slug: "backtracking", name: "Backtracking (N-Queens)", emoji: "♛", category: "algo", group: "Advanced", renderer: "grid",
      defaultInput: "5", complexity: { time: "exponential", space: "O(n)" }, generateSteps: AV.backtrackingSteps,
      code: `1  try (r,c)\n2  place if no conflict\n3  backtrack on dead-end\n4  solution!`,
      explanation: "Systematic search with pruning of infeasible branches." }),
  t({ slug: "kmp", name: "KMP String Search", emoji: "🔎", category: "algo", group: "Advanced", renderer: "text",
      defaultInput: "abxabcabcaby | abcaby", inputHint: "text | pattern",
      complexity: { time: "O(n+m)", space: "O(m)" }, generateSteps: AV.kmpSteps,
      code: `1  build LPS array\n2  extend LPS\n3  compare text vs pattern\n4  match found`,
      explanation: "Linear pattern matching using failure/LPS table." }),
  t({ slug: "rabin-karp", name: "Rabin-Karp", emoji: "#️⃣", category: "algo", group: "Advanced", renderer: "text",
      defaultInput: "GEEKS FOR GEEKS | GEEK", inputHint: "text | pattern",
      complexity: { time: "avg O(n+m)", space: "O(1)" }, generateSteps: AV.rabinKarpSteps,
      code: `1  hash pattern & first window\n2  slide window, roll hash\n3  verify on hash match\n4  else collision`,
      explanation: "Rolling hash pattern matching." }),
  t({ slug: "convex-hull", name: "Convex Hull (Graham Scan)", emoji: "🔷", category: "algo", group: "Advanced", renderer: "grid",
      defaultInput: "3,4,5,6,1,2,7,3,6,5,4,6,2,5,4,2", inputHint: "flat x,y pairs",
      complexity: { time: "O(n log n)", space: "O(n)" }, generateSteps: AV.convexHullSteps,
      code: `1  pick lowest point\n2  sort others by polar angle\n3  push, pop non-CCW turns\n4  push new\n5  hull done`,
      explanation: "Compute smallest convex polygon enclosing a set of points." }),
];

// ---- Attach interactive operations to structures ----
import * as OP from "./ops";
const attachOps = (slug: string, ops: import("./types").OpDef[], run: (c: import("./types").OpCommand[]) => Step[], initial: import("./types").OpCommand[] = []) => {
  const target = TOPICS.find((x) => x.slug === slug);
  if (target) { target.ops = ops; target.runOps = run; target.initialCommands = initial; }
};
attachOps("dynamic-array", OP.vectorOpsDefs, OP.vectorRunOps, [
  { op: "push_back", args: ["10"] }, { op: "push_back", args: ["20"] }, { op: "push_back", args: ["30"] },
]);
attachOps("stack", OP.stackOpsDefs, OP.stackRunOps, [{ op: "push", args: ["3"] }, { op: "push", args: ["7"] }]);
attachOps("queue", OP.queueOpsDefs, OP.queueRunOps, [{ op: "enqueue", args: ["1"] }, { op: "enqueue", args: ["2"] }]);
attachOps("deque", OP.dequeOpsDefs, OP.dequeRunOps, [{ op: "push_back", args: ["5"] }, { op: "push_front", args: ["9"] }]);
attachOps("singly-linked-list", OP.singlyListOpsDefs, OP.singlyListRunOps, [{ op: "insert_tail", args: ["10"] }, { op: "insert_tail", args: ["20"] }]);
attachOps("doubly-linked-list", OP.doublyListOpsDefs, OP.doublyListRunOps, [{ op: "insert_tail", args: ["1"] }, { op: "insert_tail", args: ["2"] }, { op: "insert_tail", args: ["3"] }]);
attachOps("circular-linked-list", OP.circularListOpsDefs, OP.circularListRunOps, [{ op: "insert_tail", args: ["A"] }, { op: "insert_tail", args: ["B"] }]);
attachOps("hash-map", OP.hashMapOpsDefs, OP.hashMapRunOps, [{ op: "put", args: ["cat", "🐱"] }, { op: "put", args: ["dog", "🐶"] }]);
attachOps("hash-set", OP.hashSetOpsDefs, OP.hashSetRunOps, [{ op: "add", args: ["5"] }, { op: "add", args: ["2"] }]);
attachOps("bst", OP.bstOpsDefs, OP.bstRunOps, [{ op: "insert", args: ["5"] }, { op: "insert", args: ["3"] }, { op: "insert", args: ["8"] }]);
attachOps("heap", OP.heapOpsDefs, OP.heapRunOps, [{ op: "push", args: ["5"] }, { op: "push", args: ["3"] }, { op: "push", args: ["8"] }, { op: "push", args: ["1"] }]);

export const TOPIC_BY_SLUG: Record<string, TopicDef> = Object.fromEntries(TOPICS.map((t) => [t.slug, t]));

export const GROUPED = (() => {
  const byCat: Record<"ds" | "algo", Record<string, TopicDef[]>> = { ds: {}, algo: {} };
  for (const t of TOPICS) {
    byCat[t.category][t.group] = byCat[t.category][t.group] ?? [];
    byCat[t.category][t.group].push(t);
  }
  return byCat;
})();

export function safeGenerate(topic: TopicDef, input: string): Step[] {
  try {
    const s = topic.generateSteps(input);
    return s.length ? s : [{ line: 0, note: "no steps produced", payload: { title: topic.name, body: "no output" } }];
  } catch (e) {
    return [{ line: 0, note: "error: " + (e instanceof Error ? e.message : String(e)), payload: { title: topic.name, body: String(e) } }];
  }
}
