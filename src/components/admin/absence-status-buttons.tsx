'use client'

import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { updateAbsenceStatus } from '@/app/actions/absences'
import { toast } from 'sonner'

interface AbsenceStatusButtonsProps {
    id: string
}

export function AbsenceStatusButtons({ id }: AbsenceStatusButtonsProps) {
    async function handleUpdate(status: 'approved' | 'rejected') {
        try {
            await updateAbsenceStatus(id, status)
            toast.success(status === 'approved' ? 'Absence byla schválena' : 'Absence byla zamítnuta')
        } catch (error) {
            toast.error('Nepodařilo se aktualizovat stav')
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleUpdate('approved')}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleUpdate('rejected')}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}
