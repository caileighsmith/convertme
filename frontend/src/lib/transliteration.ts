// Nikud-aware Ashkenazi transliteration — mirrors the Python backend logic exactly.
//
// Ashkenazi rules applied:
//   kamats  (U+05B8) = 'o'  (Modern Hebrew = 'a')
//   tsere   (U+05B5) = 'ei' on sounding consonants / 'e' on silent ones (alef/ayin)
//   tav without dagesh = 's'
//   shva at word start = 'e' (vocal); elsewhere = '' (silent)
//   bare yod after holam/kamats  = 'y' (oy-diphthong, e.g. adonoy)
//   bare yod after patah/segol   = 'i' (ai-diphthong, e.g. chai)
//   bare yod after hiriq/tsere   = skip (already encoded in 'i'/'ei')

const BASE: Record<string, string> = {
  'א': '',   'ב': 'v',  'ג': 'g',  'ד': 'd',  'ה': 'h',
  'ו': 'v',  'ז': 'z',  'ח': 'ch', 'ט': 't',  'י': 'y',
  'כ': 'ch', 'ך': 'ch', 'ל': 'l',  'מ': 'm',  'ם': 'm',
  'נ': 'n',  'ן': 'n',  'ס': 's',  'ע': '',   'פ': 'f',
  'ף': 'f',  'צ': 'tz', 'ץ': 'tz', 'ק': 'k',  'ר': 'r',
  'ש': 'sh', 'ת': 's',
};

const WITH_DAGESH: Record<string, string> = {
  'ב': 'b', 'כ': 'k', 'ך': 'k', 'פ': 'p', 'ף': 'p', 'ת': 't',
};

const SHVA   = 'ְ'; const TSERE  = 'ֵ'; const HIRIQ  = 'ִ';
const DAGESH = 'ּ'; const SIN    = 'ׂ'; const HOLAM  = 'ֹ';

const VOWEL: Record<string, string> = {
  [SHVA]:   '',    'ֱ': 'e',  'ֲ': 'a',  'ֳ': 'o',
  [HIRIQ]:  'i',  [TSERE]:  'ei', 'ֶ': 'e',  'ַ': 'a',
  'ָ': 'o',  [HOLAM]:  'o',  'ֺ': 'o',  'ֻ': 'u',  'ׇ': 'o',
};

// Nikud that produce 'o/u' sounds → bare yod after = 'y' (oy-diphthong)
const O_SOUNDS = new Set(['ָ', 'ֹ', 'ֺ', 'ֻ', 'ׇ', 'ֳ']);
// Nikud that produce 'a/e' sounds → bare yod after = 'i' (ai-diphthong)
const A_SOUNDS = new Set(['ַ', 'ֲ', 'ֶ', 'ֱ']);

const isConsonant = (cp: number) => cp >= 0x05D0 && cp <= 0x05EA;
const isDiacritic = (cp: number) => cp >= 0x0591 && cp <= 0x05C7;

export function transliterateAshkenazi(word: string): string {
  const stripped = word.replace(/[֑-ׇ]/g, '');
  if (stripped === 'יהוה' || stripped === 'יי') return 'Adonai';

  const chars = Array.from(word);
  const n = chars.length;
  const out: string[] = [];
  let i = 0;
  let prevNikud: string | null = null;

  while (i < n) {
    const ch = chars[i];
    const cp = ch.codePointAt(0) ?? 0;

    if (!isConsonant(cp)) { i++; continue; }

    let j = i + 1;
    const mods: string[] = [];
    while (j < n && isDiacritic(chars[j].codePointAt(0) ?? 0)) {
      mods.push(chars[j++]);
    }

    const hasDagesh = mods.includes(DAGESH);
    const hasSin = mods.includes(SIN);
    const hasHolam = mods.includes(HOLAM);

    // Bare yod: mater or diphthong semi-vowel
    if (ch === 'י' && mods.length === 0) {
      if (prevNikud === HIRIQ || prevNikud === TSERE) {
        // mater lectionis — skip
      } else if (prevNikud && O_SOUNDS.has(prevNikud)) {
        out.push('y');   // oy-diphthong
      } else if (prevNikud && A_SOUNDS.has(prevNikud)) {
        out.push('i');   // ai-diphthong
      } else {
        out.push('y');   // default semi-vowel
      }
      i = j; continue;
    }

    // Consonant phoneme
    let cons: string;
    if (ch === 'ש') {
      cons = hasSin ? 's' : 'sh';
    } else if (ch === 'ו') {
      if (hasHolam) { out.push('o'); prevNikud = HOLAM; i = j; continue; }
      if (hasDagesh) { out.push('u'); prevNikud = DAGESH; i = j; continue; }
      cons = 'v';
    } else if (hasDagesh && WITH_DAGESH[ch] !== undefined) {
      cons = WITH_DAGESH[ch];
    } else {
      cons = BASE[ch] ?? '';
    }

    // Vowel phoneme
    const nikud = mods.find((m) => m in VOWEL) ?? null;
    let vowel: string;
    if (nikud === null) {
      vowel = '';
    } else if (nikud === SHVA) {
      vowel = out.length === 0 ? 'e' : '';   // vocal at word start only
    } else if (nikud === TSERE) {
      vowel = cons === '' ? 'e' : 'ei';       // 'e' on silent consonants
    } else {
      vowel = VOWEL[nikud];
    }

    prevNikud = nikud;
    out.push(cons + vowel);
    i = j;
  }

  return out.join('') || word;
}

export function stripNikud(word: string): string {
  return word.replace(/[֑-ׇ]/g, '');
}
