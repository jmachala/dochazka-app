import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Lock, Save } from 'lucide-react'
import Link from 'next/link'
import { SettingsForm } from '@/components/auth/settings-form'

export default async function SettingsPage() {
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

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-10 border-b bg-white/80 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/attendance">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight">Nastavení účtu</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 p-4 py-8 space-y-8">
                <SettingsForm profile={profile} />
            </main>
        </div>
    )
}
