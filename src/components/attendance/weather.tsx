'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Thermometer, Sunrise, Sunset } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface WeatherData {
    current: {
        temp: number;
        code: number;
        is_day: boolean;
    };
    daily: {
        time: string[];
        maxTemp: number[];
        minTemp: number[];
        code: number[];
        sunrise: string[];
        sunset: string[];
    };
}

export function Weather() {
    const [weather, setWeather] = useState<WeatherData | null>(null)

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Uhersky Brod coordinates with daily forecast and sunrise/sunset
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.995&longitude=17.65&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe%2FBerlin')
                const data = await res.json()
                if (data.current_weather && data.daily) {
                    setWeather({
                        current: {
                            temp: Math.round(data.current_weather.temperature),
                            code: data.current_weather.weathercode,
                            is_day: data.current_weather.is_day === 1
                        },
                        daily: {
                            time: data.daily.time,
                            maxTemp: data.daily.temperature_2m_max,
                            minTemp: data.daily.temperature_2m_min,
                            code: data.daily.weathercode,
                            sunrise: data.daily.sunrise,
                            sunset: data.daily.sunset,
                        }
                    })
                }
            } catch (error) {
                console.error('Weather fetch error:', error)
            }
        }

        fetchWeather()
        const interval = setInterval(fetchWeather, 300000) // 5 minutes
        return () => clearInterval(interval)
    }, [])

    if (!weather) return null

    const getWeatherIcon = (code: number, className: string = "h-10 w-10") => {
        if (code === 0) return <Sun className={`${className} text-yellow-400`} />
        if (code >= 1 && code <= 3) return <Cloud className={`${className} text-zinc-400`} />
        if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />
        if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-500`} />
        if (code >= 95) return <CloudLightning className={`${className} text-purple-500`} />
        return <Cloud className={`${className} text-zinc-400`} />
    }

    const getWeatherText = (code: number) => {
        if (code === 0) return 'Jasno'
        if (code >= 1 && code <= 3) return 'Polojasno'
        if (code >= 51 && code <= 67) return 'Mrholení'
        if (code >= 80 && code <= 82) return 'Přeháňky'
        if (code >= 95) return 'Bouřka'
        return 'Oblačno'
    }

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return format(date, 'HH:mm');
    }

    return (
        <Card className="glass-card border-none overflow-hidden h-fit flex flex-col">
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            {getWeatherIcon(weather.current.code, "h-8 w-8")}
                        </div>
                        <div>
                            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-none">{weather.current.temp}°C</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">U. Brod</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-2 px-3 rounded-lg">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            <Sunrise className="w-3 h-3 text-orange-400" />
                            <span>{formatTime(weather.daily.sunrise[0])}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            <Sunset className="w-3 h-3 text-orange-600" />
                            <span>{formatTime(weather.daily.sunset[0])}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {[1, 2, 3].map((dayIndex) => (
                        <div key={dayIndex} className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/20">
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                                {weather.daily.time[dayIndex] ? format(new Date(weather.daily.time[dayIndex]), 'EEEE', { locale: cs }).substring(0,2) : ''}
                            </span>
                            {getWeatherIcon(weather.daily.code[dayIndex], "w-5 h-5 mb-1")}
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                                <span className="text-zinc-800 dark:text-zinc-200">{Math.round(weather.daily.maxTemp[dayIndex] || 0)}°</span>
                                <span className="text-zinc-400 text-[9px]">{Math.round(weather.daily.minTemp[dayIndex] || 0)}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
