"use client"

import { useState } from "react"
import { createSession } from "@/app/actions/whatsapp"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function NewConnectionModal() {
    const [open, setOpen] = useState(false)
    const [storeName, setStoreName] = useState("")
    const [webhook, setWebhook] = useState("")
    const [loading, setLoading] = useState(false)

    const [chatwootEnabled, setChatwootEnabled] = useState(false)
    const [chatwootAccountId, setChatwootAccountId] = useState("")
    const [chatwootToken, setChatwootToken] = useState("")
    const [chatwootUrl, setChatwootUrl] = useState("")

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!storeName.trim()) return

        try {
            setLoading(true)
            await createSession(
                storeName,
                webhook,
                chatwootEnabled ? parseInt(chatwootAccountId) || undefined : undefined,
                chatwootEnabled ? chatwootToken : undefined,
                chatwootEnabled ? chatwootUrl : undefined
            )
            setOpen(false)
            setStoreName("")
            setWebhook("")
            setChatwootEnabled(false)
            setChatwootAccountId("")
            setChatwootToken("")
            setChatwootUrl("")
        } catch (error) {
            console.error(error)
            toast.error("Houve um erro ao inicializar os protocolos WPPConnect.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Cadastrar Dispositivo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Conexão WPP</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6 mt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Dispositivo</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Matriz São Paulo"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="webhook" className="text-muted-foreground">URL de Webhook (Opcional)</Label>
                            <Input
                                id="webhook"
                                type="url"
                                placeholder="https://seu-sistema.com.br/api/webhook"
                                value={webhook}
                                onChange={(e) => setWebhook(e.target.value)}
                                disabled={loading}
                            />
                            <p className="text-[11px] text-muted-foreground">O WPPConnect enviará os eventos (mensagens, status) para esta URL.</p>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 pb-1">
                            <Switch id="chatwoot" checked={chatwootEnabled} onCheckedChange={setChatwootEnabled} />
                            <Label htmlFor="chatwoot">Integrar com Chatwoot</Label>
                        </div>
                        {chatwootEnabled && (
                            <div className="space-y-4 pt-2 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="chatwootAccountId">Account ID</Label>
                                    <Input
                                        id="chatwootAccountId"
                                        type="number"
                                        placeholder="Ex: 1"
                                        value={chatwootAccountId}
                                        onChange={(e) => setChatwootAccountId(e.target.value)}
                                        disabled={loading}
                                        required={chatwootEnabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chatwootToken">Access Token</Label>
                                    <Input
                                        id="chatwootToken"
                                        placeholder="Seu token de acesso do Chatwoot"
                                        value={chatwootToken}
                                        onChange={(e) => setChatwootToken(e.target.value)}
                                        disabled={loading}
                                        required={chatwootEnabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chatwootUrl">URL Base do Chatwoot</Label>
                                    <Input
                                        id="chatwootUrl"
                                        type="url"
                                        placeholder="Ex: https://app.chatwoot.com"
                                        value={chatwootUrl}
                                        onChange={(e) => setChatwootUrl(e.target.value)}
                                        disabled={loading}
                                        required={chatwootEnabled}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {loading ? "Preparando Ambiente..." : "Confirmar e Iniciar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
