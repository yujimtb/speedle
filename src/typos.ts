// Log of full-length Enter presses: an unregistered word counts as a typo.
// Stored as lines of "<timestamp> <mode> <guess index> <typed> <0|1 typo>".
const key = "typolog";

export interface TypoEntry {
  time: number;
  mode: string;
  guessIndex: number;
  typed: string;
  typo: boolean;
}

export interface OpenerStat {
  opener: string;
  rounds: number;
  typos: number;
}

export function logTypo(e: TypoEntry) {
  try {
    localStorage.setItem(key, (localStorage.getItem(key) || "") +
      `\n${e.time} ${e.mode} ${e.guessIndex} ${e.typed} ${e.typo ? 1 : 0}`);
  } catch (err) {}
}

export function readTypos(): TypoEntry[] {
  let raw = "";
  try {
    raw = localStorage.getItem(key) || "";
  } catch (err) {}
  return raw.split("\n").filter(x => x).map(line => {
    const [time, mode, guessIndex, typed, typo] = line.split(" ");
    return {
      time: +time,
      mode,
      guessIndex: +guessIndex,
      typed,
      typo: typo === "1",
    };
  });
}

export function clearTypos() {
  try {
    localStorage.removeItem(key);
  } catch (err) {}
}

// Typos made on the first guess are attributed to the opener that was
// eventually entered on that guess.
export function openerStats(entries: TypoEntry[]): OpenerStat[] {
  const stats = new Map<string, OpenerStat>();
  let pending = 0;
  for (const e of entries) {
    if (e.guessIndex !== 0) continue;
    if (e.typo) {
      ++pending;
      continue;
    }
    const s = stats.get(e.typed) ?? { opener: e.typed, rounds: 0, typos: 0 };
    s.rounds += 1;
    s.typos += pending;
    stats.set(e.typed, s);
    pending = 0;
  }
  return Array.from(stats.values()).sort((a, b) => b.rounds - a.rounds);
}

export function typoRate(typos: number, total: number): string {
  return total ? `${(typos / total * 100).toFixed(1)}%` : "-";
}
