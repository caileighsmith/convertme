export interface LocationInfo {
  cityName: string;
  shabbatText: string; // e.g. "Shabbat begins Fri 7:42pm"
}

async function getCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000 }
    );
  });
}

async function fetchCityName(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return "";
  const data = await res.json();
  const addr = data.address ?? {};
  const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "";
  const region = addr.state ?? addr.country ?? "";
  return city && region ? `${city}, ${region}` : city || region;
}

async function fetchShabbatText(lat: number, lon: number): Promise<string> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const res = await fetch(
    `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(tz)}&m=50`
  );
  if (!res.ok) return "";
  const data = await res.json();
  const candle = (data.items ?? []).find((i: { category: string }) => i.category === "candle-lighting");
  if (!candle) return "";

  const date = new Date(candle.date);
  const day = date.toLocaleDateString("en-US", { weekday: "short" }); // "Fri"
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(" AM", "am").replace(" PM", "pm").replace(":00", "");
  return `Shabbat begins ${day} ${time}`;
}

export async function fetchLocationInfo(): Promise<LocationInfo | null> {
  try {
    const { lat, lon } = await getCoords();
    const [cityName, shabbatText] = await Promise.all([
      fetchCityName(lat, lon),
      fetchShabbatText(lat, lon),
    ]);
    return { cityName, shabbatText };
  } catch {
    return null;
  }
}
