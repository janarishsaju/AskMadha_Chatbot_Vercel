import { useState, useEffect, useRef } from "react";

/**
 * Reveals text gradually character-by-character for a typewriter effect.
 *
 * @param {string} fullText  The complete text received so far (grows as tokens arrive).
 * @param {boolean} done     When true, speeds up to flush remaining characters quickly.
 * @param {number} speed     Milliseconds between ticks (default 15ms).
 * @returns {string}         The portion of text revealed so far.
 */
export function useTypewriter(fullText, done, speed = 15) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const fullTextRef = useRef(fullText);
  const doneRef = useRef(done);

  // Keep refs in sync without re-creating the interval.
  fullTextRef.current = fullText;
  doneRef.current = done;

  // Reset when text is cleared (new message).
  useEffect(() => {
    if (fullText === "") {
      indexRef.current = 0;
      setDisplayed("");
    }
  }, [fullText]);

  // Single persistent interval that reads from refs — survives token updates.
  useEffect(() => {
    if (fullText === "") return;

    const interval = setInterval(() => {
      const text = fullTextRef.current;
      if (indexRef.current < text.length) {
        const charsPerTick = doneRef.current ? 3 : 1;
        indexRef.current = Math.min(indexRef.current + charsPerTick, text.length);
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText !== "", speed]);

  return displayed;
}
