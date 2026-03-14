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
                <div className="mx-auto flex max-w-4xl items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gradient uppercase tracking-tight leading-none">Pípačka</h1>
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

            <main className="mx-auto w-full max-w-4xl flex-1 p-6 py-8 space-y-8">
                <TeamBoard stats={teamStats} />
            </main>

        </div>
    )
}
