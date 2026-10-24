// Cyber Gajah Lampung: a Sumatran elephant (Way Kambas) in dark armour with neon rim light,
// crowned with a glowing Siger and trimmed with gold tapis diamond (belah ketupat) motifs.
//
// mascotDefs() and mascotCss() go once into each SVG; elephant() can be placed many times.
// Animated groups never carry a transform attribute, since a CSS animation would replace it.

const C = {
  line: '#0B0D18',
  teal: '#5EEAD4',
  violet: '#A78BFA',
  gold: '#F2C46D',
  plate: '#171A2E',
};

// Trunk poses start at the trunk base. Each has three shapes with the same path commands;
// the trunk morphs rest -> b -> rest -> c -> rest, so it bends like a trunk instead of
// swinging stiffly from the base.
const TRUNKS = {
  down: {
    dur: 3.2,
    frames: [
      'M0 0 C0 18 -2 30 6 38 C12 44 20 40 18 32',
      'M0 0 C2 18 3 30 11 37 C17 42 25 36 21 28',
      'M0 0 C-2 18 -6 30 0 39 C6 46 15 45 15 37',
    ],
  },
  wave: {
    dur: 2.4,
    frames: [
      'M0 0 C22 8 48 0 58 -26 C64 -44 58 -62 46 -68',
      'M0 0 C24 6 52 -6 62 -32 C68 -50 72 -64 84 -66',
      'M0 0 C20 10 44 6 54 -18 C60 -34 50 -50 38 -50',
    ],
  },
  point: {
    dur: 2.6,
    frames: [
      'M0 0 C12 8 34 8 58 -6',
      'M0 0 C12 10 36 13 61 3',
      'M0 0 C12 6 32 1 55 -15',
    ],
  },
  type: {
    dur: 0.7,
    frames: [
      'M0 0 C0 14 0 26 2 36',
      'M0 0 C1 14 4 25 7 34',
      'M0 0 C-1 14 -4 25 -3 35',
    ],
  },
};

const tipOf = d => d.trim().split(/[ ,]+/).slice(-2).map(Number);

function morph(attr, [a, b, c], dur) {
  const ease = '0.45 0 0.55 1';
  return `<animate attributeName="${attr}" values="${a};${b};${a};${c};${a}" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="${ease};${ease};${ease};${ease}" dur="${dur}s" repeatCount="indefinite"/>`;
}

const r = n => +n.toFixed(2);

function mascotDefs() {
  return `
    <radialGradient id="elMetal" cx=".35" cy=".28" r=".85">
      <stop offset="0" stop-color="#7C87CB"/><stop offset=".45" stop-color="#3A4178"/><stop offset="1" stop-color="#171A32"/>
    </radialGradient>
    <radialGradient id="elEar" cx=".5" cy=".35" r=".8">
      <stop offset="0" stop-color="#5A64A6"/><stop offset=".6" stop-color="#2D335E"/><stop offset="1" stop-color="#14172B"/>
    </radialGradient>
    <linearGradient id="elGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFF1B8"/><stop offset=".45" stop-color="#F2C46D"/><stop offset="1" stop-color="#A86F24"/>
    </linearGradient>
    <linearGradient id="elRim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.teal}"/><stop offset=".45" stop-color="${C.teal}" stop-opacity="0"/>
      <stop offset=".55" stop-color="${C.violet}" stop-opacity="0"/><stop offset="1" stop-color="${C.violet}"/>
    </linearGradient>
    <radialGradient id="elShadow">
      <stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="elHalo">
      <stop offset="0" stop-color="${C.gold}" stop-opacity=".45"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="elCore">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#9FF7E8"/><stop offset="1" stop-color="${C.teal}" stop-opacity=".25"/>
    </radialGradient>
    <filter id="elGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="elSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>`;
}

