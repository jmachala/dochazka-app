'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'
import * as motion from 'framer-motion/client'

interface TeamStatsProps {
    stats: any[]
}

export function TeamBoard({ stats }: TeamStatsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Týmový přehled (tento měsíc)
                </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-4 flex items-center justify-between bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold dark:bg-zinc-800">
                                        {member.name.charAt(0)}
                                    </div>
                                    {member.isNowIn && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-zinc-500">
                                        {member.isNowIn ? (
                                            <span className="text-green-600 font-medium">Právě v práci</span>
                                        ) : member.currentAbsence ? (
                                            <span className="font-medium text-amber-600">
                                                {member.currentAbsence === 'vacation' ? 'Dovolená' :
                                                    member.currentAbsence === 'sick_leave' ? 'Nemocenská' :
                                                        member.currentAbsence === 'home_office' ? 'Home Office' : 'Nepřítomen'}
                                            </span>
                                        ) : (
                                            'Mimo kancelář'
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-bold justify-end">
                                    <Clock className="h-3 w-3 text-zinc-400" />
                                    {member.hours}h {member.minutes}m
                                </div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Celkem</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
