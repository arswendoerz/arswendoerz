// Regenerates the generated assets and places the mascot: node assets/make-assets.js
//   tech-ticker.svg, footer.svg and stats-title.svg are written from scratch;
//   header.svg and about.svg are hand-written, and only their mascot block is replaced.
const fs = require('fs');
const path = require('path');
const { elephant, mascotDefs, mascotCss } = require('./mascot');

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
  const height = 170;
  // A wave path two wavelengths wide per screen; shifting by one wavelength loops seamlessly.
  const wave = (amp, len, y) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < width * 2; x += len) {
      d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    }
    return { d: `${d} V${height} H0 Z`, len };
  };
  const layers = [
    { ...wave(14, 400, 82), fill: '#7C3AED', op: .35, dur: 14 },
    { ...wave(18, 600, 98), fill: '#4F8CC9', op: .45, dur: 18 },
    { ...wave(12, 300, 116), fill: '#38B2AC', op: .55, dur: 10 },
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Footer">
  <defs>${mascotDefs()}</defs>
  <style>${mascotCss()}
${layers.map((l, i) => `    .w${i}{animation:w${i} ${l.dur}s linear infinite}
    @keyframes w${i}{to{transform:translateX(-${l.len}px)}}`).join('\n')}
  </style>
${layers.map((l, i) => `  <path class="w${i}" d="${l.d}" fill="${l.fill}" fill-opacity="${l.op}"/>`
    // The mascot wades behind the front wave.
    + (i === 1 ? `\n  ${elephant({ x: 1040, y: 58, s: 0.55, trunk: 'wave' })}` : '')).join('\n')}
</svg>
`;
  fs.writeFileSync(path.join(__dirname, 'footer.svg'), svg);
  console.log('wrote footer.svg');
}

// Replaces (or appends) the block between the mascot markers in a hand-written SVG.
function inject(file, content) {
  const p = path.join(__dirname, file);
  let svg = fs.readFileSync(p, 'utf8');
  const block = `<!-- mascot -->${content}<!-- /mascot -->`;
  svg = svg.includes('<!-- mascot -->')
    ? svg.replace(/<!-- mascot -->[\s\S]*?<!-- \/mascot -->/, block)
    : svg.replace(/<\/svg>\s*$/, `  ${block}\n</svg>\n`);
  fs.writeFileSync(p, svg);
  console.log('placed mascot in', file);
}

function scenes() {
  const head = `<defs>${mascotDefs()}</defs><style>${mascotCss()}</style>`;

  // Banner: waving at the right of the name.
  inject('header.svg', `${head}${elephant({ x: 1075, y: 145, s: 1.15, trunk: 'wave' })}`);

  // About card: typing behind a laptop, code symbols drifting up from the screen.
  const symbols = [['{ }', 985, 0], ['&lt;/&gt;', 1060, 1.2], ['=&gt;', 1135, 2.4]]
    .map(([t, x, d]) => `<text class="fx" x="${x}" y="250" style="animation-delay:${d}s" text-anchor="middle">${t}</text>`).join('');
  inject('about.svg', `${head}
  <style>
    .fx{font-family:Consolas,'SFMono-Regular',Menlo,monospace;font-size:15px;fill:#5EEAD4;opacity:0;animation:fx 3.6s ease-out infinite}
    @keyframes fx{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px)}}
  </style>
  ${elephant({ x: 1060, y: 190, s: 0.95, trunk: 'type' })}
  ${symbols}
  <g>
    <rect x="998" y="246" width="124" height="58" rx="8" fill="#1A1D33" stroke="#F2C46D" stroke-width="1.6"/>
    <rect x="998" y="246" width="124" height="58" rx="8" fill="none" stroke="#5EEAD4" stroke-opacity=".35" stroke-width="4" filter="url(#elGlow)"/>
    <text x="1060" y="282" text-anchor="middle" font-family="Consolas,'SFMono-Regular',Menlo,monospace" font-size="18" font-weight="700" fill="#5EEAD4" filter="url(#elGlow)" class="el-led">&lt;/&gt;</text>
    <path d="M980 304 H1140 L1132 314 H988 Z" fill="#2E3460" stroke="#0B0D18" stroke-width="1.4"/>
  </g>`);

  // Section title: the head peeks up and points its trunk at the heading.
  const w = 1200;
  const h = 140;
  const sparkles = [[505, 70, 0], [528, 96, 0.6], [540, 52, 1.2]]
    .map(([x, y, d]) => `<path class="sp" style="animation-delay:${d}s" d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z" fill="#F2C46D"/>`).join('');
  const title = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="GitHub Stats">
  <defs>${mascotDefs()}
    <linearGradient id="tt" x1="0" x2="1">
      <stop offset="0" stop-color="#14B8A6"/><stop offset=".5" stop-color="#6366F1"/><stop offset="1" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
  <style>${mascotCss()}
    .sp{animation:sp 1.8s ease-in-out infinite}
    @keyframes sp{0%,100%{opacity:.2}50%{opacity:1}}
  </style>
  ${elephant({ x: 420, y: 100, s: 0.9, trunk: 'point', body: false })}
  ${sparkles}
  <text x="680" y="86" text-anchor="middle" font-family="'Segoe UI',Ubuntu,'Helvetica Neue',Arial,sans-serif" font-size="34" font-weight="800" fill="url(#tt)">GitHub Stats</text>
</svg>
`;
  fs.writeFileSync(path.join(__dirname, 'stats-title.svg'), title);
  console.log('wrote stats-title.svg');
}

ticker().then(footer).then(scenes);
