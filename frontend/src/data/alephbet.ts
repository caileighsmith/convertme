export interface Letter {
  letter: string;
  finalForm?: string;
  name: string;
  hebrewName: string;
  sound: string;
  note?: string;
  example: { hebrew: string; transliteration: string; meaning: string };
}

export interface Vowel {
  symbol: string;
  displayOn: string; // letter + symbol for display
  name: string;
  hebrewName: string;
  sound: string;
  example: { hebrew: string; transliteration: string; meaning: string };
}

export const LETTERS: Letter[] = [
  {
    letter: 'א', name: 'Alef', hebrewName: 'אָלֶף', sound: 'silent',
    note: 'Carries vowels but has no sound of its own.',
    example: { hebrew: 'אָמֵן', transliteration: 'Amen', meaning: 'So be it' },
  },
  {
    letter: 'ב', name: 'Bet / Vet', hebrewName: 'בֵּית', sound: 'b / v',
    note: 'With dagesh dot (בּ): "b". Without: "v".',
    example: { hebrew: 'בָּרוּךְ', transliteration: 'Baruch', meaning: 'Blessed' },
  },
  {
    letter: 'ג', name: 'Gimel', hebrewName: 'גִּימֶל', sound: 'g',
    example: { hebrew: 'גָּדוֹל', transliteration: 'Gadol', meaning: 'Great' },
  },
  {
    letter: 'ד', name: 'Dalet', hebrewName: 'דָּלֶת', sound: 'd',
    example: { hebrew: 'דָּוִד', transliteration: 'Dovid', meaning: 'David' },
  },
  {
    letter: 'ה', name: 'He', hebrewName: 'הֵא', sound: 'h (silent at word end)',
    note: 'At the end of a word it is usually silent.',
    example: { hebrew: 'הַלְלוּיָהּ', transliteration: 'Halleluyah', meaning: 'Praise God' },
  },
  {
    letter: 'ו', name: 'Vav', hebrewName: 'וָו', sound: 'v / o / u',
    note: 'As consonant: "v". With holam dot (וֹ): "o". With dagesh (וּ): "u".',
    example: { hebrew: 'וְשָׁמַרְתָּ', transliteration: "Ve'shamarta", meaning: 'And you shall observe' },
  },
  {
    letter: 'ז', name: 'Zayin', hebrewName: 'זַיִן', sound: 'z',
    example: { hebrew: 'זְכֹר', transliteration: 'Zechor', meaning: 'Remember' },
  },
  {
    letter: 'ח', name: 'Chet', hebrewName: 'חֵית', sound: 'ch (guttural)',
    note: 'A deep guttural sound — like the "ch" in "Bach". Different from כ/ך.',
    example: { hebrew: 'חַי', transliteration: 'Chai', meaning: 'Life / Living' },
  },
  {
    letter: 'ט', name: 'Tet', hebrewName: 'טֵית', sound: 't',
    note: 'Sounds identical to ת in Ashkenazi pronunciation.',
    example: { hebrew: 'טוֹב', transliteration: 'Tov', meaning: 'Good' },
  },
  {
    letter: 'י', name: 'Yod', hebrewName: 'יוֹד', sound: 'y',
    note: 'The smallest letter. Also acts as a vowel helper (mater lectionis).',
    example: { hebrew: 'יִשְׂרָאֵל', transliteration: 'Yisrael', meaning: 'Israel' },
  },
  {
    letter: 'כ', finalForm: 'ך', name: 'Kaf / Chaf', hebrewName: 'כָּף', sound: 'k / ch',
    note: 'With dagesh (כּ): "k". Without: "ch" (lighter than ח). Final form ך at word end.',
    example: { hebrew: 'כָּבוֹד', transliteration: 'Kavod', meaning: 'Glory / Honor' },
  },
  {
    letter: 'ל', name: 'Lamed', hebrewName: 'לָמֶד', sound: 'l',
    example: { hebrew: 'לְעוֹלָם', transliteration: "Le'olam", meaning: 'Forever' },
  },
  {
    letter: 'מ', finalForm: 'ם', name: 'Mem', hebrewName: 'מֵם', sound: 'm',
    note: 'Final form ם (closed shape) appears at word end.',
    example: { hebrew: 'מֶלֶךְ', transliteration: 'Melech', meaning: 'King' },
  },
  {
    letter: 'נ', finalForm: 'ן', name: 'Nun', hebrewName: 'נוּן', sound: 'n',
    note: 'Final form ן (extended downward) appears at word end.',
    example: { hebrew: 'נֶאֱמָן', transliteration: "Ne'eman", meaning: 'Faithful / Trustworthy' },
  },
  {
    letter: 'ס', name: 'Samech', hebrewName: 'סָמֶךְ', sound: 's',
    note: 'Sounds identical to שׂ (sin) in Ashkenazi.',
    example: { hebrew: 'סֶלָה', transliteration: 'Selah', meaning: 'Forever / Pause (Psalms)' },
  },
  {
    letter: 'ע', name: 'Ayin', hebrewName: 'עַיִן', sound: 'silent (guttural)',
    note: 'Silent in Ashkenazi, like Alef. Some communities pronounce a soft guttural stop.',
    example: { hebrew: 'עָלֵינוּ', transliteration: 'Aleinu', meaning: 'It is upon us' },
  },
  {
    letter: 'פ', finalForm: 'ף', name: 'Pe / Fe', hebrewName: 'פֵּא', sound: 'p / f',
    note: 'With dagesh (פּ): "p". Without: "f". Final form ף at word end.',
    example: { hebrew: 'פֶּה', transliteration: 'Pe', meaning: 'Mouth' },
  },
  {
    letter: 'צ', finalForm: 'ץ', name: 'Tzadi', hebrewName: 'צָדִי', sound: 'tz',
    note: 'Final form ץ at word end.',
    example: { hebrew: 'צַדִּיק', transliteration: 'Tzaddik', meaning: 'Righteous person' },
  },
  {
    letter: 'ק', name: 'Qof', hebrewName: 'קוֹף', sound: 'k',
    note: 'Sounds identical to כּ (kaf with dagesh) in Ashkenazi.',
    example: { hebrew: 'קָדוֹשׁ', transliteration: 'Kadosh', meaning: 'Holy' },
  },
  {
    letter: 'ר', name: 'Resh', hebrewName: 'רֵישׁ', sound: 'r',
    example: { hebrew: 'רַחֲמִים', transliteration: 'Rachamim', meaning: 'Compassion / Mercy' },
  },
  {
    letter: 'שׁ', name: 'Shin / Sin', hebrewName: 'שִׁין', sound: 'sh / s',
    note: 'Right dot (שׁ): "sh". Left dot (שׂ): "s".',
    example: { hebrew: 'שָׁלוֹם', transliteration: 'Shalom', meaning: 'Peace' },
  },
  {
    letter: 'ת', name: 'Tav', hebrewName: 'תָּו', sound: 't / s (Ashkenazi)',
    note: 'With dagesh: "t". Without dagesh: "s" in Ashkenazi (Modern Hebrew: always "t").',
    example: { hebrew: 'תּוֹרָה', transliteration: 'Torah', meaning: 'Torah / Teaching' },
  },
];

