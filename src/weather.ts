export interface WeatherContext {
    city: string;
    temp: number;
    feelsLike: number;
    condition: string;
    description: string;
    isGoodOutdoor: boolean;
    emoji: string;
}

export async function getWeather(city: string): Promise<WeatherContext | null> {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`[weather] API returned ${res.status} for city: ${city}`);
            return null;
        }
        const data = await res.json() as any;

        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const condition = (data.weather[0].main as string).toLowerCase();
        const description = data.weather[0].description as string;

        const isGoodOutdoor =
            temp >= 10 && temp <= 32 &&
            !['rain', 'drizzle', 'thunderstorm', 'snow'].includes(condition);

        const emoji =
            condition === 'clear' ? '☀️' :
            condition === 'clouds' ? '☁️' :
            condition === 'rain' || condition === 'drizzle' ? '🌧️' :
            condition === 'thunderstorm' ? '⛈️' :
            condition === 'snow' ? '❄️' :
            condition === 'mist' || condition === 'fog' ? '🌫️' : '🌤️';

        console.log(`[weather] ${city}: ${temp}°C, ${description}`);

        return { city: data.name, temp, feelsLike, condition, description, isGoodOutdoor, emoji };
    } catch (err) {
        console.warn('[weather] Fetch failed:', (err as Error).message);
        return null;
    }
}

export function weatherSummary(w: WeatherContext): string {
    return `${w.emoji} ${w.temp}°C (feels like ${w.feelsLike}°C), ${w.description}`;
}
