'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palmtree, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { requestAbsence } from '@/app/actions/absences'
import { toast } from 'sonner'

export function AbsenceDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [type, setType] = useState('vacation')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const startDate = formData.get('startDate') as string
            const endDate = formData.get('endDate') as string
            const note = formData.get('note') as string

            if (!startDate || !endDate) {
                toast.error('Vyplňte prosím všechna povinná pole')
                return
            }

            await requestAbsence(type, startDate, endDate, note)
            toast.success('Žádost o absenci byla odeslána')
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Nepodařilo se odeslat žádost')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Palmtree className="h-4 w-4" />
                    Požádat o volno
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nová žádost o absenci</DialogTitle>
                        <DialogDescription>
                            Vyberte typ a termín vaší absence. Žádost bude odeslána ke schválení.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Typ absence</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte typ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vacation">Dovolená</SelectItem>
                                    <SelectItem value="sick_leave">Nemocenská</SelectItem>
                                    <SelectItem value="home_office">Home Office</SelectItem>
                                    <SelectItem value="other">Jiné</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Od</Label>
                                <Input id="startDate" name="startDate" type="date" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endDate">Do</Label>
                                <Input id="endDate" name="endDate" type="date" required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note">Poznámka</Label>
                            <Textarea id="note" name="note" placeholder="Důvod nebo detaily..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Odeslat žádost
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