export const VOWELS: Vowel[] = [
  {
    symbol: 'ָ', displayOn: 'בָ', name: 'Kamatz', hebrewName: 'קָמַץ', sound: 'o (Ashkenazi) / a (Modern)',
    note: 'In Ashkenazi: "o". In Modern Hebrew: "a".',
    example: { hebrew: 'שָׁלוֹם', transliteration: 'SHO-lom', meaning: 'Peace' },
  } as Vowel,
  {
    symbol: 'ַ', displayOn: 'בַ', name: 'Patach', hebrewName: 'פַּתַח', sound: 'a',
    example: { hebrew: 'אַתָּה', transliteration: 'A-tah', meaning: 'You' },
  } as Vowel,
  {
    symbol: 'ֵ', displayOn: 'בֵ', name: 'Tzere', hebrewName: 'צֵרֵי', sound: 'ei (Ashkenazi)',
    note: '"ei" as in "eight". In Modern Hebrew: "e".',
    example: { hebrew: 'אֵין', transliteration: 'Ein', meaning: 'There is no' },
  } as Vowel,
  {
    symbol: 'ֶ', displayOn: 'בֶ', name: 'Segol', hebrewName: 'סֶגּוֹל', sound: 'e',
    example: { hebrew: 'מֶלֶךְ', transliteration: 'Me-lech', meaning: 'King' },
  } as Vowel,
  {
    symbol: 'ִ', displayOn: 'בִ', name: 'Hiriq', hebrewName: 'חִרִיק', sound: 'i',
    example: { hebrew: 'כִּי', transliteration: 'Ki', meaning: 'Because / That' },
  } as Vowel,
  {
    symbol: 'ֹ', displayOn: 'בֹ', name: 'Holam', hebrewName: 'חֹלָם', sound: 'o',
    example: { hebrew: 'שָׁלוֹם', transliteration: 'Sha-LOM', meaning: 'Peace' },
  } as Vowel,
  {
    symbol: 'וּ', displayOn: 'בּוּ', name: 'Shuruk', hebrewName: 'שׁוּרֶק', sound: 'u',
    note: 'A dagesh inside vav (וּ) — not a dagesh in the consonant.',
    example: { hebrew: 'בָּרוּךְ', transliteration: 'Ba-RUCH', meaning: 'Blessed' },
  } as Vowel,
  {
    symbol: 'ְ', displayOn: 'בְ', name: 'Shva', hebrewName: 'שְׁוָא', sound: 'e at word start / silent elsewhere',
    note: 'At the start of a word: "e". Mid-word: usually silent (stop between syllables).',
    example: { hebrew: 'בְּרֵאשִׁית', transliteration: 'Be-rei-SHIT', meaning: 'In the beginning' },
  } as Vowel,
];