// A chain of small gold diamonds (belah ketupat), a common tapis motif.
function diamonds(x0, x1, y, h) {
  const n = Math.max(2, Math.round((x1 - x0) / (h * 1.6)));
  const w = (x1 - x0) / n;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = x0 + w * (i + 0.5);
    d += `M${r(cx - w / 2 + 0.6)} ${y} L${r(cx)} ${r(y - h)} L${r(cx + w / 2 - 0.6)} ${y} L${r(cx)} ${r(y + h)} Z `;
  }
  return `<path d="${d}" fill="url(#elGold)"/>`;
}

function siger() {
  // Nine pointed leaf prongs fanned along the band, tallest in the middle, like the Siger crown.
  const prongs = [];
  const veins = [];
  for (let i = 0; i < 9; i++) {
    const a = ((-56 + i * 14) * Math.PI) / 180;
    const len = 31 - Math.abs(i - 4) * 3.2;
    const [sx, cx] = [Math.sin(a), Math.cos(a)];
    const bx = 36 * sx;
    const by = -10 - 36 * cx;
    const tx = bx + len * sx;
    const ty = by - len * cx;
    const [px, py] = [cx * 6, sx * 6]; // perpendicular half-width at the base
    const mx = bx + (tx - bx) * 0.45;
    const my = by + (ty - by) * 0.45;
    prongs.push(`<path d="M${r(bx - px)} ${r(by - py)} Q${r(mx - px * 1.3)} ${r(my - py * 1.3)} ${r(tx)} ${r(ty)} Q${r(mx + px * 1.3)} ${r(my + py * 1.3)} ${r(bx + px)} ${r(by + py)} Z" fill="url(#elGold)" stroke="#7A4E14" stroke-width=".9"/>`);
    veins.push(`M${r(bx)} ${r(by)} L${r(bx + (tx - bx) * 0.72)} ${r(by + (ty - by) * 0.72)}`);
  }
  return `
    <ellipse cx="0" cy="-58" rx="58" ry="30" fill="url(#elHalo)" class="el-shimmer"/>
    ${prongs.join('')}
    <path d="${veins.join(' ')}" stroke="#9A6420" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M-31.2 -28 A36 36 0 0 1 31.2 -28" fill="none" stroke="url(#elGold)" stroke-width="9" stroke-linecap="round"/>
    <path d="M-29 -30.6 A33.5 33.5 0 0 1 29 -30.6" fill="none" stroke="${C.teal}" stroke-width="1.4" filter="url(#elGlow)" class="el-led"/>
    ${diamonds(-24, 24, -36.5, 4)}
    <path d="M0 -55 L5.5 -47 L0 -39 L-5.5 -47 Z" fill="${C.teal}" stroke="#E6FFFA" stroke-width=".8" filter="url(#elGlow)" class="el-core"/>`;
}

function ear(side) {
  const m = side === 'L' ? 1 : -1;
  const rim = side === 'L' ? C.teal : C.violet;
  const circuit = [
    `M${-20 * m} -12 h${-8 * m} v10 h${-7 * m}`,
    `M${-21 * m} 8 h${-11 * m} v9`,
    `M${-24 * m} 24 h${-8 * m} v-6`,
  ].join(' ');
  const nodes = [[-35, -2], [-32, 17], [-32, 18], [-20, -12], [-21, 8], [-24, 24]]
    .map(([x, y]) => `<circle cx="${x * m}" cy="${y}" r="1.9" fill="${rim}"/>`).join('');
  return `<g transform="translate(${-36 * m} -6)"><g class="el-ear${side}">
      <ellipse cx="${-26 * m}" cy="4" rx="31" ry="39" fill="url(#elEar)" stroke="${C.line}" stroke-width="1.6"/>
      <ellipse cx="${-26 * m}" cy="4" rx="31" ry="39" fill="none" stroke="${rim}" stroke-opacity=".75" stroke-width="1.6" filter="url(#elGlow)"/>
      <ellipse cx="${-28 * m}" cy="6" rx="20" ry="27" fill="${C.plate}" stroke="url(#elGold)" stroke-width="1.6"/>
      <g filter="url(#elGlow)">
        <path class="el-flow" d="${circuit}" fill="none" stroke="${rim}" stroke-width="1.7" stroke-linecap="round"/>
        <g class="el-led">${nodes}</g>
      </g>
    </g></g>`;
}

