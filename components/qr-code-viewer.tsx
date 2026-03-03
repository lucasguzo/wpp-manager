"use client"

import { useCallback, useEffect, useState } from "react"
import { getSessionStatus } from "@/app/actions/whatsapp"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export function QrCodeViewer({ sessionId, onConnected }: { sessionId: string, onConnected?: () => void }) {
    const [qrcode, setQrcode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const handleConnected = useCallback(() => {
        if (onConnected) onConnected()
    }, [onConnected])

    useEffect(() => {
        const fetchStatus = async () => {
            const data = await getSessionStatus(sessionId)
            if (data.status === "QRCODE" && data.qrcode) {
                setQrcode(data.qrcode)
                setLoading(false)
            } else if (data.status === "CONNECTED") {
                setQrcode(null)
                setLoading(false)
                clearInterval(interval)
                handleConnected()
            } else if (data.status === "DISCONNECTED") {
                setLoading(false)
                clearInterval(interval)
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 3000)

        return () => clearInterval(interval)
    }, [sessionId, handleConnected])

    if (loading && !qrcode) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Inicializando WhatsApp Web...</p>
            </div>
        )
    }

    if (qrcode) {
        return (
            <div className="flex flex-col items-center p-4">
                <Image
                    src={qrcode}
                    alt="QR Code WhatsApp"
                    width={256}
                    height={256}
                    className="rounded-xl border shadow-sm"
                    unoptimized
                />
                <p className="mt-6 text-sm text-balance text-center text-muted-foreground">
                    Abra o WhatsApp no seu celular, toque em <b>Aparelhos conectados</b> e aponte a câmera para esta tela.
                </p>
            </div>
        )
    }

    return <p className="text-sm text-green-600 font-medium p-4 text-center">Conectado com sucesso!</p>
}
