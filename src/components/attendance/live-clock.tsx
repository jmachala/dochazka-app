'use client'

import { useState, useEffect } from 'react'

export function LiveClock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="text-center">
            <p className="text-6xl font-black text-gradient tabular-nums">
                {time.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200 mt-2">
                {time.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
    )
}
