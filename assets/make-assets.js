// Regenerates assets/tech-ticker.svg and assets/footer.svg: node assets/make-assets.js
const fs = require('fs');
const path = require('path');

const ICONS = ['react', 'nextjs', 'ts', 'js', 'tailwind', 'html', 'css', 'vite',
  'laravel', 'php', 'nodejs', 'express', 'python', 'git', 'figma', 'vscode'];

async function ticker() {
  const size = 56;
  const gap = 28;
  const step = size + gap;
  const rowWidth = ICONS.length * step;
  const width = 1200;
  const height = 96;

  const parts = [];
  for (const [i, name] of ICONS.entries()) {
    const raw = await (await fetch(`https://skillicons.dev/icons?i=${name}`)).text();
    // Keep the inner 256x256 icon and give its ids a unique prefix, since every
    // icon is used twice (the row is drawn two times for a seamless loop).
    const inner = raw.slice(raw.indexOf('<g transform="translate(0, 0)">') + 31, raw.lastIndexOf('</g>')).trim();
    const id = `i${i}`;
    const body = inner
      .replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
      .replace(/id="([^"]+)"/g, `id="${id}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`)
      .replace(/href="#([^"]+)"/g, `href="#${id}-$1"`);
    parts.push(`<symbol id="${id}" viewBox="0 0 256 256">${body}</symbol>`);
  }

  const uses = row => ICONS.map((_, i) =>
    `<use href="#i${i}" x="${row * rowWidth + i * step}" y="${(height - size) / 2}" width="${size}" height="${size}"/>`).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tech stack: ${ICONS.join(', ')}">
  <defs>
    ${parts.join('\n    ')}
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".1" stop-color="#fff"/>
      <stop offset=".9" stop-color="#fff"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="edges"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask>
  </defs>
  <style>
    .track{animation:slide 32s linear infinite}
    @keyframes slide{to{transform:translateX(-${rowWidth}px)}}
  </style>
  <g mask="url(#edges)">
    <g class="track">${uses(0)}${uses(1)}</g>
  </g>
</svg>
`;
  fs.writeFileSync(path.join(__dirname, 'tech-ticker.svg'), svg);
  console.log('wrote tech-ticker.svg', Math.round(svg.length / 1024), 'KB');
}

function footer() {
  const width = 1200;
  const height = 150;
  // A wave path two wavelengths wide per screen; shifting by one wavelength loops seamlessly.
  const wave = (amp, len, y) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < width * 2; x += len) {
      d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    }
    return { d: `${d} V${height} H0 Z`, len };
  };
  const layers = [
    { ...wave(14, 400, 62), fill: '#7C3AED', op: .35, dur: 14 },
    { ...wave(18, 600, 78), fill: '#4F8CC9', op: .45, dur: 18 },
    { ...wave(12, 300, 96), fill: '#38B2AC', op: .55, dur: 10 },
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Footer">
  <style>
${layers.map((l, i) => `    .w${i}{animation:w${i} ${l.dur}s linear infinite}
    @keyframes w${i}{to{transform:translateX(-${l.len}px)}}`).join('\n')}
  </style>
${layers.map((l, i) => `  <path class="w${i}" d="${l.d}" fill="${l.fill}" fill-opacity="${l.op}"/>`).join('\n')}
</svg>
`;
  fs.writeFileSync(path.join(__dirname, 'footer.svg'), svg);
  console.log('wrote footer.svg');
}

ticker().then(footer);
