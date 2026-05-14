export type PrayerStatus = 'locked' | 'unlocked' | 'current' | 'complete';
export type ServiceId = 'shacharit' | 'mincha' | 'maariv';

export interface CurriculumItem {
  id: string;
  stage: number;
  en: string;
  he: string;
  note: string;
  mins: string;
  status: PrayerStatus;
  accuracy?: number;
  sessions?: number;
  speed_level?: number;
}

export interface AllServicesCurriculum {
  shacharit: CurriculumItem[];
  mincha: CurriculumItem[];
  maariv: CurriculumItem[];
}

export type ExerciseType = 'word_tap' | 'chunk_read_along' | 'word_order' | 'speed_read';

export interface ExerciseObject {
  id: string;
  type: ExerciseType;
  payload: Record<string, unknown>;
}

export interface SessionResult {
  prayer_id: string;
  accuracy: number;
  passed: boolean;
  next_prayer_id: string | null;
  speed_level: number;
  sessions_done: number;
}

export interface ProgressSummary {
  prayers_complete: number;
  day_streak: number;
  avg_accuracy: number;
  current_prayer_id: string | null;
  speed_level: number;
}

export interface AllServicesProgress {
  shacharit: ProgressSummary;
  mincha: ProgressSummary;
  maariv: ProgressSummary;
  overall_streak: number;
}
