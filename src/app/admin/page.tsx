import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Settings, LogOut, Clock, ArrowUpRight, ArrowDownLeft, UserCircle, MessageSquare, History as HistoryIcon, Palmtree } from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { MobileNav } from '@/components/admin/mobile-nav'

export default async function AdminDashboard() {
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

    if (profile?.role !== 'admin') {
        redirect('/attendance')
    }

    // Fetch real stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Employees currently IN
    const { count: currentlyIn } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .is('check_out', null)

    // 2. Total employees
    const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // 3. Today's unique attendees
    const { data: todayRecords } = await supabase
        .from('attendance')
        .select('user_id')
        .gte('check_in', today.toISOString())

    const uniqueAttendees = new Set(todayRecords?.map(r => r.user_id)).size

    // 4. Admin's personal stats for Today & Month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    const { data: adminMonthRecords } = await supabase
        .from('attendance')
        .select('check_in, check_out')
        .eq('user_id', user.id)
        .gte('check_in', startOfMonth)

    const calculateTotalHours = (records: any[]) => {
        let totalMs = 0
        records?.forEach(r => {
            if (r.check_in && r.check_out) {
                totalMs += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
            }
        })
        const hours = Math.floor(totalMs / (1000 * 60 * 60))
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
        return { hours, minutes }
    }

    const { hours: monthHours, minutes: monthMins } = calculateTotalHours(adminMonthRecords || [])
    const todayPersonalRecords = adminMonthRecords?.filter(r => new Date(r.check_in) >= today) || []
    const { hours: todayHours, minutes: todayMins } = calculateTotalHours(todayPersonalRecords)

    // 5. Last 10 activities with profile info
    const { data: activities } = await supabase
        .from('attendance')
        .select(`
            id,
            check_in,
            check_out,
            notes,
            profiles (
                full_name
            )
        `)
        .order('check_in', { ascending: false })
        .limit(10)

    return (
        <main className="flex-1 p-4 md:p-8 bg-mesh min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="header mb-10 flex justify-between items-end border-b pb-6 border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gradient uppercase">Řídicí Centrum</h1>
                        <p className="text-zinc-500 font-medium hidden sm:block">Kompletní přehled o docházce a aktivitě týmu.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{format(new Date(), 'eeee, d. MMMM', { locale: cs })}</p>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                    <Card className="glass-card border-none ring-1 ring-white/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">V budově</CardDescription>
                            <CardTitle className="text-4xl font-black">{currentlyIn || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-zinc-500 italic">z celkem {totalEmployees || 0} kolegů</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-none ring-1 ring-white/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Dnes přišlo</CardDescription>
                            <CardTitle className="text-4xl font-black text-gradient">{uniqueAttendees || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-zinc-500 italic">unikátních osob</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-none ring-1 ring-white/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Můj čas (dnes)</CardDescription>
                            <CardTitle className="text-4xl font-black">{todayHours}h {todayMins}m</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-zinc-500 italic">osobní aktivita</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-none ring-1 ring-white/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Můj čas (měsíc)</CardDescription>
                            <CardTitle className="text-4xl font-black">{monthHours}h {monthMins}m</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-zinc-500 italic">souhrn za {format(new Date(), 'MMMM', { locale: cs })}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-1">
                    <Card className="glass-card border-none shadow-2xl ring-1 ring-white/10">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
                            <CardTitle className="text-lg font-bold">Živý deník aktivit</CardTitle>
                            <CardDescription className="font-medium">Posledních 10 interakcí se systémem napříč firmou</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {activities && activities.length > 0 ? (
                                    activities.map((activity: any) => (
                                        <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-xl shadow-sm ${activity.check_out ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-primary text-white shadow-primary/20'}`}>
                                                    {activity.check_out ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">{activity.profiles?.full_name}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                        {activity.check_out ? 'Odchod ze systému' : 'Vstup do systému'}
                                                    </p>
                                                    {activity.notes && (
                                                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 italic flex items-center gap-1">
                                                            <MessageSquare className="h-2 w-2" />
                                                            "{activity.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-medium">
                                                    {format(new Date(activity.check_out || activity.check_in), 'HH:mm')}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {format(new Date(activity.check_out || activity.check_in), 'd. MMM', { locale: cs })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">
                                        <p>Zatím nebyly nalezeny žádné záznamy.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