function eye(x) {
  const m = x < 0 ? 1 : -1;
  // Angular visor eye, slanted towards the trunk for a determined look.
  const d = `M${-9 * m} -3 L${8 * m} -6 L${6 * m} 3 L${-7 * m} 3 Z`;
  return `<g transform="translate(${x} -2)"><g class="el-blink">
      <path d="${d}" fill="${C.teal}" filter="url(#elGlow)"/>
      <path d="M${-5 * m} -1.5 L${3 * m} -3" stroke="#E6FFFA" stroke-width="1.4" stroke-linecap="round"/>
    </g></g>`;
}

// Arc-reactor style chest core: gold tapis ring, spinning neon ring, a mini Siger in the light.
function chestCore() {
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const [x, y] = [Math.sin(a) * 21.5, -Math.cos(a) * 21.5];
    ticks.push(`M${r(x)} ${r(y - 2.4)} L${r(x + 2.4)} ${r(y)} L${r(x)} ${r(y + 2.4)} L${r(x - 2.4)} ${r(y)} Z`);
  }
  const mini = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-40 + i * 20) * Math.PI) / 180;
    const len = 7 - Math.abs(i - 2) * 1.4;
    const [sx, cx] = [Math.sin(a), Math.cos(a)];
    const [bx, by] = [5 * sx, 3 - 5 * cx];
    const [tx, ty] = [bx + len * sx, by - len * cx];
    mini.push(`M${r(bx - cx * 1.6)} ${r(by - sx * 1.6)} L${r(tx)} ${r(ty)} L${r(bx + cx * 1.6)} ${r(by + sx * 1.6)} Z`);
  }
  return `<g transform="translate(0 76)">
        <circle r="25" fill="${C.plate}" stroke="url(#elGold)" stroke-width="2"/>
        <path d="${ticks.join(' ')}" fill="url(#elGold)"/>
        <g class="el-spin">
          <circle r="16.5" fill="none" stroke="${C.teal}" stroke-width="2.4" stroke-dasharray="9 4.5" filter="url(#elGlow)"/>
        </g>
        <circle r="11" fill="url(#elCore)" class="el-core"/>
        <path d="${mini.join(' ')} M-6.5 4.5 A6.5 6.5 0 0 1 6.5 4.5" fill="url(#elGold)" stroke="url(#elGold)" stroke-width="1.6" stroke-linecap="round"/>
      </g>`;
}

function tusk(m) {
  return `<path d="M${-11 * m} 16 Q${-15 * m} 30 ${-27 * m} 34 Q${-18 * m} 26 ${-6 * m} 20 Z" fill="url(#elGold)" stroke="#7A4E14" stroke-width=".8"/>`;
}

/**
 * @param {{x:number, y:number, s:number, trunk:keyof TRUNKS, body?:boolean, walk?:boolean}} o
 *   x/y place the head centre; body:false draws only the head (for peeking);
 *   walk:true steps the legs and waddles instead of bobbing in place.
 */
