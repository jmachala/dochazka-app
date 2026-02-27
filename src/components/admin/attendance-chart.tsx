'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addDays, startOfDay, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { cs } from 'date-fns/locale'

interface AttendanceChartProps {
    records: any[]
}

export function AttendanceChart({ records }: AttendanceChartProps) {
    const [offset, setOffset] = useState(0)
    const windowSize = 7

    // Generate days for the current window
    const endDate = subDays(startOfDay(new Date()), offset * windowSize)
    const startDate = subDays(endDate, windowSize - 1)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const chartData = days.map(day => {
        const dayRecords = records?.filter(r => {
            if (!r.check_in) return false
            const recordDate = new Date(r.check_in)
            return isSameDay(recordDate, day)
        }) || []

        let dayMs = 0
        dayRecords.forEach(r => {
            const start = new Date(r.check_in).getTime()
            // If still in progress, count until now (but only if it's the same day)
            const end = r.check_out
                ? new Date(r.check_out).getTime()
                : (isSameDay(new Date(r.check_in), new Date()) ? new Date().getTime() : new Date(r.check_in).getTime())

            if (start && end > start) {
                dayMs += end - start
            }
        })

        return {
            date: day,
            hours: dayMs / (1000 * 60 * 60)
        }
    })

    return (
        <Card className="mb-8 glass-card border-none shadow-xl ring-1 ring-white/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-black text-gradient uppercase tracking-tight">Trend docházky</CardTitle>
                    <CardDescription className="font-medium">
                        {format(startDate, 'd. MMMM', { locale: cs })} – {format(endDate, 'd. MMMM yyyy', { locale: cs })}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setOffset(prev => prev + 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold uppercase tracking-widest px-3"
                        onClick={() => setOffset(0)}
                        disabled={offset === 0}
                    >
                        Dnes
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setOffset(prev => Math.max(0, prev - 1))}
                        disabled={offset === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-10">
                <div className="flex items-end justify-between h-56 gap-3 pb-2">
                    {chartData.map((day, i) => {
                        const height = Math.min((day.hours / 12) * 100, 100)
                        const isToday = day.date.toDateString() === new Date().toDateString()

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                                <div className="relative w-full h-full flex items-end">
                                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900/50 rounded-t-xl -z-10 border border-zinc-100 dark:border-zinc-800/50" />
                                    <div
                                        className={`w-full transition-all duration-500 rounded-t-lg relative z-10 ${isToday
                                            ? 'bg-gradient-to-t from-primary to-indigo-400 shadow-[0_-4px_12px_rgba(99,102,241,0.4)]'
                                            : 'bg-primary opacity-60 group-hover:opacity-100'
                                            }`}
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border">
                                            {day.hours.toFixed(1)}h
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-primary' : 'text-zinc-500'}`}>
                                        {format(day.date, 'eee', { locale: cs })}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400 mt-0.5">
                                        {format(day.date, 'd.M.')}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
