'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { createEmployee } from '@/app/actions/profiles'
import { toast } from 'sonner'

export function AddEmployeeDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const fullName = formData.get('fullName') as string

        try {
            await createEmployee(email, fullName)
            toast.success('Zaměstnanec byl úspěšně vytvořen')
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Nepodařilo se vytvořit zaměstnance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat zaměstnance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nový zaměstnanec</DialogTitle>
                    <DialogDescription>
                        Vytvořte účet pro nového kolegu. Dočasné heslo bude nastaveno na: <code className="bg-zinc-100 px-1 rounded">Password123!</code>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Celé jméno</Label>
                        <Input id="fullName" name="fullName" placeholder="Jan Novák" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="jan.novak@firma.cz" required />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Zrušit</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Vytvořit účet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
