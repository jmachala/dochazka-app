'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Thermometer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function Weather() {
    const [weather, setWeather] = useState<{
        temp: number;
        code: number;
        is_day: boolean;
    } | null>(null)

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Uhersky Brod coordinates
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.995&longitude=17.65&current_weather=true')
                const data = await res.json()
                if (data.current_weather) {
                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        code: data.current_weather.weathercode,
                        is_day: data.current_weather.is_day === 1
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

    const getWeatherIcon = (code: number) => {
        if (code === 0) return <Sun className="h-10 w-10 text-yellow-400" />
        if (code >= 1 && code <= 3) return <Cloud className="h-10 w-10 text-zinc-400" />
        if (code >= 51 && code <= 67) return <CloudRain className="h-10 w-10 text-blue-400" />
        if (code >= 80 && code <= 82) return <CloudRain className="h-10 w-10 text-blue-500" />
        if (code >= 95) return <CloudLightning className="h-10 w-10 text-purple-500" />
        return <Cloud className="h-10 w-10 text-zinc-400" />
    }

    const getWeatherText = (code: number) => {
        if (code === 0) return 'Jasno'
        if (code >= 1 && code <= 3) return 'Polojasno'
        if (code >= 51 && code <= 67) return 'Mrholení'
        if (code >= 80 && code <= 82) return 'Přeháňky'
        if (code >= 95) return 'Bouřka'
        return 'Oblačno'
    }

    return (
        <Card className="glass-card border-none overflow-hidden h-full">
            <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        {getWeatherIcon(weather.code)}
                    </div>
                    <div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{weather.temp}°C</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Uherský Brod</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-zinc-500">
                    <p className="text-xs font-bold uppercase tracking-wider">{getWeatherText(weather.code)}</p>
                </div>
            </CardContent>
        </Card>
    )
}
