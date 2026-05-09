export interface HebrewWord {
  word: string;
  transliteration: string;
  translation: string;
  root?: string;
}

export interface PrayerSection {
  ref: string;
  title: string;
  hebrew: string;
  english: string;
  words: HebrewWord[];
}

export interface ServiceSectionMeta {
  ref: string;
  title: string;
  is_rubric?: boolean;
  group?: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  hebrew_name: string;
  description: string;
  sections: ServiceSectionMeta[];
}

export interface WordDefinition {
  word: string;
  transliteration: string;
  definitions: string[];
}
