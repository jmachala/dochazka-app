'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { cs } from 'date-fns/locale'
import { adminCreateRecord, adminUpdateRecord } from '@/app/actions/admin'
import { toast } from 'sonner'

interface RecordDialogProps {
    employees?: any[]
    record?: any // For editing
    trigger?: React.ReactNode
}

export function RecordDialog({ employees, record, trigger }: RecordDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [employeeId, setEmployeeId] = useState(record?.employee_id || '')
    const [date, setDate] = useState<Date | undefined>(record ? new Date(record.check_in) : new Date())
    const [checkInTime, setCheckInTime] = useState(record ? format(new Date(record.check_in), 'HH:mm') : '08:00')
    const [checkOutTime, setCheckOutTime] = useState(record?.check_out ? format(new Date(record.check_out), 'HH:mm') : '')
    const [notes, setNotes] = useState(record?.notes || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!employeeId || !date || !checkInTime) {
            toast.error('Prosim vyplňte všechna povinná pole.')
            return
        }

        setLoading(true)
        try {
            const checkInDate = new Date(date)
            const [inH, inM] = checkInTime.split(':').map(Number)
            checkInDate.setHours(inH, inM, 0, 0)

            let checkOutDate: Date | undefined
            if (checkOutTime) {
                checkOutDate = new Date(date)
                const [outH, outM] = checkOutTime.split(':').map(Number)
                checkOutDate.setHours(outH, outM, 0, 0)

                if (checkOutDate <= checkInDate) {
                    toast.error('Odchod musí být po příchodu.')
                    setLoading(false)
                    return
                }
            }

            if (record) {
                await adminUpdateRecord(record.id, {
                    check_in: checkInDate.toISOString(),
                    check_out: checkOutDate?.toISOString(),
                    notes
                })
                toast.success('Záznam byl aktualizován.')
            } else {
                await adminCreateRecord({
                    employee_id: employeeId,
                    check_in: checkInDate.toISOString(),
                    check_out: checkOutDate?.toISOString(),
                    notes
                })
                toast.success('Záznam byl vytvořen.')
            }
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Něco se nepovedlo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Přidat záznam
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{record ? 'Upravit záznam' : 'Ruční přidání docházky'}</DialogTitle>
                    <DialogDescription>
                        {record ? 'Upravte údaje o docházce zaměstnance.' : 'Vytvořte nový záznam pro zaměstnance, který se zapomněl evidovat.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Zaměstnanec</Label>
                        <Select
                            disabled={!!record || loading}
                            onValueChange={setEmployeeId}
                            defaultValue={employeeId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Vyberte zaměstnance" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees?.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Datum</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={loading}
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: cs }) : <span>Vyberte datum</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    locale={cs}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Příchod</Label>
                            <Input
                                type="time"
                                value={checkInTime}
                                onChange={e => setCheckInTime(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Odchod</Label>
                            <Input
                                type="time"
                                value={checkOutTime}
                                onChange={e => setCheckOutTime(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Poznámka</Label>
                        <Textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Důvod ručního zadání..."
                            disabled={loading}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Zrušit
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Ukládám...' : record ? 'Uložit změny' : 'Vytvořit záznam'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
