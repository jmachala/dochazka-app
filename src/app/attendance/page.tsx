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
import { AbsenceDialog } from '@/components/attendance/absence-dialog'
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

    // Date Logic
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Month picker logic for History tab
    const selectedMonth = month ? new Date(month) : new Date()
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    const prevMonth = format(subMonths(start, 1), 'yyyy-MM')
    const nextMonth = format(addMonths(start, 1), 'yyyy-MM')

    // Fetch records for the selected month to show in history
    const { data: monthAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in', start.toISOString())
        .lte('check_in', end.toISOString())
        .order('check_in', { ascending: false })

    // Fetch absences
    const { data: userAbsences } = await supabase
        .from('absences')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

    // Helper to calculate hours
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

    // Stats for Today (always based on current real today)
    const realstartOfMonth = startOfMonth(new Date())
    const { data: currentMonthAttendance } = await supabase
        .from('attendance')
        .select('id, check_in, check_out, notes')
        .eq('user_id', user.id)
        .gte('check_in', realstartOfMonth.toISOString())

    const { hours: monthHours, minutes: monthMins } = calculateTotalHours(currentMonthAttendance || [])
    const todayAttendance = currentMonthAttendance?.filter(r => new Date(r.check_in) >= today) || []
    const { hours: todayHours, minutes: todayMins } = calculateTotalHours(todayAttendance)
    const activeRecord = todayAttendance?.find(r => !r.check_out)

    // Fetch team stats for the public board
    const teamStats = await getTeamStats()

    return (
        <div className="flex min-h-screen flex-col bg-mesh">
            <header className="glass-nav">
                <div className="mx-auto flex max-w-2xl items-center justify-between p-4 px-6 md:px-4">
                    <h1 className="text-xl font-black text-gradient uppercase tracking-tight">Docházka</h1>
                    <div className="flex items-center gap-4">
                        {profile?.role === 'admin' && (
                            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                                <Link href="/admin">Admin Panel</Link>
                            </Button>
                        )}
                        <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-all active:scale-95">
                            <span className="text-xs font-bold text-zinc-500 hidden sm:block">{profile?.full_name}</span>
                            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/20">
                                {profile?.full_name?.charAt(0)}
                            </div>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="sm">Odhlásit</Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 p-4 py-8 space-y-8">
                <Tabs defaultValue={tab || "personal"} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8 h-12 glass-card p-1 rounded-2xl">
                        <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold">Dnes</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold">Historie</TabsTrigger>
                        <TabsTrigger value="absences" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold">Absence</TabsTrigger>
                        <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold">Tým</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="p-5 glass-card">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Dnes odpracováno</p>
                                    <p className="text-3xl font-black">{todayHours}h {todayMins}m</p>
                                </Card>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="p-5 glass-card">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Tento měsíc</p>
                                    <p className="text-3xl font-black">{monthHours}h {monthMins}m</p>
                                </Card>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="overflow-hidden border-none glass-card scale-100 ring-1 ring-white/20">
                                <CardHeader className="bg-primary/5 pb-4 text-center border-b border-primary/10">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        Aktuální Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    {activeRecord ? (
                                        <div className="space-y-6">
                                            <div className="text-center space-y-4">
                                                <motion.div
                                                    key="status-in"
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30"
                                                >
                                                    <UserCheck className="h-10 w-10" />
                                                </motion.div>
                                                <div className="space-y-1">
                                                    <h2 className="text-2xl font-bold">Jste v práci</h2>
                                                    <p className="text-zinc-500">
                                                        Příchod: {new Date(activeRecord.check_in).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <form action={async (formData: FormData) => {
                                                'use server'
                                                const note = formData.get('note') as string
                                                await checkOut(activeRecord.id, note)
                                            }} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                                        <MessageSquare className="h-3 w-3" />
                                                        Poznámka k odchodu (volitelné)
                                                    </label>
                                                    <Textarea
                                                        name="note"
                                                        placeholder="Např. práce na projektu X, dřívější odchod..."
                                                        className="resize-none border-zinc-100 bg-zinc-50/50 focus:bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950/50"
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 transition-all active:scale-95 group border-none text-white" size="lg" type="submit">
                                                    <UserX className="mr-3 h-7 w-7 group-hover:rotate-12 transition-transform" />
                                                    Odchod z práce
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="text-center space-y-4">
                                                <motion.div
                                                    key="status-out"
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                                >
                                                    <Clock className="h-10 w-10" />
                                                </motion.div>
                                                <div className="space-y-1">
                                                    <h2 className="text-2xl font-bold">Nejste v práci</h2>
                                                    <p className="text-zinc-500">Začněte směnu kliknutím na tlačítko</p>
                                                </div>
                                            </div>

                                            <form action={async (formData: FormData) => {
                                                'use server'
                                                const note = formData.get('note') as string
                                                await checkIn(note)
                                            }} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                                        <MessageSquare className="h-3 w-3" />
                                                        Poznámka k příchodu (volitelné)
                                                    </label>
                                                    <Textarea
                                                        name="note"
                                                        placeholder="Např. home office, služební cesta..."
                                                        className="resize-none border-zinc-100 bg-zinc-50/50 focus:bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950/50"
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all active:scale-95 group border-none text-white" size="lg" type="submit">
                                                    <UserCheck className="mr-3 h-7 w-7 group-hover:-rotate-12 transition-transform" />
                                                    Příchod do práce
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Dnešní záznamy
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {todayAttendance && todayAttendance.length > 0 ? (
                                    todayAttendance.map((record, index) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={record.check_out ? "h-2 w-2 rounded-full bg-zinc-300" : "h-2 w-2 rounded-full bg-green-500 animate-pulse"} />
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium">
                                                            {new Date(record.check_in).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                                                            {record.check_out ? ` - ${new Date(record.check_out).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}` : ' (Probíhá)'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {record.notes && (
                                                <div className="mt-2 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-md dark:bg-zinc-950 flex gap-2 items-start">
                                                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{record.notes}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-sm text-zinc-500 bg-white rounded-xl border border-dashed dark:bg-transparent dark:border-zinc-800">
                                        Dnes zatím nejsou žádné záznamy
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-xl flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Moje historie
                            </h3>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`?tab=history&month=${prevMonth}`}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="px-3 text-sm font-semibold min-w-[120px] text-center capitalize">
                                    {format(start, 'LLLL yyyy', { locale: cs })}
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`?tab=history&month=${nextMonth}`}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {monthAttendance && monthAttendance.length > 0 ? (
                                monthAttendance.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="text-zinc-400">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-zinc-500 uppercase font-medium">
                                                        {format(new Date(record.check_in), 'eeee dd. MM.', { locale: cs })}
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                        {format(new Date(record.check_in), 'HH:mm')}
                                                        {record.check_out ? ` - ${format(new Date(record.check_out), 'HH:mm')}` : ' (Probíhá)'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {record.check_out && (
                                                    <p className="text-sm font-bold text-primary">
                                                        {(() => {
                                                            const diff = new Date(record.check_out).getTime() - new Date(record.check_in).getTime()
                                                            const h = Math.floor(diff / (1000 * 60 * 60))
                                                            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                                                            return `${h}h ${m}m`
                                                        })()}
                                                    </p>
                                                )}
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                                                    {record.status === 'present' ? 'V pořádku' : record.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {record.notes && (
                                            <div className="mt-2 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-md dark:bg-zinc-950 flex gap-2 items-start border border-dashed">
                                                <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{record.notes}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center py-12 text-sm text-zinc-500 bg-white rounded-xl border border-dashed dark:bg-transparent dark:border-zinc-800">
                                    V tomto měsíci zatím nemáte žádné záznamy
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="absences" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-xl flex items-center gap-2">
                                <Palmtree className="h-5 w-5" />
                                Moje absence
                            </h3>
                            <AbsenceDialog />
                        </div>

                        <div className="space-y-3">
                            {userAbsences && userAbsences.length > 0 ? (
                                userAbsences.map((abs, index) => (
                                    <motion.div
                                        key={abs.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold capitalize">
                                                        {abs.type === 'vacation' ? 'Dovolená' :
                                                            abs.type === 'sick_leave' ? 'Nemocenská' :
                                                                abs.type === 'home_office' ? 'Home Office' : 'Jiné'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {format(new Date(abs.start_date), 'd. M.')} - {format(new Date(abs.end_date), 'd. M. yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={abs.status === 'approved' ? 'default' : abs.status === 'pending' ? 'outline' : 'destructive'}>
                                                {abs.status === 'approved' ? 'Schváleno' :
                                                    abs.status === 'pending' ? 'Čeká' : 'Zamítnuto'}
                                            </Badge>
                                        </div>
                                        {abs.note && (
                                            <div className="mt-3 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-md dark:bg-zinc-950 border border-dashed">
                                                {abs.note}
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed dark:bg-transparent dark:border-zinc-800">
                                    <AlertCircle className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500">Zatím jste nepožádali o žádnou absenci</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="team">
                        <TeamBoard stats={teamStats} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
