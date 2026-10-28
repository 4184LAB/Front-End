import "server-only";
import { cacheLife } from "next/cache";

// 외부 API 응답은 몇 분 동안 캐시해 요청 횟수 제한에 걸리지 않게 합니다.
// 실패하면 예외를 던져 캐시에 남지 않도록 하고, 화면에서 오류 메시지로 처리합니다.

export const CITIES = {
  seoul: { name: "서울", lat: 37.5665, lon: 126.978 },
  busan: { name: "부산", lat: 35.1796, lon: 129.0756 },
  incheon: { name: "인천", lat: 37.4563, lon: 126.7052 },
  daegu: { name: "대구", lat: 35.8714, lon: 128.6014 },
  daejeon: { name: "대전", lat: 36.3504, lon: 127.3845 },
  gwangju: { name: "광주", lat: 35.1595, lon: 126.8526 },
  jeju: { name: "제주", lat: 33.4996, lon: 126.5312 },
} as const;

export type CityKey = keyof typeof CITIES;

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${new URL(url).host} 응답 오류 (${res.status})`);
  return res.json() as Promise<T>;
}

// ---- 날씨: Open-Meteo (https://open-meteo.com, API 키 불필요) ----

export type Weather = {
  current: { temperature: number; humidity: number; windSpeed: number; code: number };
  daily: { date: string; max: number; min: number; code: number }[];
};

export async function getWeather(city: CityKey): Promise<Weather> {
  "use cache";
  cacheLife("minutes");

  const { lat, lon } = CITIES[city];
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FSeoul&forecast_days=7";

  const data = await getJson<{
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
    };
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      weather_code: number[];
    };
  }>(url);

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      code: data.current.weather_code,
    },
    daily: data.daily.time.map((date, i) => ({
      date,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      code: data.daily.weather_code[i],
    })),
  };
}

export function describeWeather(code: number) {
  if (code === 0) return { label: "맑음", icon: "☀️" };
  if (code <= 2) return { label: "구름 조금", icon: "🌤️" };
  if (code === 3) return { label: "흐림", icon: "☁️" };
  if (code <= 48) return { label: "안개", icon: "🌫️" };
  if (code <= 57) return { label: "이슬비", icon: "🌦️" };
  if (code <= 67) return { label: "비", icon: "🌧️" };
  if (code <= 77) return { label: "눈", icon: "🌨️" };
  if (code <= 82) return { label: "소나기", icon: "🌧️" };
  if (code <= 86) return { label: "눈 소나기", icon: "🌨️" };
  return { label: "뇌우", icon: "⛈️" };
}

// ---- 환율: ExchangeRate-API 공개 엔드포인트 (https://www.exchangerate-api.com) ----

export const CURRENCIES = ["USD", "EUR", "JPY", "CNY", "GBP"] as const;

export async function getKrwRates() {
  "use cache";
  cacheLife("hours");

  const data = await getJson<{ result: string; time_last_update_utc: string; rates: Record<string, number> }>(
    "https://open.er-api.com/v6/latest/KRW",
  );
  if (data.result !== "success") throw new Error("환율 정보를 가져오지 못했습니다.");

  return {
    updatedAt: data.time_last_update_utc,
    // 1 외화당 원화 금액 (JPY는 100엔 기준)
    rates: CURRENCIES.map((code) => ({
      code,
      unit: code === "JPY" ? 100 : 1,
      krw: (code === "JPY" ? 100 : 1) / data.rates[code],
    })),
  };
}

// ---- GitHub 저장소 검색 (https://docs.github.com/rest/search) ----

export type Repo = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

export async function searchRepos(query: string): Promise<Repo[]> {
  "use cache";
  cacheLife("minutes");

  const data = await getJson<{ items: Repo[] }>(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=8`,
    { headers: { Accept: "application/vnd.github+json", "User-Agent": "nextjs-homepage" } },
  );
  return data.items;
}
