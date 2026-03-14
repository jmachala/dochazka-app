import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Calendar, Shield, Printer } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { PrintButton } from '@/components/admin/print-button'
import { PrintReport } from '@/components/admin/print-report'
import { AttendanceChart } from '@/components/admin/attendance-chart'

export default async function EmployeeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user: adminUser },
    } = await supabase.auth.getUser()

    if (!adminUser) redirect('/login')

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single()

    if (adminProfile?.role !== 'admin') redirect('/attendance')

    // Fetch employee data
    const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !employee) notFound()

    // Fetch attendance records for this employee
    const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', id)
        .order('check_in', { ascending: false })




    // Calculations
    const totalRecords = records?.length || 0
    let totalMs = 0
    records?.forEach(r => {
        if (r.check_in && r.check_out) {
            totalMs += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
        }
    })
    const totalHours = Math.floor(totalMs / (1000 * 60 * 60))
    const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))


    return (
        <>
            <main className="flex-1 p-8 print:hidden">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/admin/employees">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{employee.full_name}</h1>
                                <p className="text-zinc-500">Karta zaměstnance a historie docházky.</p>
                            </div>
                        </div>
                        <PrintButton />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Celkem odpracováno</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-2xl font-bold">{totalHours}h {totalMinutes}m</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Záznamů</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="text-2xl font-bold">{totalRecords}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    <AttendanceChart records={records || []} />

                    <div className="grid gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historie docházky</CardTitle>
                                <CardDescription>Seznam všech příchodů a odchodů.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Datum</TableHead>
                                            <TableHead>Čas</TableHead>
                                            <TableHead>Doba</TableHead>
                                            <TableHead>Poznámka</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records && records.length > 0 ? (
                                            records.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">
                                                        {format(new Date(record.check_in), 'dd. MM. yyyy', { locale: cs })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(record.check_in), 'HH:mm')}
                                                        {record.check_out ? ` - ${format(new Date(record.check_out), 'HH:mm')}` : ' (Probíhá)'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.check_out ? (() => {
                                                            const diff = new Date(record.check_out).getTime() - new Date(record.check_in).getTime()
                                                            const h = Math.floor(diff / (1000 * 60 * 60))
                                                            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                                                            return `${h}h ${m}m`
                                                        })() : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-500 text-xs">
                                                        {record.notes || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                                    Žádné záznamy k dispozici.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </main>
            <PrintReport employee={employee} records={records || []} />
        </>
    )
}
