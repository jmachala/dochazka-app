'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { adminDeleteRecord } from "@/app/actions/admin"
import { useState } from "react"
import { toast } from "sonner"

interface DeleteRecordProps {
    id: string
}

export function DeleteRecordDialog({ id }: DeleteRecordProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await adminDeleteRecord(id)
            toast.success('Záznam smazán.')
        } catch (error: any) {
            toast.error(error.message || 'Chyba při mazání.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Opravdu chcete smazat tento záznam?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tato akce je nevratná a záznam bude trvale odstraněn z databáze i statistik.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Zrušit</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? 'Mažu...' : 'Smazat záznam'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
