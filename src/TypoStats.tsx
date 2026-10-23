import { useState } from "react";
import { clearTypos, openerStats, readTypos, typoRate } from "./typos";

export function TypoStats() {
  const [entries, setEntries] = useState(readTypos);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const typos = entries.filter(e => e.typo).length;
  const firstGuess = entries.filter(e => e.guessIndex === 0);
  const firstTypos = firstGuess.filter(e => e.typo).length;
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
            <td>all guesses</td>
            <td>{typos}/{entries.length}</td>
            <td>{typoRate(typos, entries.length)}</td>
          </tr>
          <tr>
            <td>first guess</td>
            <td>{firstTypos}/{firstGuess.length}</td>
            <td>{typoRate(firstTypos, firstGuess.length)}</td>
          </tr>
        </tbody>
      </table>
      <div className="TypoStats-openers">
        <table>
          <thead>
            <tr>
              <th>opener</th>
              <th>rounds</th>
              <th>typos</th>
              <th>rate</th>
            </tr>
          </thead>
          <tbody>
            {openers.map(s => (
              <tr key={s.opener}>
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
