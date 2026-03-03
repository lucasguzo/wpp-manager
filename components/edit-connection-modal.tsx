"use client"

import { useState, useEffect } from "react"
import { editSession } from "@/app/actions/whatsapp"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle } from "lucide-react"

interface SessionData {
    sessionId: string
    storeName: string
    webhook?: string | null
}

export function EditConnectionModal({
    session,
    open,
    onOpenChange
}: {
    session: SessionData,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [storeName, setStoreName] = useState("")
    const [webhook, setWebhook] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && session) {
            setStoreName(session.storeName || "")
            setWebhook(session.webhook || "")
        }
    }, [open, session])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!storeName.trim()) return

        try {
            setLoading(true)
            await editSession(session.sessionId, { storeName, webhook })
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            alert("Erro ao editar o dispositivo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Dispositivo</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6 mt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome do Dispositivo</Label>
                            <Input
                                id="edit-name"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-webhook">URL de Webhook</Label>
                            <Input
                                id="edit-webhook"
                                type="url"
                                placeholder="https://..."
                                value={webhook}
                                onChange={(e) => setWebhook(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 text-amber-600 p-3 rounded-md flex gap-3 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Alterações no Webhook só entrarão em vigor após você <b>Desconectar</b> e <b>Conectar</b> o aparelho novamente via WPPConnect.</p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
