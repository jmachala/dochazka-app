import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Filter, MessageSquare, Pencil } from 'lucide-react'
import { ExportButton } from '@/components/admin/export-button'
import { RecordDialog } from '@/components/admin/record-dialog'
import { DeleteRecordDialog } from '@/components/admin/delete-record'

export default async function AdminRecordsPage() {
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

    // Fetch all records with profile info
    const { data: records } = await supabase
        .from('attendance')
        .select(`
      *,
      profiles (
        id,
        full_name
      )
    `)
        .order('check_in', { ascending: false })

    // Fetch employees for the Add/Edit dialog
    const { data: employees } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name')

    return (
        <main className="flex-1 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kniha docházky</h1>
                        <p className="text-zinc-500">Kompletní historie příchodů a odchodů všech zaměstnanců.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <RecordDialog employees={employees || []} />
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrovat
                        </Button>
                        <ExportButton data={records || []} />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Zaměstnanec</TableHead>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Příchod</TableHead>
                                    <TableHead>Odchod</TableHead>
                                    <TableHead>Doba</TableHead>
                                    <TableHead>Poznámka</TableHead>
                                    <TableHead>Stav</TableHead>
                                    <TableHead className="w-[100px]">Akce</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records && records.length > 0 ? (
                                    records.map((record: any) => {
                                        const checkInDate = new Date(record.check_in)
                                        const checkOutDate = record.check_out ? new Date(record.check_out) : null

                                        let duration = '-'
                                        if (checkOutDate) {
                                            const diffInMs = checkOutDate.getTime() - checkInDate.getTime()
                                            const hours = Math.floor(diffInMs / (1000 * 60 * 60))
                                            const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
                                            duration = `${hours}h ${minutes}m`
                                        }

                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {record.profiles?.full_name}
                                                </TableCell>
                                                <TableCell>
                                                    {format(checkInDate, 'dd. MM. yyyy', { locale: cs })}
                                                </TableCell>
                                                <TableCell>
                                                    {format(checkInDate, 'HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    {checkOutDate ? format(checkOutDate, 'HH:mm') : '-'}
                                                </TableCell>
                                                <TableCell>{duration}</TableCell>
                                                <TableCell>
                                                    {record.notes ? (
                                                        <div className="flex items-center gap-2 group cursor-help">
                                                            <MessageSquare className="h-4 w-4 text-zinc-400" />
                                                            <span className="text-xs text-zinc-500 truncate max-w-[150px]" title={record.notes}>
                                                                {record.notes}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-300">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.check_out ? (
                                                        <Badge variant="secondary">Dokončeno</Badge>
                                                    ) : (
                                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                            Probíhá
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <RecordDialog
                                                            employees={employees || []}
                                                            record={record}
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <DeleteRecordDialog id={record.id} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                                            Nebyly nalezeny žádné záznamy.
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
