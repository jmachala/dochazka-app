import { getEmployeeDetails } from '@/app/actions/stats'
import { AttendanceChart } from '@/components/admin/attendance-chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Clock, Calendar, History, Trophy, Flame, Palmtree, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as motion from 'framer-motion/client'

export const dynamic = 'force-dynamic'

export default async function EmployeeStatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getEmployeeDetails(id)

    if (!data || !data.employee) {
        notFound()
    }

    const calculateStats = () => {
        if (!data?.records) return { totalHours: 0, totalMins: 0, count: 0 }
        let ms = 0
        data.records.forEach((r: any) => {
            if (r.check_in && r.check_out) {
                ms += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
            }
        })
        return {
            totalHours: Math.floor(ms / (1000 * 60 * 60)),
            totalMins: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            count: data.records.length
        }
    }

    const stats = calculateStats()
    const isNowIn = data.records.length > 0 && !data.records[0].check_out

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-3xl bg-primary shadow-2xl shadow-primary/20 flex items-center justify-center text-4xl font-black text-white">
                            {data.employee.full_name.charAt(0)}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight italic text-zinc-900 dark:text-zinc-100">
                                {data.employee.full_name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-black uppercase tracking-widest text-[10px] border-primary/20 text-primary bg-primary/5 shadow-inner">
                                    Osobní Přehled Docházky
                                </Badge>
                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <History className="h-4 w-4" />
                                    Posledních 30 dní
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="default"
                            size="lg"
                            asChild
                            className="rounded-2xl font-black uppercase tracking-widest text-xs h-14 px-8 shadow-xl shadow-primary/20 transition-all hover:scale-105"
                        >
                            <Link href="/attendance">
                                <ArrowLeft className="mr-3 h-5 w-5" />
                                Zpět na tabuli
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Major Cards Row */}
                <div className="grid grid-cols-1 space-y-4 md:space-y-0 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <Card className="h-full p-8 glass-card border-none shadow-2xl bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden hover:shadow-primary/30 transition-shadow duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <Trophy className="h-8 w-8 text-white/40 mb-6" />
                            <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-1">Odpracováno</p>
                            <div className="text-5xl md:text-6xl font-black text-white tracking-tighter flex items-baseline gap-1">
                                {stats.totalHours} <span className="text-2xl opacity-60 font-bold tracking-normal">h</span>
                                {stats.totalMins} <span className="text-2xl opacity-60 font-bold tracking-normal">m</span>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="h-full p-8 glass-card border-none shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-100 hover:shadow-xl transition-shadow duration-500">
                            <Flame className="h-8 w-8 text-orange-500 mb-6 drop-shadow-sm" />
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Celkem Pípnutí</p>
                            <div className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                                {stats.count}
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                        <Card className="h-full p-8 glass-card border-none shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-100 hover:shadow-xl transition-shadow duration-500">
                            <Calendar className="h-8 w-8 text-primary mb-6" />
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Aktuální Status</p>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter mt-4 flex items-center gap-4 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950">
                                <span className="relative flex h-5 w-5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isNowIn ? 'bg-green-400' : 'bg-zinc-200'
                                        }`}></span>
                                    <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white dark:border-zinc-900 ${isNowIn ? 'bg-green-500' : 'bg-zinc-300'
                                        }`}></span>
                                </span>
                                {isNowIn ? 'Právě v práci' : 'Mimo práci'}
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Chart Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-xl">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                            <div className="h-[2px] w-12 bg-primary rounded-full" />
                            Aktivita za poslední týdny
                        </h3>
                        <div className="px-2">
                            <AttendanceChart records={data.records} />
                        </div>
                    </div>
                </motion.div>

                {/* History Section Full Width */}
                <div className="pb-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                    <div className="h-[2px] w-12 bg-primary rounded-full" />
                                    Historie Docházky
                                </h3>
                                <Badge variant="secondary" className="font-bold bg-zinc-100 text-zinc-500 pointer-events-none">Posledních 10 pípnutí</Badge>
                            </div>

                            <div className="rounded-3xl border border-zinc-100 bg-zinc-50/50 dark:bg-zinc-950/50 dark:border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white dark:bg-zinc-900">
                                        <TableRow className="border-none">
                                            <TableHead className="font-black text-[10px] uppercase p-6 text-zinc-400">Datum & Den</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase p-6 text-right text-zinc-400">Čas & Trvání</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.records.slice(0, 10).map((record: any) => (
                                            <TableRow key={record.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                                                <TableCell className="p-5 pl-6">
                                                    <div className="font-black text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
                                                        {format(new Date(record.check_in), 'd. MMMM yyyy', { locale: cs })}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                        {format(new Date(record.check_in), 'eeee', { locale: cs })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-5 pr-6 text-right">
                                                    <div className="font-black text-base tracking-tighter flex items-center justify-end gap-2 text-zinc-900 dark:text-zinc-100">
                                                        <Clock className="h-3.5 w-3.5 text-zinc-300" />
                                                        {format(new Date(record.check_in), 'HH:mm')}
                                                        {record.check_out ? (
                                                            <>
                                                                <span className="text-zinc-300 font-normal">→</span>
                                                                {format(new Date(record.check_out), 'HH:mm')}
                                                            </>
                                                        ) : (
                                                            <Badge className="ml-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-none font-black text-[10px] uppercase px-2 py-0.5 rounded-lg animate-pulse">
                                                                Nyní v práci
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {record.check_out && (
                                                        <div className="text-xs font-black text-primary mt-1 flex items-center justify-end gap-1">
                                                            {(() => {
                                                                const diff = new Date(record.check_out).getTime() - new Date(record.check_in).getTime()
                                                                const h = Math.floor(diff / (1000 * 60 * 60))
                                                                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                                                                return <><ArrowUpRight className="h-3 w-3" />Celkem {h}h {m}m</>
                                                            })()}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.records.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="p-12 text-center text-zinc-400 font-bold">
                                                    Zatím žádné záznamy.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
