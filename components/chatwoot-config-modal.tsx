"use client"

import { useState } from "react"
import { configureChatwoot } from "@/app/actions/whatsapp"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type ChatwootConfigModalProps = {
    session: {
        sessionId: string
        chatwootAccountId?: number | null
        chatwootToken?: string | null
        chatwootUrl?: string | null
    }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChatwootConfigModal({ session, open, onOpenChange }: ChatwootConfigModalProps) {
    const [accountId, setAccountId] = useState(session.chatwootAccountId?.toString() || "")
    const [token, setToken] = useState(session.chatwootToken || "")
    const [url, setUrl] = useState(session.chatwootUrl || "")
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setLoading(true)
            await configureChatwoot(
                session.sessionId,
                accountId ? parseInt(accountId) : null,
                token || null,
                url || null
            )
            toast.success("Configurações do Chatwoot salvas com sucesso.")
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Houve um erro ao atualizar os dados do Chatwoot no protocolo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configurar Chatwoot</DialogTitle>
                    <DialogDescription>
                        Informe as credenciais do seu Chatwoot. Você também pode apagar os campos e salvar para remover a configuração.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6 mt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountId">Account ID</Label>
                            <Input
                                id="accountId"
                                type="number"
                                placeholder="Ex: 1"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="token">Access Token</Label>
                            <Input
                                id="token"
                                placeholder="Seu token de acesso do Chatwoot"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL Base do Chatwoot</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="Ex: https://app.chatwoot.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {loading ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
