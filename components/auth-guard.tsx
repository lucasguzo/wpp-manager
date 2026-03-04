"use client"

import { useState, useEffect, ReactNode } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { verifyManagerApiKey } from "@/app/actions/auth"

interface AuthGuardProps {
    children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
    const [apiKey, setApiKey] = useState("")
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function checkSavedKey() {
            const savedKey = localStorage.getItem("@wpp-manager:apikey")
            const result = await verifyManagerApiKey(savedKey)
            setIsConfigured(result.isConfigured)
            setIsAuthenticated(result.isValid)
        }
        checkSavedKey()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const result = await verifyManagerApiKey(apiKey)
        if (result.isValid) {
            localStorage.setItem("@wpp-manager:apikey", apiKey)
            setIsAuthenticated(true)
            setError(false)
        } else {
            setError(true)
        }
        setIsLoading(false)
    }

    // Enquanto verifica o storage, mostra loading
    if (isAuthenticated === null || isConfigured === null) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    // Tela bloqueada por falta de configuração no sevidor
    if (isConfigured === false) {
        return (
            <div className="min-h-screen grid place-items-center p-6 bg-muted/20">
                <div className="w-full max-w-md p-8 bg-background rounded-2xl border border-destructive shadow-sm">
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold">!</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-destructive">Sistema Bloqueado</h1>
                        <p className="text-sm text-foreground">
                            A variável de ambiente <strong className="font-mono bg-muted px-1.5 py-0.5 rounded">MANAGER_API_KEY</strong> não foi localizada no servidor.
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Por razões de segurança, este painel não pode ser utilizado sem uma chave de acesso definida.
                            Configure-a nas variáveis de ambiente do seu Portainer/Docker e recarregue o container.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Tela de bloqueio
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen grid place-items-center p-6 bg-muted/20">
                <div className="w-full max-w-sm p-8 bg-background rounded-2xl border shadow-sm">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">WPP-Manager</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Acesso Restrito. Insira a API Key para continuar.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Sua API Key"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {error && <p className="text-sm text-destructive">Chave inválida.</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verificando..." : "Entrar"}
                        </Button>          </form>
                </div>
            </div>
        )
    }

    // Se autenticado, mostra o app
    return <>{children}</>
}
