"use client"

import { disconnectSession, deleteSession, reconnectSession } from "@/app/actions/whatsapp"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Smartphone, Power, Trash2, QrCode, RefreshCcw, Loader2, MoreVertical, Edit2, Key, Check, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { QrCodeViewer } from "./qr-code-viewer"
import { EditConnectionModal } from "./edit-connection-modal"
import { ChatwootConfigModal } from "./chatwoot-config-modal"
import { useEffect, useState } from "react"
import { getSessionStatus, checkConnectionSession } from "@/app/actions/whatsapp"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
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

export type SessionProps = {
    id: string
    storeName: string
    sessionId: string
    status: string
    token?: string | null
    webhook?: string | null
    chatwootAccountId?: number | null
    chatwootToken?: string | null
    chatwootUrl?: string | null
}

const statusConfig = {
    CONNECTED: { label: "Online", color: "bg-green-500", dot: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" },
    DISCONNECTED: { label: "Offline", color: "bg-red-500", dot: "bg-rose-500" },
    CONNECTING: { label: "Conectando...", color: "bg-yellow-500", dot: "bg-amber-400 animate-pulse" },
    QRCODE: { label: "Requer Autenticação", color: "bg-blue-500", dot: "bg-blue-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" },
}

export function SessionCard({ session: initialSession }: { session: SessionProps }) {
    const [session, setSession] = useState(initialSession)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isChatwootDialogOpen, setIsChatwootDialogOpen] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setSession(initialSession)
    }, [initialSession])

    // Polling rápido (5s) para sessões em CONNECTING ou QRCODE
    useEffect(() => {
        if (session.status !== "CONNECTING" && session.status !== "QRCODE") return;

        const interval = setInterval(async () => {
            const data = await getSessionStatus(session.sessionId)
            if (data.status !== session.status) {
                setSession(prev => ({ ...prev, status: data.status }))
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [session.status, session.sessionId])

    // Health check real (60s) — verifica se o aparelho está realmente conectado
    // Roda no mount + a cada 60 segundos para detectar desconexões
    useEffect(() => {
        if (session.status !== "CONNECTED") return;

        // Verificação imediata ao montar/quando ficar CONNECTED
        const checkNow = async () => {
            const data = await checkConnectionSession(session.sessionId)
            if (data.status !== session.status) {
                setSession(prev => ({ ...prev, status: data.status }))
            }
        }
        checkNow()

        const interval = setInterval(checkNow, 60_000) // 1 minuto

        return () => clearInterval(interval)
    }, [session.status, session.sessionId])

    const config = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.DISCONNECTED

    const handleCopyToken = async () => {
        if (!session.token) {
            toast.warning("Token ainda não gerado. Conecte o aparelho primeiro.")
            return
        }
        await navigator.clipboard.writeText(session.token)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="flex flex-col shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    {session.storeName}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{config.label}</span>
                    <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                Editar Aparelho
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsChatwootDialogOpen(true)}>
                                <MessageCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                                Configurar Chatwoot
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopyToken}>
                                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Key className="w-4 h-4 mr-2 text-muted-foreground" />}
                                {copied ? "Token Copiado!" : "Copiar Token da API"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="flex-1 mt-1">
                <p className="text-xs text-muted-foreground truncate">
                    Hash: <span className="font-mono text-foreground/70">{session.sessionId}</span>
                </p>
            </CardContent>

            <CardFooter className="pt-5 border-t flex items-center justify-between gap-3 bg-muted/20">
                {(session.status === "QRCODE" || session.status === "CONNECTING") && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="default"
                                className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                                onClick={async () => {
                                    if (session.status === "QRCODE") {
                                        setSession(prev => ({ ...prev, status: "CONNECTING" }))
                                        await reconnectSession(session.sessionId)
                                    }
                                }}
                            >
                                <QrCode className="w-4 h-4 mr-2" /> {session.status === "CONNECTING" ? "Processando QR Code..." : "Ler QR Code"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-2">
                            <QrCodeViewer sessionId={session.sessionId} onConnected={() => setIsDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}

                {session.status === "CONNECTED" && (
                    <Button size="sm" variant="outline" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        disabled={isActionLoading}
                        onClick={async () => {
                            setIsActionLoading(true)
                            setSession(prev => ({ ...prev, status: "DISCONNECTED" }))
                            await disconnectSession(session.sessionId)
                            setIsActionLoading(false)
                        }}>
                        {isActionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Power className="w-4 h-4 mr-2" />}
                        Desconectar
                    </Button>
                )}

                {session.status === "DISCONNECTED" && (
                    <Button size="sm" variant="secondary" className="w-full"
                        disabled={isActionLoading}
                        onClick={async () => {
                            setIsActionLoading(true)
                            setSession(prev => ({ ...prev, status: "CONNECTING" }))
                            await reconnectSession(session.sessionId)
                            setIsActionLoading(false)
                        }}>
                        {isActionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                        Conectar Aparelho
                    </Button>
                )}

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Aparelho?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso removerá o aparelho &quot;{session.storeName}&quot; permanentemente e desconectará a sessão ativa.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Limpar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSession(session.id, session.sessionId)} className="bg-rose-600 hover:bg-rose-700">
                                Sim, excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>

            <EditConnectionModal
                session={session}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />

            <ChatwootConfigModal
                session={session}
                open={isChatwootDialogOpen}
                onOpenChange={setIsChatwootDialogOpen}
            />
        </Card>
    )
}
