'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportButtonProps {
    data: any[]
}

export function ExportButton({ data }: ExportButtonProps) {
    const exportToCSV = () => {
        if (!data || data.length === 0) return

        const headers = ['Zaměstnanec', 'Datum', 'Příchod', 'Odchod', 'Trvání', 'Poznámka']
        const csvRows = [headers.join(',')]

        data.forEach(record => {
            const checkInDate = new Date(record.check_in)
            const checkOutDate = record.check_out ? new Date(record.check_out) : null

            let duration = '-'
            if (checkOutDate) {
                const diffInMs = checkOutDate.getTime() - checkInDate.getTime()
                const hours = Math.floor(diffInMs / (1000 * 60 * 60))
                const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
                duration = `${hours}h ${minutes}m`
            }

            const row = [
                `"${record.profiles?.full_name || ''}"`,
                `"${checkInDate.toLocaleDateString('cs-CZ')}"`,
                `"${checkInDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}"`,
                `"${checkOutDate ? checkOutDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '-'}"`,
                `"${duration}"`,
                `"${(record.notes || '').replace(/"/g, '""')}"`
            ]
            csvRows.push(row.join(','))
        })

        const csvContent = '\uFEFF' + csvRows.join('\n') // Add BOM for Excel UTF-8
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `dochazka_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportovat CSV
        </Button>
    )
}
