import { useState } from "react";
import { clearTypos, openerCount, openerStats, readTypos, typoRate } from "./typos";

export function TypoStats() {
  const [entries, setEntries] = useState(readTypos);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const judged = entries.filter(e => e.guessIndex < openerCount);
  const typos = judged.filter(e => e.typo).length;
  const byGuess = Array.from({ length: openerCount }, (_, i) => {
    const es = judged.filter(e => e.guessIndex === i);
    return { enters: es.length, typos: es.filter(e => e.typo).length };
  });
  const openers = openerStats(entries);

  const copyCsv = async () => {
    const csv = "time,mode,guess,typed,typo\n" + entries.map(e =>
      `${new Date(e.time).toISOString()},${e.mode},${e.guessIndex + 1},${e.typed},${e.typo ? 1 : 0}`
    ).join("\n");
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
  };

  return (
    <div className="TypoStats">
      <table>
        <tbody>
          <tr>
            <td>guesses 1-{openerCount}</td>
            <td>{typos}/{judged.length}</td>
            <td>{typoRate(typos, judged.length)}</td>
          </tr>
          {byGuess.map((g, i) => (
            <tr key={i}>
              <td>guess {i + 1}</td>
              <td>{g.typos}/{g.enters}</td>
              <td>{typoRate(g.typos, g.enters)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="TypoStats-openers">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>opener</th>
              <th>rounds</th>
              <th>typos</th>
              <th>rate</th>
            </tr>
          </thead>
          <tbody>
            {openers.map(s => (
              <tr key={`${s.guessIndex} ${s.opener}`}>
                <td>{s.guessIndex + 1}</td>
                <td>{s.opener.toUpperCase()}</td>
                <td>{s.rounds}</td>
                <td>{s.typos}</td>
                <td>{typoRate(s.typos, s.typos + s.rounds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <button onClick={copyCsv}>{copied ? "Copied!" : "Copy log as CSV"}</button>{" "}
        <button onClick={() => {
          if (confirming) {
            clearTypos();
            setEntries([]);
          }
          setConfirming(c => !c);
        }}>
          {confirming ? "Really clear?" : "Clear typo log"}
        </button>
      </p>
    </div>
  );
}
