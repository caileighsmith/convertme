// Matches the Tetragrammaton and its common pointed/abbreviated forms
const DIVINE_NAME_RE = /יְהֹוָה|יְהוָה|יהוה|יְיָ|יי/g;

export function sanitizeForSpeech(text: string): string {
  return text.replace(DIVINE_NAME_RE, "אֲדֹנָי");
}

export function speak(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
  utt.lang = "he-IL";
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}
