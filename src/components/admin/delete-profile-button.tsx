'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteEmployee } from '@/app/actions/profiles'
import { toast } from 'sonner'

interface DeleteProfileButtonProps {
    id: string
}

export function DeleteProfileButton({ id }: DeleteProfileButtonProps) {
    async function handleDelete() {
        if (!confirm('Opravdu chcete smazat tuto osobu? Tato akce smaže i všechna data o její docházce.')) {
            return
        }

        try {
            await deleteEmployee(id)
            toast.success('Osoba byla smazána')
        } catch (error) {
            toast.error('Nepodařilo se smazat osobu')
        }
    }


    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
