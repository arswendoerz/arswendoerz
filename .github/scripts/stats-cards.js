// Draws the "GitHub stats" and "Top languages" cards from the GitHub REST API,
// so the README no longer depends on a third-party card service.
// Usage: node .github/scripts/stats-cards.js <username> <out-dir>
// Reads GITHUB_TOKEN when set; without it the public rate limit (60/h) applies.
// Counts cover public activity only: the workflow token cannot see private repos.
const fs = require('fs');
const path = require('path');

const [user = 'arswendoerz', outDir = 'out'] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;

const theme = {
  bg: '#13141F',
  border: '#1F2335',
  title: '#7AA2F7',
  text: '#C0CAF5',
  muted: '#737AA2',
  icon: '#5EEAD4',
  track: '#1F2335',
};
const font = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";

// Linguist colours for the languages likely to show up; anything else falls
// back to a theme colour.
const langColors = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399',
  SCSS: '#c6538c', PHP: '#4F5D95', Blade: '#f7523f', Python: '#3572A5',
  Java: '#b07219', Kotlin: '#A97BFF', Dart: '#00B4AB', Go: '#00ADD8',
  'C#': '#178600', 'C++': '#f34b7d', C: '#555555', Shell: '#89e051',
  Vue: '#41b883', Svelte: '#ff3e00', Astro: '#ff5a03', Ruby: '#701516',
  Swift: '#F05138', Rust: '#dea584', 'Jupyter Notebook': '#DA5B0B',
  Dockerfile: '#384d54', PowerShell: '#012456', Hack: '#878787', EJS: '#a91e50',
  MDX: '#fcb32c', Prisma: '#0c344b', SQL: '#e38c00', PLpgSQL: '#336790',
};
const fallback = ['#7AA2F7', '#5EEAD4', '#A78BFA', '#F7768E', '#E0AF68', '#9ECE6A'];

const api = async (url) => {
  const res = await fetch(`https://api.github.com${url}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'profile-stats-cards',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return res.json();
};

const searchCount = async (q, kind = 'issues') =>
  (await api(`/search/${kind}?q=${encodeURIComponent(q)}&per_page=1`)).total_count;

const ownedRepos = async () => {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await api(`/users/${user}/repos?type=owner&per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

// Octicons (16px)
const icons = {
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  commit: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  pr: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  issue: 'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z',
  people: 'M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z',
};

const W = 467;
const H = 195;

const frame = (width, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <style>
    .t { font: 400 14px ${font}; fill: ${theme.text}; }
    .v { font: 700 14px ${font}; fill: ${theme.text}; }
    .m { font: 400 11px ${font}; fill: ${theme.muted}; }
    .row { animation: in .5s ease-out backwards; }
    @keyframes in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .row { animation: none; } }
  </style>
  <rect x=".5" y=".5" width="${width - 1}" height="${H - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
${body}
</svg>
`;

const statsCard = (s) => {
  const rows = [
    ['star', 'Total stars earned', s.stars],
    ['commit', 'Total commits', s.commits],
    ['pr', 'Pull requests', s.prs],
    ['issue', 'Issues opened', s.issues],
    ['repo', 'Public repositories', s.repos],
    ['people', 'Followers', s.followers],
  ];
  const body = rows
    .map(([icon, label, value], i) => {
      const y = 24 + i * 25;
      return `  <g transform="translate(28 ${y})"><g class="row" style="animation-delay:${(i * 0.12).toFixed(2)}s">
    <path d="${icons[icon]}" fill="${theme.icon}"/>
    <text class="t" x="28" y="12.5">${esc(label)}:</text>
    <text class="v" x="210" y="12.5">${fmt(value)}</text>
  </g></g>`;
    })
    .join('\n');
  const note = `  <text class="m" x="${W - 22}" y="${H - 14}" text-anchor="end">public activity · updated ${s.date}</text>`;
  return frame(W, 'GitHub stats', `${body}\n${note}`);
};

const LW = 350;
const langsCard = (langs) => {
  const total = langs.reduce((sum, l) => sum + l.bytes, 0);
  const barW = LW - 50;
  let x = 0;
  const segments = langs
    .map((l) => {
      const w = (l.bytes / total) * barW;
      const seg = `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="8" fill="${l.color}"/>`;
      x += w;
      return seg;
    })
    .join('');
  const list = langs
    .map((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const pct = ((l.bytes / total) * 100).toFixed(2);
      return `  <g transform="translate(${25 + col * 155} ${70 + row * 26})"><g class="row" style="animation-delay:${(i * 0.1).toFixed(2)}s">
    <circle cx="5" cy="6" r="5" fill="${l.color}"/>
    <text class="t" x="16" y="10.5" style="font-size:12.5px">${esc(l.name)} <tspan fill="${theme.muted}">${pct}%</tspan></text>
  </g></g>`;
    })
    .join('\n');
  const body = `  <clipPath id="bar"><rect x="0" y="0" width="${barW}" height="8" rx="4"/></clipPath>
  <rect x="25" y="35" width="${barW}" height="8" rx="4" fill="${theme.track}"/>
  <g clip-path="url(#bar)" transform="translate(25 35)">${segments}</g>
${list}`;
  return frame(LW, 'Top languages', body);
};

(async () => {
  const profile = await api(`/users/${user}`);
  const repos = await ownedRepos();
  const sources = repos.filter((r) => !r.fork);

  const [commits, prs, issues] = await Promise.all([
    searchCount(`author:${user}`, 'commits'),
    searchCount(`author:${user} type:pr`),
    searchCount(`author:${user} type:issue`),
  ]);

  // Language share across the user's own (non-fork) repos, weighted by
  // sqrt(bytes) * sqrt(repos using it): one repo full of generated HTML
  // should not drown out languages used across many projects.
  const bytes = {};
  const used = {};
  for (const repo of sources) {
    const langs = await api(`/repos/${repo.full_name}/languages`);
    for (const [name, size] of Object.entries(langs)) {
      bytes[name] = (bytes[name] || 0) + size;
      used[name] = (used[name] || 0) + 1;
    }
  }
  const top = Object.keys(bytes)
    .map((name) => ({ name, bytes: Math.sqrt(bytes[name]) * Math.sqrt(used[name]) }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)
    .map((l, i) => ({ ...l, color: langColors[l.name] || fallback[i % fallback.length] }));

  const stats = {
    stars: sources.reduce((sum, r) => sum + r.stargazers_count, 0),
    commits,
    prs,
    issues,
    repos: profile.public_repos,
    followers: profile.followers,
    date: new Date().toISOString().slice(0, 10),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'stats.svg'), statsCard(stats));
  fs.writeFileSync(path.join(outDir, 'top-langs.svg'), langsCard(top));
  console.log('stats', stats);
  console.log('languages', top.map((l) => `${l.name} ${Math.round(l.bytes)}`).join(', '));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
