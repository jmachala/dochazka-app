'use client'

import { Button } from '@/components/ui/button'
import { updateProfileRole } from '@/app/actions/profiles'
import { toast } from 'sonner'

interface RoleToggleButtonProps {
    id: string
    currentRole: string
}

export function RoleToggleButton({ id, currentRole }: RoleToggleButtonProps) {
    async function handleToggle() {
        try {
            const newRole = currentRole === 'admin' ? 'employee' : 'admin'
            await updateProfileRole(id, newRole)
            toast.success(`Role změněna na ${newRole === 'admin' ? 'Administrátor' : 'Zaměstnanec'}`)
        } catch (error) {
            toast.error('Nepodařilo se změnit roli')
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleToggle}
        >
            Povýšit/Snížit
        </Button>
    )
}
