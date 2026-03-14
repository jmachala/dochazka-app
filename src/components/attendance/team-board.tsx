'use client'

import { toggleAttendance } from '@/app/actions/attendance'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Clock, BarChart3, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import * as motion from 'framer-motion/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TeamStatsProps {
    stats: any[]
}

export function TeamBoard({ stats }: TeamStatsProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggle = (userId: string, name: string) => {
        startTransition(async () => {
            try {
                await toggleAttendance(userId)
                toast.success(`Status změněn: ${name}`)
            } catch (error: any) {
                toast.error(error.message || 'Něco se nepovedlo')
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    Tým – Kliknutím se pípneš
                </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                    >
                        <button
                            onClick={() => handleToggle(member.id, member.name)}
                            disabled={isPending}
                            className="w-full text-left transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            <Card className={`p-6 flex items-center justify-between transition-all duration-300 border-2 ${member.isNowIn
                                ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10'
                                : 'bg-white border-transparent hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-700'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black transition-colors ${member.isNowIn
                                            ? 'bg-primary text-white'
                                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                                            }`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        {member.isNowIn && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-lg font-black tracking-tight ${member.isNowIn ? 'text-primary' : 'text-zinc-800 dark:text-zinc-100'}`}>
                                            {member.name}
                                        </p>
                                        <p className="text-xs font-black uppercase tracking-wider">
                                            {member.isNowIn ? (
                                                <span className="text-green-700">Přítomen</span>
                                            ) : (
                                                <span className="text-zinc-500">Nepřítomen</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-sm font-black">
                                            {isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <Clock className={`h-4 w-4 ${member.isNowIn ? 'text-primary' : 'text-zinc-400'}`} />
                                                    <span className={member.isNowIn ? 'text-primary font-black' : 'text-zinc-700 font-black'}>
                                                        {member.hours}h {member.minutes}m
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tento měsíc</p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl bg-zinc-50 hover:bg-primary/10 hover:text-primary transition-colors border border-zinc-100"
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Link href={`/attendance/${member.id}`}>
                                            <BarChart3 className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}