function elephant({ x, y, s = 1, trunk = 'down', body = true, walk = false }) {
  const leg = (lx, side) => `<g class="${walk ? `el-step${side}` : ''}">
      <rect x="${lx}" y="84" width="24" height="34" rx="8" fill="url(#elMetal)" stroke="${C.line}" stroke-width="1.6"/>
      <rect x="${lx}" y="95" width="24" height="5" fill="url(#elGold)"/>
      <rect x="${lx + 5}" y="112" width="14" height="3" rx="1.5" fill="${C.teal}" filter="url(#elGlow)" class="el-led"/></g>`;
  const lower = body ? `
      <ellipse cx="0" cy="122" rx="52" ry="8" fill="url(#elShadow)"/>
      ${leg(-36, 'L')}${leg(12, 'R')}
      <ellipse cx="0" cy="74" rx="44" ry="34" fill="url(#elMetal)" stroke="${C.line}" stroke-width="1.6"/>
      <ellipse cx="0" cy="74" rx="44" ry="34" fill="none" stroke="url(#elRim)" stroke-width="2" filter="url(#elGlow)"/>
      ${chestCore()}
      <ellipse cx="0" cy="45" rx="36" ry="8" fill="#000" opacity=".5" filter="url(#elSoft)"/>` : '';
  const t = TRUNKS[trunk];
  const d0 = t.frames[0];
  const dAnim = morph('d', t.frames, t.dur);
  const tips = t.frames.map(tipOf);

  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${walk ? 'el-waddle' : 'el-bob'}">
    ${lower}
    ${ear('L')}${ear('R')}
    <circle r="46" fill="url(#elMetal)" stroke="${C.line}" stroke-width="1.6"/>
    <circle r="46" fill="none" stroke="url(#elRim)" stroke-width="2.2" filter="url(#elGlow)"/>
    ${siger()}
    ${eye(-17)}${eye(17)}
    ${tusk(1)}${tusk(-1)}
    <g transform="translate(0 8)">
      <path d="${d0}" fill="none" stroke="${C.line}" stroke-width="17" stroke-linecap="round">${dAnim}</path>
      <path d="${d0}" fill="none" stroke="#2E3460" stroke-width="14" stroke-linecap="round">${dAnim}</path>
      <path d="${d0}" fill="none" stroke="#4C5590" stroke-width="14" stroke-dasharray="3 6" stroke-linecap="butt">${dAnim}</path>
      <path d="${d0}" fill="none" stroke="#8C96D6" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" transform="translate(-2.6 -2.2)">${dAnim}</path>
      <circle cx="${tips[0][0]}" cy="${tips[0][1]}" r="4" fill="none" stroke="${C.teal}" stroke-width="1.8" filter="url(#elGlow)" class="el-led">
        ${morph('cx', tips.map(p => p[0]), t.dur)}${morph('cy', tips.map(p => p[1]), t.dur)}
      </circle>
    </g>
  </g></g>`;
}

function mascotCss() {
  return `
    .el-bob{animation:el-bob 3.2s ease-in-out infinite}
    @keyframes el-bob{50%{transform:translateY(-4px)}}
    .el-earL{animation:el-earL 2.6s ease-in-out infinite}
    @keyframes el-earL{50%{transform:rotate(-8deg)}}
    .el-earR{animation:el-earR 2.6s ease-in-out infinite}
    @keyframes el-earR{50%{transform:rotate(8deg)}}
    .el-blink{animation:el-blink 4.5s infinite}
    @keyframes el-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}
    .el-led{animation:el-led 1.8s ease-in-out infinite}
    @keyframes el-led{50%{opacity:.35}}
    .el-core{animation:el-core 2.2s ease-in-out infinite}
    @keyframes el-core{50%{opacity:.45}}
    .el-flow{stroke-dasharray:4 3;animation:el-flow 1s linear infinite}
    @keyframes el-flow{to{stroke-dashoffset:-14}}
    .el-shimmer{animation:el-shimmer 3s ease-in-out infinite}
    @keyframes el-shimmer{50%{opacity:.4}}
    .el-spin{animation:el-spin 6s linear infinite}
    @keyframes el-spin{to{transform:rotate(360deg)}}
    .el-waddle{transform-origin:0 122px;animation:el-waddle .9s ease-in-out infinite alternate}
    @keyframes el-waddle{from{transform:rotate(-3deg) translateY(0)}to{transform:rotate(3deg) translateY(-2px)}}
    .el-stepL{animation:el-step .9s ease-in-out infinite alternate}
    .el-stepR{animation:el-step .9s ease-in-out infinite alternate-reverse}
    @keyframes el-step{from{transform:translateY(0)}to{transform:translateY(-7px)}}`;
}

module.exports = { elephant, mascotDefs, mascotCss, C };
