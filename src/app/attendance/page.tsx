import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, UserCheck, UserX, History, MessageSquare, Users, ChevronLeft, ChevronRight, Calendar, Palmtree, AlertCircle } from 'lucide-react'
import { checkIn, checkOut } from '@/app/actions/attendance'
import { getTeamStats } from '@/app/actions/stats'
import { Textarea } from '@/components/ui/textarea'
import * as motion from 'framer-motion/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamBoard } from '@/components/attendance/team-board'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Weather } from '@/components/attendance/weather'
import { LiveClock } from '@/components/attendance/live-clock'
import { LunchMenu } from '@/components/attendance/lunch-menu'

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; tab?: string }>
}) {
    const { month, tab } = await searchParams
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()


    // Fetch team stats for the public board
    const teamStats = await getTeamStats()

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
            <header className="glass-nav sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gradient uppercase">Pípačka</h1>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Docházkový systém</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {profile?.role === 'admin' && (
                            <Button variant="outline" size="sm" asChild className="rounded-xl font-black border-2 border-zinc-200">
                                <Link href="/admin">Admin Panel</Link>
                            </Button>
                        )}
                        <div className="h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-black text-xs border border-zinc-200 dark:border-zinc-700">
                            Terminál: {profile?.full_name}
                        </div>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="sm" className="rounded-xl font-black text-zinc-600 hover:text-red-500 transition-colors">Odhlásit</Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 p-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Weather />
                        <LunchMenu />
                        <Card className="glass-card border-none p-6 shadow-sm hidden md:block">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 text-center">Inspirace dne</p>
                            <p className="text-sm font-bold italic text-center text-zinc-800 dark:text-zinc-200 leading-relaxed">"Píle je matkou štěstí."</p>
                        </Card>
                    </div>

                    {/* Middle Column */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col items-center">
                        <div className="mb-4">
                            <LiveClock />
                        </div>
                        <div className="w-full">
                            <TeamBoard stats={teamStats} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <Card className="glass-card border-none p-6 h-full flex flex-col justify-between shadow-sm">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Status firmy</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-300">V budově</span>
                                        <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{teamStats.filter(s => s.isNowIn).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-300">Venku</span>
                                        <span className="text-3xl font-black text-zinc-600 dark:text-zinc-500">{teamStats.filter(s => !s.isNowIn).length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black text-center leading-relaxed uppercase tracking-widest">
                                    Uherský Brod<br />
                                    {new Date().getFullYear()} © ALFA Team
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
