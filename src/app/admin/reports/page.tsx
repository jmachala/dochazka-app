import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { cs } from 'date-fns/locale'

export default async function AdminReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const { month } = await searchParams
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/attendance')
    }

    const currentMonth = month ? new Date(month) : new Date()
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)

    const { data: records } = await supabase
        .from('attendance')
        .select(`
      user_id,
      check_in,
      check_out,
      profiles (
        full_name
      )
    `)
        .gte('check_in', start.toISOString())
        .lte('check_in', end.toISOString())

    const { data: employees } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name')

    // Aggregate hours per employee
    const employeeSummaries = employees?.map(emp => {
        const empRecords = records?.filter(r => r.user_id === emp.id) || []
        let totalMs = 0
        empRecords.forEach(r => {
            if (r.check_in && r.check_out) {
                totalMs += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
            }
        })
        const hours = Math.floor(totalMs / (1000 * 60 * 60))
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
        return {
            name: emp.full_name,
            hours,
            minutes,
            recordCount: empRecords.length
        }
    })

    const prevMonth = format(subMonths(start, 1), 'yyyy-MM')
    const nextMonth = format(addMonths(start, 1), 'yyyy-MM')

    return (
        <main className="flex-1 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Měsíční přehled</h1>
                        <p className="text-zinc-500">Souhrn odpracovaných hodin všech zaměstnanců.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`?month=${prevMonth}`}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="px-4 font-semibold min-w-[140px] text-center">
                            {format(start, 'LLLL yyyy', { locale: cs })}
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`?month=${nextMonth}`}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Celkové odpracované hodiny</CardTitle>
                        <CardDescription>Období od {format(start, 'd. M.')} do {format(end, 'd. M. yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Zaměstnanec</TableHead>
                                    <TableHead className="text-right">Počet záznamů</TableHead>
                                    <TableHead className="text-right font-bold">Celkový čas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employeeSummaries && employeeSummaries.length > 0 ? (
                                    employeeSummaries.map((summary) => (
                                        <TableRow key={summary.name}>
                                            <TableCell className="font-medium">{summary.name}</TableCell>
                                            <TableCell className="text-right">{summary.recordCount}</TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {summary.hours}h {summary.minutes}m
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                                            Žádná data pro toto období.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
