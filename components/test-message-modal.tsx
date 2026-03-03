"use client"

import { useState } from "react"
import { sendTestMessage } from "@/app/actions/whatsapp"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface SessionItem {
    id: string
    sessionId: string
    storeName: string
    status: string
}

export function TestMessageModal({ sessions }: { sessions: SessionItem[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })

    const [selectedSession, setSelectedSession] = useState<string>("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState("")

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedSession || !phone || !message) {
            setStatus({ type: "error", message: "Preencha todos os campos." })
            return
        }

        try {
            setLoading(true)
            setStatus({ type: null, message: "" })
            const result = await sendTestMessage(selectedSession, phone, message)

            if (result.success) {
                setStatus({ type: "success", message: "Mensagem enviada com sucesso!" })
                setPhone("")
                setMessage("")
            } else {
                setStatus({ type: "error", message: result.error || "Erro ao enviar a mensagem." })
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Falha na comunicação."
            setStatus({ type: "error", message: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    const connectedSessions = sessions.filter(s => s.status === "CONNECTED")

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); setStatus({ type: null, message: "" }) }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm border-dashed">
                    <Send className="w-4 h-4 mr-2" /> Testar Envio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enviar Mensagem de Teste</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label>Sessão de Origem</Label>
                        <Select value={selectedSession} onValueChange={setSelectedSession} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um aparelho conectado" />
                            </SelectTrigger>
                            <SelectContent>
                                {connectedSessions.length === 0 ? (
                                    <SelectItem value="none" disabled>Nenhum aparelho Online</SelectItem>
                                ) : (
                                    connectedSessions.map(s => (
                                        <SelectItem key={s.id} value={s.sessionId}>{s.storeName}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Número de Destino</Label>
                        <Input
                            placeholder="Ex: 5511999999999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">Inclua DDI e DDD, apenas números.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Mensagem</Label>
                        <Textarea
                            placeholder="Digite a mensagem de teste..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {status.type === "success" && (
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>{status.message}</span>
                        </div>
                    )}
                    {status.type === "error" && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-md text-sm flex items-start gap-2 break-all">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{status.message}</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading || connectedSessions.length === 0}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {loading ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
