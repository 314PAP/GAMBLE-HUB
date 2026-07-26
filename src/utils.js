const ONES = ['', 'un', 'duo', 'tre', 'quattuor', 'quinque', 'sex', 'septem', 'octo', 'novem'];
const DECADES = ['', '', 'vigint', 'trigint', 'quadragint', 'quinquagint', 'sexagint', 'septuagint', 'octogint', 'nonagint'];

const ILLION = {
  1:'Milion',2:'Bilion',3:'Trilion',4:'Kvadrilion',5:'Kvintilion',
  6:'Sextilion',7:'Septilion',8:'Oktilion',9:'Nonilion',10:'Desilion',
  11:'Undecilion',12:'Duodecilion',13:'Tredecilion',14:'Quattuordecilion',
  15:'Quindecilion',16:'Sedecilion',17:'Septendecilion',18:'Octodecilion',
  19:'Novemdecilion',20:'Vigintilion',
};

function compoundIllion(n) {
  const ones = n % 10;
  const tens = Math.floor(n / 10);
  if (tens < 2) return ILLION[n] || (n + '. illion');
  const name = ONES[ones] + DECADES[tens] + 'ilion';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function illionName(n) {
  if (n <= 20) return ILLION[n] || ('Illion ' + n);
  return compoundIllion(n);
}

function cleanName(name) {
  return name.replace(/[^a-zA-Z]/g, '');
}

function makeSymbol(n, arda) {
  const map = {
    5:'Kv', 6:'Sx', 7:'Sp', 8:'Ok', 9:'No', 10:'Ds', 11:'Ue', 12:'Dm',
    13:'Te', 14:'Qa', 15:'Qi', 16:'Se', 17:'Sn', 18:'Oc', 19:'Nm', 20:'Vg',
    21:'Uv', 22:'Df', 23:'Tr', 24:'Qp', 25:'Qz', 26:'Rh', 27:'Rs', 28:'Rx',
    29:'Rn', 30:'Tg', 31:'Uh', 32:'Dv', 33:'Tw', 34:'Qh', 35:'Qj', 36:'Sf',
     37:'Sr', 38:'S2', 39:'Nh', 40:'Qr', 41:'Uq', 42:'Dq', 43:'Tq', 44:'Qw',
     45:'Qe', 46:'Sg', 47:'St', 48:'Oq', 49:'Nq', 50:'Q5',
  };
  return (map[n] || ('L' + n)) + (arda ? 'd' : '');
}

// 9 pevných úrovní (tier 1–9)
const FIXED = [
  {v:1e3,  sym:'K',   name:'Tisíc',       zeros:3},
  {v:1e6,  sym:'M',   name:'Milion',      zeros:6},
  {v:1e9,  sym:'Mld', name:'Miliarda',    zeros:9},
  {v:1e12, sym:'B',   name:'Bilion',      zeros:12},
  {v:1e15, sym:'Bld', name:'Biliarda',    zeros:15},
  {v:1e18, sym:'T',   name:'Trilion',     zeros:18},
  {v:1e21, sym:'Td',  name:'Triliarda',   zeros:21},
  {v:1e24, sym:'Q',   name:'Kvadrilion',  zeros:24},
  {v:1e27, sym:'Qd',  name:'Kvadriliarda',zeros:27},
];

// 91 generovaných úrovní (tier 10–100)
const gen = [];
for (let tier = 10; tier <= 100; tier++) {
  const inum = Math.floor(tier / 2);
  const arda = tier % 2 === 1;
  gen.push({ v: Math.pow(10, tier * 3), sym: makeSymbol(inum, arda), name: illionName(inum) + (arda ? 'iorda' : 'ilion'), zeros: tier * 3 });
}

// Vzestupně: K (1e3) → Qd (1e27) → 1e300
const SFX = [...FIXED, ...gen].sort((a, b) => a.v - b.v);

export function formatLargeNumber(num) {
  if (num == null) return '0';
  const val = Number(num);
  if (isNaN(val)) return '0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  for (let i = SFX.length - 1; i >= 0; i--) {
    if (abs >= SFX[i].v) return sign + (abs / SFX[i].v).toFixed(3).replace(/\.?0+$/, '') + ' ' + SFX[i].sym;
  }
  return val.toString();
}

export function getAbbrevTableData() {
  return SFX;
}

export function parseSuffixes() {
  return SFX.map(s => ({ key: s.sym.toLowerCase(), val: s.v }));
}