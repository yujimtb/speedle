// Log of opener attempts: a full-length Enter of an unregistered word, or a
// Space reset of a partly typed guess, counts as a typo. Stored as lines of
// "<timestamp> <mode> <guess index> <typed> <0|1 typo> <e|s source>".
const key = "typolog";

// Only the first few guesses (the opener sequence) are judged.
export const openerCount = 4;

export interface TypoEntry {
  time: number;
  mode: string;
  guessIndex: number;
  typed: string;
  typo: boolean;
  source: "enter" | "space";
}

export interface OpenerStat {
  guessIndex: number;
  opener: string;
  rounds: number;
  typos: number;
}

export function logTypo(e: TypoEntry) {
  try {
    localStorage.setItem(key, (localStorage.getItem(key) || "") +
      `\n${e.time} ${e.mode} ${e.guessIndex} ${e.typed} ${e.typo ? 1 : 0} ${e.source[0]}`);
  } catch (err) {}
}

export function readTypos(): TypoEntry[] {
  let raw = "";
  try {
    raw = localStorage.getItem(key) || "";
  } catch (err) {}
  return raw.split("\n").filter(x => x).map(line => {
    const [time, mode, guessIndex, typed, typo, source] = line.split(" ");
    return {
      time: +time,
      mode,
      guessIndex: +guessIndex,
      typed,
      typo: typo === "1",
      source: source === "s" ? "space" : "enter",
    };
  });
}

export function clearTypos() {
  try {
    localStorage.removeItem(key);
  } catch (err) {}
}

// Typos made on each opener guess are attributed to the word that was
// eventually entered on that guess.
export function openerStats(entries: TypoEntry[]): OpenerStat[] {
  const stats = new Map<string, OpenerStat>();
  let pending = Array(openerCount).fill(0);
  for (const e of entries) {
    const i = e.guessIndex;
    if (i >= openerCount) continue;
    // A first-guess entry starts a new round; drop typos left by a round
    // that ended before reaching that guess.
    if (i === 0 && pending[0] === 0) pending = Array(openerCount).fill(0);
    if (e.typo) {
      ++pending[i];
      continue;
    }
    const k = `${i} ${e.typed}`;
    const s = stats.get(k) ?? { guessIndex: i, opener: e.typed, rounds: 0, typos: 0 };
    s.rounds += 1;
    s.typos += pending[i];
    stats.set(k, s);
    pending[i] = 0;
  }
  return Array.from(stats.values()).sort((a, b) =>
    a.guessIndex - b.guessIndex || b.rounds - a.rounds);
}

export function typoRate(typos: number, total: number): string {
  return total ? `${(typos / total * 100).toFixed(1)}%` : "-";
}
