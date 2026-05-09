export interface Pattern {
  id: string;
  hebrew: string;
  transliteration: string;
  meaning: string;
  category: string;
  level: 1 | 2 | 3 | 4 | 5;
  appearsIn: string[];
  note?: string;
}

export const PATTERN_CATEGORIES = [
  'Core Words',
  'Blessing Formula',
  'Shema',
  'Amidah',
  'Kaddish',
  'Call & Response',
  'Shabbat',
  'Full Sections',
] as const;

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Words',
  2: 'Phrases',
  3: 'Sentences',
  4: 'Paragraphs',
  5: 'Full Sections',
};

export const PATTERNS: Pattern[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // LEVEL 1 — Single words and micro-phrases (1–4 words)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'shalom', level: 1,
    hebrew: 'שָׁלוֹם',
    transliteration: 'sha·LOM',
    meaning: 'Peace',
    category: 'Core Words',
    appearsIn: ['Amidah closing', 'Shalom Aleichem', 'Oseh Shalom'],
  },
  {
    id: 'kadosh', level: 1,
    hebrew: 'קָדוֹשׁ',
    transliteration: 'ka·DOSH',
    meaning: 'Holy',
    category: 'Core Words',
    appearsIn: ['Kedushah', 'Kiddush', 'Shabbat prayers'],
  },
  {
    id: 'baruch', level: 1,
    hebrew: 'בָּרוּךְ',
    transliteration: 'ba·RUCH',
    meaning: 'Blessed',
    category: 'Core Words',
    appearsIn: ['Every blessing', 'Kaddish', 'Barchu'],
  },
  {
    id: 'amen', level: 1,
    hebrew: 'אָמֵן',
    transliteration: 'a·MEN',
    meaning: 'So be it / Amen',
    category: 'Core Words',
    appearsIn: ['After every blessing', 'Kaddish responses'],
  },
  {
    id: 'halleluyah', level: 1,
    hebrew: 'הַלְלוּיָהּ',
    transliteration: 'ha·le·lu·YAH',
    meaning: 'Praise God',
    category: 'Core Words',
    appearsIn: ['Psalms 113–118', 'Hallel', 'Pesukei Dezimra'],
  },
  {
    id: 'adonai', level: 1,
    hebrew: 'יְהֹוָה',
    transliteration: 'Ado·NAI',
    meaning: "The Lord (God's name — read as Adonai)",
    category: 'Core Words',
    appearsIn: ['Every blessing', 'Throughout the siddur'],
    note: 'Written with four Hebrew letters (the Tetragrammaton) but always pronounced "Adonai" in prayer.',
  },
  {
    id: 'eloheinu', level: 1,
    hebrew: 'אֱלֹהֵינוּ',
    transliteration: 'E·lo·HEI·nu',
    meaning: 'Our God',
    category: 'Core Words',
    appearsIn: ['Every blessing', 'Shema', 'Amidah'],
  },
  {
    id: 'shabbat-shalom', level: 1,
    hebrew: 'שַׁבָּת שָׁלוֹם',
    transliteration: 'sha·BAT sha·LOM',
    meaning: 'Peaceful Sabbath',
    category: 'Shabbat',
    appearsIn: ['Shabbat greeting'],
  },
  {
    id: 'leolam-vaed-l1', level: 1,
    hebrew: 'לְעוֹלָם וָעֶד',
    transliteration: "le·O·lam VA·ed",
    meaning: 'Forever and ever',
    category: 'Core Words',
    appearsIn: ['Barchu response', 'Ashrei', 'Kedushah', 'Aleinu'],
  },
  {
    id: 'melech-haolam', level: 1,
    hebrew: 'מֶלֶךְ הָעוֹלָם',
    transliteration: 'ME·lech ha·O·lam',
    meaning: 'King of the universe',
    category: 'Blessing Formula',
    appearsIn: ['Every blessing after Baruch Atah Adonai'],
  },
  {
    id: 'oseh-shalom-l1', level: 1,
    hebrew: 'עֹשֶׂה שָׁלוֹם',
    transliteration: 'O·seh sha·LOM',
    meaning: 'He who makes peace',
    category: 'Amidah',
    appearsIn: ['End of Amidah', 'End of Kaddish'],
  },
  {
    id: 'ein-keloheinu', level: 1,
    hebrew: 'אֵין כֵּאלֹהֵינוּ',
    transliteration: 'ein ke·E·lo·HEI·nu',
    meaning: 'There is none like our God',
    category: 'Core Words',
    appearsIn: ['Ein Keloheinu — closing hymn of Shabbat Shacharit'],
  },
  {
    id: 'avinu-malkeinu-l1', level: 1,
    hebrew: 'אָבִינוּ מַלְכֵּנוּ',
    transliteration: 'a·VI·nu mal·KEI·nu',
    meaning: 'Our Father, our King',
    category: 'Amidah',
    appearsIn: ['Avinu Malkeinu prayer', 'High Holiday Amidah'],
  },
  {
    id: 'lechaim', level: 1,
    hebrew: 'לְחַיִּים',
    transliteration: 'le·CHA·yim',
    meaning: 'To life!',
    category: 'Core Words',
    appearsIn: ['Kiddush toast', 'Zemirot'],
  },
  {
    id: 'todah-rabah', level: 1,
    hebrew: 'תּוֹדָה רַבָּה',
    transliteration: 'to·DAH ra·BAH',
    meaning: 'Thank you very much',
    category: 'Core Words',
    appearsIn: ['Modim blessing (same root: todah = thanks)'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LEVEL 2 — Standard phrases (5–12 words)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'baruch-atah', level: 2,
    hebrew: 'בָּרוּךְ אַתָּה יְהֹוָה',
    transliteration: 'ba·RUCH a·TAH Ado·NAI',
    meaning: 'Blessed are You, Lord',
    category: 'Blessing Formula',
    appearsIn: ['Every blessing', 'Amidah (×19)', 'Kiddush', 'Havdalah'],
  },
  {
    id: 'baruch-atah-full', level: 2,
    hebrew: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם',
    transliteration: 'ba·RUCH a·TAH Ado·NAI E·lo·HEI·nu ME·lech ha·O·lam',
    meaning: 'Blessed are You, Lord our God, King of the universe',
    category: 'Blessing Formula',
    appearsIn: ['Opening of every blessing'],
  },
  {
    id: 'shema-yisrael', level: 2,
    hebrew: 'שְׁמַע יִשְׂרָאֵל יְהֹוָה אֱלֹהֵינוּ יְהֹוָה אֶחָד',
    transliteration: 'SHE·ma yis·ra·EL Ado·NAI E·lo·HEI·nu Ado·NAI E·CHAD',
    meaning: 'Hear O Israel, the Lord our God, the Lord is One',
    category: 'Shema',
    appearsIn: ['Shema (morning & evening)', 'Bedtime Shema', 'On the deathbed'],
  },
  {
    id: 'baruch-shem', level: 2,
    hebrew: 'בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד',
    transliteration: 'ba·RUCH shem ke·VOD mal·chu·TO le·o·lam VA·ed',
    meaning: 'Blessed is the name of His glorious kingdom forever and ever',
    category: 'Shema',
    appearsIn: ['Whispered after the first verse of Shema'],
    note: 'Said quietly — this line is not in the Torah but added by tradition.',
  },
  {
    id: 'yitgadal', level: 2,
    hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
    transliteration: 'yit·ga·DAL ve·yit·ka·DASH she·MEI ra·BA',
    meaning: 'Magnified and sanctified is His great name',
    category: 'Kaddish',
    appearsIn: ['Opening of every Kaddish'],
  },
  {
    id: 'yehei-shemei', level: 2,
    hebrew: 'יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא',
    transliteration: 'ye·HEI she·MEI ra·BA me·va·RACH le·a·LAM ul·al·MEI al·ma·YA',
    meaning: 'May His great name be blessed forever and ever',
    category: 'Kaddish',
    appearsIn: ['Congregation response during Kaddish'],
  },
  {
    id: 'kadosh-kadosh', level: 2,
    hebrew: 'קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְהֹוָה צְבָאוֹת מְלֹא כָל הָאָרֶץ כְּבוֹדוֹ',
    transliteration: 'ka·DOSH ka·DOSH ka·DOSH Ado·NAI tze·va·OT me·LO chol ha·A·retz ke·vo·DO',
    meaning: 'Holy, holy, holy is the Lord of Hosts; the whole earth is full of His glory',
    category: 'Amidah',
    appearsIn: ['Kedushah (Isaiah 6:3)'],
  },
  {
    id: 'adonai-sefatai', level: 2,
    hebrew: 'אֲדֹנָי שְׂפָתַי תִּפְתָּח וּפִי יַגִּיד תְּהִלָּתֶֽךָ',
    transliteration: 'Ado·NAI se·fa·TAI tif·TACH u·FI ya·GID te·hi·la·TE·cha',
    meaning: 'Lord, open my lips, and my mouth will declare Your praise',
    category: 'Amidah',
    appearsIn: ['Verse before every Amidah (Psalm 51:17)'],
  },
  {
    id: 'barchu-call', level: 2,
    hebrew: 'בָּרְכוּ אֶת יְהֹוָה הַמְבֹרָךְ',
    transliteration: 'bar·CHU et Ado·NAI ha·me·vo·RACH',
    meaning: 'Bless the Lord who is blessed',
    category: 'Call & Response',
    appearsIn: ["Barchu — chazzan's call at Shacharit and Maariv"],
  },
  {
    id: 'barchu-response', level: 2,
    hebrew: 'בָּרוּךְ יְהֹוָה הַמְבֹרָךְ לְעוֹלָם וָעֶד',
    transliteration: 'ba·RUCH Ado·NAI ha·me·vo·RACH le·o·lam VA·ed',
    meaning: 'Blessed is the Lord who is blessed forever and ever',
    category: 'Call & Response',
    appearsIn: ['Barchu — congregation response'],
  },
  {
    id: 'ashrei-opening', level: 2,
    hebrew: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶֽךָ עוֹד יְהַלְלֽוּךָ סֶּֽלָה',
    transliteration: 'ash·REI yosh·VEI vei·TE·cha od ye·ha·le·LU·cha SE·lah',
    meaning: 'Happy are those who dwell in Your house — they will praise You forever',
    category: 'Amidah',
    appearsIn: ['Opening verse of Ashrei (Psalm 84:5)'],
  },
  {
    id: 'lecha-dodi', level: 2,
    hebrew: 'לְכָה דוֹדִי לִקְרַאת כַּלָּה פְּנֵי שַׁבָּת נְקַבְּלָה',
    transliteration: 'le·CHA do·DI lik·RAT ka·LAH pe·NEI sha·BAT ne·ka·be·LAH',
    meaning: 'Come, my beloved, to greet the bride — let us welcome the face of Shabbat',
    category: 'Shabbat',
    appearsIn: ['Lecha Dodi refrain — Kabbalat Shabbat'],
  },
  {
    id: 'oseh-shalom-full', level: 2,
    hebrew: 'עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל',
    transliteration: 'O·seh sha·LOM bim·ro·MAV hu ya·a·SEH sha·LOM a·LEI·nu ve·al kol yis·ra·EL',
    meaning: 'He who makes peace in His heights — may He bring peace upon us and all Israel',
    category: 'Amidah',
    appearsIn: ['Closing of Amidah', 'Closing of Kaddish'],
  },
  {
    id: 'aleinu-opening', level: 2,
    hebrew: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל',
    transliteration: 'a·LEI·nu le·sha·BEI·ach la·a·DON ha·KOL',
    meaning: 'It is upon us to praise the Master of all',
    category: 'Call & Response',
    appearsIn: ['Opening of Aleinu'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LEVEL 3 — Full sentences (12–25 words)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'modim-sentence', level: 3,
    hebrew: 'מוֹדִים אֲנַחְנוּ לָךְ שָׁאַתָּה הוּא יְהֹוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד',
    transliteration: 'mo·DIM a·NACH·nu LACH she·a·TAH hu Ado·NAI E·lo·HEI·nu ve·lo·HEI a·vo·TEI·nu le·o·lam VA·ed',
    meaning: 'We give thanks to You, for You are the Lord our God and God of our ancestors forever',
    category: 'Amidah',
    appearsIn: ['Opening of Modim blessing — 17th blessing of Amidah'],
  },
  {
    id: 've-ahavta-verse', level: 3,
    hebrew: 'וְאָהַבְתָּ אֵת יְהֹוָה אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶֽךָ',
    transliteration: 've·a·HAV·ta et Ado·NAI E·lo·HE·cha be·CHOL le·va·VE·cha u·ve·CHOL naf·she·CHA u·ve·CHOL me·o·DE·cha',
    meaning: 'You shall love the Lord your God with all your heart, with all your soul, and with all your might',
    category: 'Shema',
    appearsIn: ['Ve\'ahavta (Deuteronomy 6:5) — second verse of Shema section'],
  },
  {
    id: 'aleinu-full-first', level: 3,
    hebrew: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת',
    transliteration: 'a·LEI·nu le·sha·BEI·ach la·a·DON ha·KOL la·TET ge·du·LAH le·yo·TZER be·rei·SHIT she·LO a·SA·nu ke·go·YEI ha·a·ra·TZOT',
    meaning: 'It is upon us to praise the Master of all, to ascribe greatness to the Creator of the beginning, for He has not made us like the nations of the lands',
    category: 'Call & Response',
    appearsIn: ['Aleinu — first sentence'],
  },
  {
    id: 'kaddish-opening-full', level: 3,
    hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ וְיַמְלִיךְ מַלְכוּתֵהּ',
    transliteration: 'yit·ga·DAL ve·yit·ka·DASH she·MEI ra·BA be·al·MA di ve·RA chir·u·TEH ve·yam·LICH mal·chu·TEH',
    meaning: 'Magnified and sanctified is His great name, in the world that He created according to His will, and may He establish His kingdom',
    category: 'Kaddish',
    appearsIn: ['Opening two phrases of every Kaddish'],
  },
  {
    id: 'avot-opening', level: 3,
    hebrew: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב',
    transliteration: 'ba·RUCH a·TAH Ado·NAI E·lo·HEI·nu ve·lo·HEI a·vo·TEI·nu E·lo·HEI av·ra·HAM E·lo·HEI yitz·CHAK ve·lo·HEI ya·a·KOV',
    meaning: 'Blessed are You, Lord our God and God of our ancestors — God of Abraham, God of Isaac, and God of Jacob',
    category: 'Amidah',
    appearsIn: ['First sentence of the Amidah — Avot blessing'],
  },
  {
    id: 'gevurot-opening', level: 3,
    hebrew: 'אַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ',
    transliteration: 'a·TAH gi·BOR le·o·LAM Ado·NAI me·cha·YEH mei·TIM a·TAH RAV le·ho·SHI·a',
    meaning: 'You are eternally mighty, Lord; You resurrect the dead, You are abundantly able to save',
    category: 'Amidah',
    appearsIn: ['Opening of Gevurot — second blessing of Amidah'],
  },
  {
    id: 'kedushah-full-response', level: 3,
    hebrew: 'נְקַדֵּשׁ אֶת שִׁמְךָ בָּעוֹלָם כְּשֵׁם שֶׁמַּקְדִּישִׁים אוֹתוֹ בִּשְׁמֵי מָרוֹם כַּכָּתוּב עַל יַד נְבִיאֶֽךָ',
    transliteration: 'ne·ka·DESH et shim·CHA ba·o·LAM ke·SHEM she·mak·di·SHIM o·TO bish·MEI ma·ROM ka·ka·TUV al yad ne·vi·E·cha',
    meaning: 'We will sanctify Your name in the world, as they sanctify it in the heavens above, as written by Your prophet',
    category: 'Amidah',
    appearsIn: ['Introduction to Kedushah — leader\'s declaration before the triple Kadosh'],
  },
  {
    id: 'shabbat-kiddush-opening', level: 3,
    hebrew: 'וַיְהִי עֶרֶב וַיְהִי בֹקֶר יוֹם הַשִּׁשִּׁי. וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל צְבָאָם',
    transliteration: 'va·ye·HI E·rev va·ye·HI VO·ker yom ha·shi·SHI va·ye·CHU·lu ha·sha·MA·yim ve·ha·A·retz ve·CHOL tze·va·AM',
    meaning: 'And there was evening and morning — the sixth day. The heavens and earth and all their hosts were completed',
    category: 'Shabbat',
    appearsIn: ['Friday night Kiddush — from Genesis 1:31–2:1'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LEVEL 4 — Paragraphs (25–60 words)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'shema-with-baruch-shem', level: 4,
    hebrew: 'שְׁמַע יִשְׂרָאֵל יְהֹוָה אֱלֹהֵינוּ יְהֹוָה אֶחָד. בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד. וְאָהַבְתָּ אֵת יְהֹוָה אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶֽךָ.',
    transliteration: 'SHE·ma yis·ra·EL Ado·NAI E·lo·HEI·nu Ado·NAI E·CHAD. ba·RUCH shem ke·VOD mal·chu·TO le·o·lam VA·ed. ve·a·HAV·ta et Ado·NAI E·lo·HE·cha be·CHOL le·va·VE·cha u·ve·CHOL naf·she·CHA u·ve·CHOL me·o·DE·cha.',
    meaning: 'Hear O Israel, the Lord is our God, the Lord is One. Blessed is the name of His glorious kingdom forever. And you shall love the Lord your God with all your heart, soul, and might.',
    category: 'Shema',
    appearsIn: ['First three verses of the Shema section'],
    note: 'The foundation of Jewish prayer — said morning and evening. The first verse is the most essential line a worshipper must know.',
  },
  {
    id: 'avot-closing', level: 4,
    hebrew: 'הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְהֹוָה, מָגֵן אַבְרָהָם.',
    transliteration: 'ha·EL ha·ga·DOL ha·gi·BOR ve·ha·no·RA El el·YON go·MEL cha·sa·DIM to·VIM ve·KO·neh ha·KOL ve·zo·CHER chas·DEI a·VOT u·mei·VI go·EL liv·NEI ve·nei·HEM le·ma·AN she·MO be·a·ha·VAH. ME·lech o·ZER u·mo·SHI·a u·ma·GEN. ba·RUCH a·TAH Ado·NAI ma·GEN av·ra·HAM.',
    meaning: 'The great, mighty, and awesome God, God Most High, who bestows good kindnesses, who possesses all, who remembers the kindnesses of the ancestors and brings a redeemer to their descendants for the sake of His name with love. King, Helper, Savior, and Shield. Blessed are You, Lord, Shield of Abraham.',
    category: 'Amidah',
    appearsIn: ['Second half of Avot — first Amidah blessing'],
    note: 'The closing formula of the Avot blessing. "Magein Avraham" (Shield of Abraham) is the name of this blessing.',
  },
  {
    id: 'gevurot-paragraph', level: 4,
    hebrew: 'מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה.',
    transliteration: 'me·chal·KEL cha·YIM be·CHE·sed me·cha·YEH mei·TIM be·ra·cha·MIM ra·BIM so·MECH no·fe·LIM ve·ro·FEI cho·LIM u·ma·TIR a·su·RIM u·me·ka·YEM e·mu·na·TO li·shei·NEI a·FAR. mi cha·MO·cha ba·AL ge·vu·ROT u·mi do·MEH LACH ME·lech me·MIT u·me·cha·YEH u·matz·MI·ach ye·shu·AH.',
    meaning: 'He sustains the living with kindness, resuscitates the dead with great mercy, supports the fallen, heals the sick, releases the bound, and fulfills His trust to those who sleep in the dust. Who is like You, Master of mighty acts? Who can compare to You, King who puts to death and restores life and causes salvation to sprout?',
    category: 'Amidah',
    appearsIn: ['Middle section of Gevurot — second Amidah blessing'],
  },
  {
    id: 'kaddish-paragraph', level: 4,
    hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ, בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכָל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן. יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.',
    transliteration: 'yit·ga·DAL ve·yit·ka·DASH she·MEI ra·BA be·al·MA di ve·RA chir·u·TEH ve·yam·LICH mal·chu·TEH be·cha·yei·CHON u·ve·yo·mei·CHON u·ve·cha·YEI de·CHOL beit yis·ra·EL ba·a·ga·LA u·viz·MAN ka·RIV ve·im·RU a·MEN. ye·HEI she·MEI ra·BA me·va·RACH le·a·LAM ul·al·MEI al·ma·YA.',
    meaning: 'Magnified and sanctified is His great name, in the world that He created according to His will, and may He establish His kingdom in your lifetimes and in your days and in the lifetimes of all the house of Israel, swiftly and soon — and say Amen. May His great name be blessed forever and ever.',
    category: 'Kaddish',
    appearsIn: ['First two paragraphs of Kaddish (the part the congregation responds to)'],
    note: 'The congregation responds "Amen" and "Yehei Shemei Raba" after the chazzan says these lines.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LEVEL 5 — Complete sections (60+ words)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'avot-complete', level: 5,
    hebrew: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת, וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם, לְמַעַן שְׁמוֹ בְּאַהֲבָה. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְהֹוָה, מָגֵן אַבְרָהָם.',
    transliteration: 'ba·RUCH a·TAH Ado·NAI E·lo·HEI·nu ve·lo·HEI a·vo·TEI·nu E·lo·HEI av·ra·HAM E·lo·HEI yitz·CHAK ve·lo·HEI ya·a·KOV ha·EL ha·ga·DOL ha·gi·BOR ve·ha·no·RA El el·YON go·MEL cha·sa·DIM to·VIM ve·KO·neh ha·KOL ve·zo·CHER chas·DEI a·VOT u·mei·VI go·EL liv·NEI ve·nei·HEM le·ma·AN she·MO be·a·ha·VAH ME·lech o·ZER u·mo·SHI·a u·ma·GEN ba·RUCH a·TAH Ado·NAI ma·GEN av·ra·HAM',
    meaning: 'Blessed are You, Lord our God and God of our ancestors — God of Abraham, God of Isaac, and God of Jacob. The great, mighty, and awesome God, God Most High, who bestows good kindnesses, who possesses all, who remembers the kindnesses of the ancestors and brings a redeemer to their descendants for the sake of His name with love. King, Helper, Savior, and Shield. Blessed are You, Lord, Shield of Abraham.',
    category: 'Full Sections',
    appearsIn: ['Avot (Patriarchs) — 1st blessing of the Amidah'],
    note: 'The first of the 19 (or 18) Amidah blessings. Contains the central themes: God\'s relationship with the patriarchs, His attributes, and His ongoing protection.',
  },
  {
    id: 'gevurot-complete', level: 5,
    hebrew: 'אַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוֹךָ בַּעַל גְּבוּרוֹת, וּמִי דּוֹמֶה לָּךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְהֹוָה, מְחַיֵּה הַמֵּתִים.',
    transliteration: 'a·TAH gi·BOR le·o·LAM Ado·NAI me·cha·YEH mei·TIM a·TAH RAV le·ho·SHI·a me·chal·KEL cha·YIM be·CHE·sed me·cha·YEH mei·TIM be·ra·cha·MIM ra·BIM so·MECH no·fe·LIM ve·ro·FEI cho·LIM u·ma·TIR a·su·RIM u·me·ka·YEM e·mu·na·TO li·shei·NEI a·FAR mi cha·MO·cha ba·AL ge·vu·ROT u·mi do·MEH LACH ME·lech me·MIT u·me·cha·YEH u·matz·MI·ach ye·shu·AH ve·ne·e·MAN a·TAH le·hach·a·YOT mei·TIM ba·RUCH a·TAH Ado·NAI me·cha·YEH ha·mei·TIM',
    meaning: 'You are eternally mighty, Lord; You resurrect the dead, You are abundantly able to save. He sustains the living with kindness, resuscitates the dead with great mercy, supports the fallen, heals the sick, releases the bound, and fulfills His trust to those who sleep in the dust. Who is like You, Master of mighty acts, who compares to You — King who puts to death and restores life and causes salvation to sprout? You are faithful to resurrect the dead. Blessed are You, Lord, who resurrects the dead.',
    category: 'Full Sections',
    appearsIn: ['Gevurot (Divine Might) — 2nd blessing of the Amidah'],
    note: 'The second Amidah blessing. Its theme is God\'s power over life and death. In Ashkenazi tradition the phrase "Mechayeh Hameitim" (resurrects the dead) is repeated as the closing.',
  },
  {
    id: 'kaddish-complete', level: 5,
    hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ, בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכָל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן. יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא. יִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא, לְעֵלָּא מִן כָּל בִּרְכָתָא וְשִׁירָתָא תֻּשְׁבְּחָתָא וְנֶחֱמָתָא דַּאֲמִירָן בְּעָלְמָא, וְאִמְרוּ אָמֵן. עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל, וְאִמְרוּ אָמֵן.',
    transliteration: 'yit·ga·DAL ve·yit·ka·DASH she·MEI ra·BA be·al·MA di ve·RA chir·u·TEH ve·yam·LICH mal·chu·TEH be·cha·yei·CHON u·ve·yo·mei·CHON u·ve·cha·YEI de·CHOL beit yis·ra·EL ba·a·ga·LA u·viz·MAN ka·RIV ve·im·RU a·MEN ye·HEI she·MEI ra·BA me·va·RACH le·a·LAM ul·al·MEI al·ma·YA yit·ba·RACH ve·yish·ta·BACH ve·yit·pa·AR ve·yit·ro·MAM ve·yit·na·SE ve·yit·ha·DAR ve·yit·a·LEH ve·yit·ha·LAL she·MEI de·kud·SHA be·RICH HU le·ei·LA min KOL bir·cha·TA ve·shi·ra·TA tush·be·cha·TA ve·ne·che·ma·TA da·a·mi·RAN be·al·MA ve·im·RU a·MEN o·SEH sha·LOM bim·ro·MAV hu ya·a·SEH sha·LOM a·LEI·nu ve·AL kol yis·ra·EL ve·im·RU a·MEN',
    meaning: 'Magnified and sanctified is His great name in the world He created... May His great name be blessed forever... Blessed, praised, glorified, exalted, extolled, mighty, upraised, and lauded be the name of the Holy Blessed One, beyond all blessings, songs, praises, and consolations... May He who makes peace in His heights bring peace upon us and all Israel, and say Amen.',
    category: 'Full Sections',
    appearsIn: ["Mourner's Kaddish — said at every service by mourners"],
    note: 'Said in Aramaic, not Hebrew. This prayer never mentions death — it is a declaration of God\'s greatness. The congregation responds with "Amen" and "Yehei Shemei Raba" at marked pauses.',
  },
  {
    id: 'aleinu-complete', level: 5,
    hebrew: 'עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה, שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגֹרָלֵנוּ כְּכָל הֲמוֹנָם. וַאֲנַחְנוּ כֹּרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים הַקָּדוֹשׁ בָּרוּךְ הוּא. לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי, וְכָל בְּנֵי בָשָׂר יִקְרְאוּ בִשְׁמֶֽךָ. יְהֹוָה יִמְלֹךְ לְעֹלָם וָעֶד.',
    transliteration: 'a·LEI·nu le·sha·BEI·ach la·a·DON ha·KOL la·TET ge·du·LAH le·yo·TZER be·rei·SHIT she·LO a·SA·nu ke·go·YEI ha·a·ra·TZOT ve·LO sa·MA·nu ke·mish·pe·CHOT ha·a·da·MAH she·LO SAM chel·KEI·nu ka·HEM ve·go·ra·LEI·nu ke·CHOL ha·mo·NAM va·a·NACH·nu kor·IM u·mish·ta·cha·VIM u·mo·DIM lif·NEI ME·lech mal·chei ha·me·la·CHIM ha·ka·DOSH ba·RUCH HU le·ta·KEN o·LAM be·mal·CHUT sha·DAI ve·CHOL be·NEI va·SAR yik·RE·u vish·ME·cha Ado·NAI yim·LOCH le·o·LAM VA·ed',
    meaning: 'It is upon us to praise the Master of all, to ascribe greatness to the Creator of the beginning, for He has not made us like the nations... and we bow, prostrate, and give thanks before the King of kings, the Holy Blessed One... to repair the world under God\'s sovereignty, and all humanity will call upon Your name. The Lord will reign forever and ever.',
    category: 'Full Sections',
    appearsIn: ['Aleinu — closing prayer of every service'],
    note: 'The concluding prayer of Shacharit, Mincha, and Maariv. The phrase "לְתַקֵּן עוֹלָם" (Letakein Olam — to repair the world) is the origin of the concept of Tikkun Olam.',
  },
  {
    id: 've-ahavta-paragraph', level: 5,
    hebrew: 'וְאָהַבְתָּ אֵת יְהֹוָה אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶֽךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶֽךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם, בְּשִׁבְתְּךָ בְּבֵיתֶֽךָ וּבְלֶכְתְּךָ בַדֶּֽרֶךְ, וּבְשָׁכְבְּךָ וּבְקוּמֶֽךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶֽךָ, וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֶֽיךָ. וּכְתַבְתָּם עַל מְזוּזֹת בֵּיתֶֽךָ וּבִשְׁעָרֶֽיךָ.',
    transliteration: 've·a·HAV·ta et Ado·NAI E·lo·HE·cha be·CHOL le·va·VE·cha u·ve·CHOL naf·she·CHA u·ve·CHOL me·o·DE·cha ve·ha·YU ha·de·va·RIM ha·EI·leh a·SHER a·no·CHI me·tzav·ve·CHA ha·YOM al le·va·VE·cha ve·shi·NAN·tam le·va·NE·cha ve·di·BAR·ta BAM be·shiv·te·CHA be·vei·TE·cha u·ve·lech·te·CHA va·DE·rech u·ve·shoch·be·CHA u·ve·ku·ME·cha u·ke·shar·TAM le·OT al ya·DE·cha ve·ha·YU le·to·ta·FOT bein ei·NE·cha u·che·tav·TAM al me·zu·ZOT bei·TE·cha u·vish·a·RE·cha',
    meaning: 'You shall love the Lord your God with all your heart, soul, and might. These words that I command you today shall be upon your heart. Teach them diligently to your children and speak of them when you sit at home and when you walk on the way, when you lie down and when you rise. Bind them as a sign on your hand and let them be frontlets between your eyes. Write them on the doorposts of your house and on your gates.',
    category: 'Full Sections',
    appearsIn: ['Ve\'ahavta (Deuteronomy 6:5–9) — the paragraph immediately following the Shema verse'],
    note: 'This passage is the basis for tefillin (phylacteries) and mezuzah. It is said morning and evening as part of the Shema section.',
  },
];
