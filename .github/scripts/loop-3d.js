// Turns the 3D graph's one-shot "grow" animation into a loop: bars grow, hold,
// sink and grow again, in a ripple that runs from the oldest week to the newest.
// Usage: node .github/scripts/loop-3d.js <file.svg>
const fs = require('fs');

const file = process.argv[2];
let svg = fs.readFileSync(file, 'utf8');

const DUR = 9; // seconds per cycle
const RIPPLE = 2.5; // seconds between the first and last week
const ease = '0.4 0 0.2 1';

// Each bar is a <g> whose animateTransform comes first, followed by the
// animate tags of its side panels, so the bar's x position applies to all three.
const xs = [...svg.matchAll(/<animateTransform[^>]*values="([\d.-]+) /g)].map(m => Number(m[1]));
const minX = Math.min(...xs);
const maxX = Math.max(...xs);

let begin = '0s';
let count = 0;
svg = svg.replace(
  /<(animateTransform|animate)([^>]*?) values="([^";]+);([^"]+)" dur="3s" repeatCount="1"/g,
  (_, tag, attrs, from, to) => {
    if (tag === 'animateTransform') {
      const x = Number(from.split(' ')[0]);
      begin = `${(-RIPPLE * (1 - (x - minX) / (maxX - minX || 1))).toFixed(2)}s`;
    }
    count++;
    return `<${tag}${attrs} values="${from};${to};${to};${from}" keyTimes="0;0.3;0.85;1"` +
      ` calcMode="spline" keySplines="${ease};0 0 1 1;${ease}"` +
      ` dur="${DUR}s" begin="${begin}" repeatCount="indefinite"`;
  },
);

fs.writeFileSync(file, svg);
console.log(`looped ${count} animations in ${file}`);
