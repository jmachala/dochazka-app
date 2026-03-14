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
import { Weather } from '@/components/attendance/weather'
import { LiveClock } from '@/components/attendance/live-clock'

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
        <div className="flex min-h-screen flex-col bg-mesh">
            <header className="glass-nav sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6 uppercase tracking-tight">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gradient">Pípačka</h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Docházkový systém</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {profile?.role === 'admin' && (
                            <Button variant="outline" size="sm" asChild className="rounded-xl font-bold border-2">
                                <Link href="/admin">Admin Panel</Link>
                            </Button>
                        )}
                        <div className="h-9 px-4 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs border border-zinc-200">
                            Terminál: {profile?.full_name}
                        </div>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-zinc-500 hover:text-red-500 transition-colors">Odhlásit</Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 p-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
                    <div className="lg:col-span-1 space-y-6">
                        <Weather />
                        <Card className="glass-card border-none p-6">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Inspirace dne</p>
                            <p className="text-sm font-medium italic text-center text-zinc-600">"Píle je matkou štěstí."</p>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-8 flex flex-col items-center">
                        <div className="mb-4">
                            <LiveClock />
                        </div>
                        <div className="w-full">
                            <TeamBoard stats={teamStats} />
                        </div>
                    </div>

                    <div className="lg:col-span-1 hidden lg:block">
                        <Card className="glass-card border-none p-6 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Status firmy</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-zinc-600">V budově</span>
                                        <span className="text-xl font-black">{teamStats.filter(s => s.isNowIn).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-zinc-600">Venku</span>
                                        <span className="text-xl font-black text-zinc-400">{teamStats.filter(s => !s.isNowIn).length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/20">
                                <p className="text-[10px] text-zinc-400 font-bold text-center leading-relaxed">
                                    Uherský Brod<br />
                                    {format(new Date(), 'yyyy')} © ALFA Team
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
