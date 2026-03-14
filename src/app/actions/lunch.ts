'use server'

import * as cheerio from 'cheerio'
import iconv from 'iconv-lite'

export interface MenuItem {
    name: string;
    price: string;
    isSoup: boolean;
}

export interface RestaurantMenu {
    restaurantName: string;
    phone?: string;
    items: MenuItem[];
}

export async function getLunchMenus(): Promise<RestaurantMenu[]> {
    try {
        const response = await fetch('https://www.menicka.cz/uhersky-brod.html', {
            // Revalidate every 30 minutes for fresher data
            next: { revalidate: 1800 }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch lunch menus')
        }

        const buffer = await response.arrayBuffer()
        const html = iconv.decode(Buffer.from(buffer), 'win1250')
        const $ = cheerio.load(html)
        const menus: (RestaurantMenu & { phoneUrl?: string })[] = []

        $('.menicka_detail').each((i, el) => {
            const restaurantName = $(el).find('.hlavicka .nazev').text().trim()
            if (!restaurantName) return

            // Look for the "zavolat" link
            const callLink = $(el).find('.hlavicka .telefon a.zavolat').attr('href')
            const phoneUrl = callLink ? (callLink.startsWith('.') ? `https://www.menicka.cz${callLink.substring(1)}` : callLink) : undefined

            let phoneFromText = ''
            // Keep the text-based backup search
            $(el).find('.menicka .gray .doplnujici_info').each((k, info) => {
                const text = $(info).text()
                const phoneMatch = text.match(/(?:tel\.|čísle:|tel:)\s*([\d\s]{9,15})/i)
                if (phoneMatch && !phoneFromText) {
                    phoneFromText = phoneMatch[1].trim()
                }
            })

            const items: MenuItem[] = []
            $(el).find('.menicka > div').each((j, div) => {
                const className = $(div).attr('class') || ''
                if (className.includes('nabidka')) {
                    const text = $(div).text().trim()
                    const price = $(div).next('.cena').text().trim()
                    const isSoup = $(div).prev('div[class^="poradi"]').length === 0
                    
                    if (text && !text.includes('Nebylo zadáno') && !text.includes('Restaurace má tento den zavřeno')) {
                        items.push({
                            name: text.replace(/\s+/g, ' '),
                            price: price || '',
                            isSoup
                        })
                    }
                }
            })

            if (items.length > 0) {
                menus.push({ restaurantName, phone: phoneFromText, items, phoneUrl })
            }
        })

        // Fetch phone numbers from URLs in parallel
        await Promise.all(menus.map(async (menu) => {
            if (menu.phoneUrl && !menu.phone) {
                try {
                    const phoneRes = await fetch(menu.phoneUrl, { next: { revalidate: 86400 } }) // Cache phone numbers for a day
                    if (phoneRes.ok) {
                        menu.phone = (await phoneRes.text()).trim()
                    }
                } catch (e) {
                    console.error(`Failed to fetch phone for ${menu.restaurantName}`)
                }
            }
            delete menu.phoneUrl
        }))

        return menus
    } catch (error) {
        console.error('Error fetching lunch menus:', error)
        return []
    }
}
