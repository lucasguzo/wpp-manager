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
    const [apiKey, setApiKey] = useState("")
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function checkSavedKey() {
            const savedKey = localStorage.getItem("@wpp-manager:apikey")
            // Se não tem chave salva, testamos enviando null (pois se a env var MANAGER_API_KEY não estiver setada, ele deixa passar)
            const isValid = await verifyManagerApiKey(savedKey)
            setIsAuthenticated(isValid)
        }
        checkSavedKey()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const isValid = await verifyManagerApiKey(apiKey)
        if (isValid) {
            localStorage.setItem("@wpp-manager:apikey", apiKey)
            setIsAuthenticated(true)
            setError(false)
        } else {
            setError(true)
        }
        setIsLoading(false)
    }

    // Enquanto verifica o storage, mostra loading
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
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
