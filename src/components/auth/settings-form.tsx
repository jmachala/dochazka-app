'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Loader2 } from 'lucide-react'
import { updatePassword, updateProfileName } from '@/app/actions/auth'
import { toast } from 'sonner'

export function SettingsForm({ profile }: { profile: any }) {
    const [nameLoading, setNameLoading] = useState(false)
    const [passLoading, setPassLoading] = useState(false)

    async function handleNameUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setNameLoading(true)
        const formData = new FormData(e.currentTarget)
        const fullName = formData.get('fullName') as string

        try {
            await updateProfileName(fullName)
            toast.success('Jméno bylo aktualizováno')
        } catch (error: any) {
            toast.error(error.message || 'Chyba při aktualizaci jména')
        } finally {
            setNameLoading(false)
        }
    }

    async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setPassLoading(true)
        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword !== confirmPassword) {
            toast.error('Hesla se neshodují')
            setPassLoading(false)
            return
        }

        if (newPassword.length < 6) {
            toast.error('Heslo musí mít alespoň 6 znaků')
            setPassLoading(false)
            return
        }

        try {
            await updatePassword(newPassword)
            toast.success('Heslo bylo úspěšně změněno')
            e.currentTarget.reset()
        } catch (error: any) {
            toast.error(error.message || 'Chyba při změně hesla')
        } finally {
            setPassLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Osobní údaje</CardTitle>
                    </div>
                    <CardDescription>Změňte své jméno, které uvidí ostatní kolegové.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleNameUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Celé jméno</Label>
                            <Input id="fullName" name="fullName" defaultValue={profile?.full_name} required />
                        </div>
                        <Button type="submit" disabled={nameLoading}>
                            {nameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Uložit změny
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Změna hesla</CardTitle>
                    </div>
                    <CardDescription>Pro zabezpečení účtu zvolte silné heslo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nové heslo</Label>
                            <Input id="newPassword" name="newPassword" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                        <Button type="submit" disabled={passLoading}>
                            {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Změnit heslo
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
