import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AbsenceStatusButtons } from '@/components/admin/absence-status-buttons'

export default async function AdminAbsencesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/attendance')

    const { data: absences } = await supabase
        .from('absences')
        .select(`
            *,
            profiles (
                full_name
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <main className="flex-1 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Správa absencí</h1>
                    <p className="text-zinc-500">Schvalování dovolených, nemocenských a dalších nepřítomností.</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Žádosti ke schválení</CardTitle>
                            <CardDescription>Seznam všech evidovaných absencí.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Zaměstnanec</TableHead>
                                        <TableHead>Typ</TableHead>
                                        <TableHead>Termín</TableHead>
                                        <TableHead>Poznámka</TableHead>
                                        <TableHead>Stav</TableHead>
                                        <TableHead className="text-right">Akce</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {absences && absences.length > 0 ? (
                                        absences.map((abs: any) => (
                                            <TableRow key={abs.id}>
                                                <TableCell className="font-medium">
                                                    {abs.profiles?.full_name}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {abs.type === 'vacation' ? 'Dovolená' :
                                                        abs.type === 'sick_leave' ? 'Nemoc' :
                                                            abs.type === 'home_office' ? 'Home Office' : 'Jiné'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(abs.start_date).toLocaleDateString('cs-CZ')} - {new Date(abs.end_date).toLocaleDateString('cs-CZ')}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-xs text-zinc-500">
                                                    {abs.note || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={abs.status === 'approved' ? 'default' : abs.status === 'pending' ? 'outline' : 'destructive'}>
                                                        {abs.status === 'approved' ? 'Schváleno' :
                                                            abs.status === 'pending' ? 'Čeká' : 'Zamítnuto'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {abs.status === 'pending' && (
                                                        <AbsenceStatusButtons id={abs.id} />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                                Žádné žádosti k vyřízení.
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
    )
}
