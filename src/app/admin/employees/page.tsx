import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Search, Eye, Shield, UserCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { DeleteProfileButton } from '@/components/admin/delete-profile-button'
import { AddEmployeeDialog } from '@/components/admin/add-employee-dialog'

export default async function EmployeesPage() {
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

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .order('full_name')

    return (
        <main className="flex-1 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Správa zaměstnanců</h1>
                        <p className="text-zinc-500">Přehled uživatelů a správa jejich přístupových práv.</p>
                    </div>
                    <AddEmployeeDialog />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input className="pl-10" placeholder="Hledat podle jména..." />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Seznam uživatelů</CardTitle>
                        <CardDescription>Celkem {employees?.length || 0} registrovaných uživatelů.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            <div className="divide-y dark:divide-zinc-800">
                                {employees && employees.length > 0 ? (
                                    employees.map((emp) => (
                                        <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {emp.full_name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{emp.full_name}</p>
                                                        {emp.id === user.id && <Badge variant="secondary" className="text-[9px] h-4">To jste vy</Badge>}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="outline" className="text-[10px] h-5 bg-zinc-100 dark:bg-zinc-800 flex gap-1 items-center border-none">
                                                            <UserCircle className="h-3 w-3 text-zinc-500" />
                                                            Osoba
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                                                    <Link href={`/admin/employees/${emp.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Karta
                                                    </Link>
                                                </Button>

                                                <DeleteProfileButton id={emp.id} />
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-zinc-500">
                                        Nebyli nalezeni žádní uživatelé.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
