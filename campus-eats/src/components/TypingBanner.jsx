import React, { useEffect, useState, useRef } from "react";

const LINES = [
  "LOOKING FOR FOOD AT CAMPUS?",
  "REGISTER YOUR CAMPUS",
  "ENJOY",
];

export default function TypingBanner() {
  const [display, setDisplay] = useState(LINES.map(() => ""));
  const lineRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef("typing");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer = null;

    function step() {
      const lineIdx = lineRef.current;
      const cur = LINES[lineIdx];
      const chars = charRef.current;

      if (phaseRef.current === "typing") {
        if (chars < cur.length) {
          const next = [...display];
          next[lineIdx] = cur.slice(0, chars + 1);
          setDisplay(next);
          charRef.current += 1;
          timer = setTimeout(step, 40 + Math.random() * 30);
        } else {
          phaseRef.current = "pause";
          timer = setTimeout(() => { phaseRef.current = "next"; step(); }, 700);
        }
      } else if (phaseRef.current === "next") {
        // advance to next line or finish
        if (lineIdx < LINES.length - 1) {
          lineRef.current += 1;
          charRef.current = 0;
          phaseRef.current = "typing";
          timer = setTimeout(step, 150);
        } else {
          // all lines typed - hold then clear and restart
          phaseRef.current = "hold";
          timer = setTimeout(() => {
            setDisplay(LINES.map(() => ""));
            lineRef.current = 0;
            charRef.current = 0;
            phaseRef.current = "typing";
            timer = setTimeout(step, 400);
          }, 1100);
        }
      }
    }

    timer = setTimeout(step, 400);
    return () => { mounted.current = false; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card p-3 bg-transparent dark:bg-transparent">
      <div className="h-16 flex flex-col justify-center">
        {display.map((d, i) => (
          <div key={i} className="text-sm md:text-base font-semibold text-gray-200 dark:text-gray-200 leading-tight">
            <span className="mr-1">{d}</span>
            <span className="inline-block w-2 h-4 align-middle animate-blink">&nbsp;</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes blink { 50% { opacity: 0 } }
        .animate-blink { animation: blink 1s steps(1) infinite; background: transparent; border-left: 2px solid rgba(255,255,255,0.85); }
      `}</style>
    </div>
  );
}
