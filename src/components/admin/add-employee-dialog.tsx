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
        const fullName = formData.get('fullName') as string

        try {
            await createEmployee(fullName)
            toast.success('Osoba byla úspěšně vytvořena')
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Nepodařilo se vytvořit záznam')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat osobu k pípání
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Přidat novou osobu</DialogTitle>
                    <DialogDescription>
                        Zadejte jméno osoby, která se bude moci pípat na terminálu.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Celé jméno</Label>
                        <Input id="fullName" name="fullName" placeholder="Jan Novák" className="rounded-xl" required />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Zrušit</Button>
                        <Button type="submit" className="rounded-xl" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Přidat osobu'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
