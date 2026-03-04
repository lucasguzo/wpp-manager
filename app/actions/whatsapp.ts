"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/prisma"
import { SessionStatus } from "@prisma/client"

const WPPCONNECT_URL = process.env.WPPCONNECT_URL || "http://localhost:21465"
const WPPCONNECT_SECRET = process.env.WPPCONNECT_SECRET_KEY || "SUA_CHAVE_SECRETA"

// Função para gerar ou recuperar o token seguro do banco
async function getWppToken(sessionId: string, forceNewToken = false) {
    if (!forceNewToken) {
        const session = await db.whatsappSession.findUnique({ where: { sessionId } })

        // Se o token já existe no banco, retorna ele para conexões rápidas
        if (session?.token) {
            return session.token
        }
    }

    // Se não existir, gera um novo no WPPConnect Server e arquiva permanentemente
    const secretEncoded = encodeURIComponent(WPPCONNECT_SECRET)
    const url = `${WPPCONNECT_URL}/api/${sessionId}/${secretEncoded}/generate-token`
    const response = await fetch(url, { method: "POST", cache: 'no-store' })

    if (!response.ok) {
        const text = await response.text()
        console.error("Erro ao gerar token dinâmico:", text)
        throw new Error("Invalid secret key or WPPConnect offline")
    }

    const data = await response.json()
    const newToken = data.token

    // Armazena no banco de dados para que não se perca num restart
    await db.whatsappSession.update({
        where: { sessionId },
        data: { token: newToken }
    })

    return newToken
}

// Helper genérico para chamadas sendo autenticado pelo Token JWT da sessão
async function wppconnectFetch(sessionId: string, endpoint: string, options: RequestInit = {}, forceNewToken = false) {
    const token = await getWppToken(sessionId, forceNewToken) // Pega o JWT fresco da sessão

    const url = `${WPPCONNECT_URL}${endpoint}`
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Repassa o JWT na estrutura correta!
        ...options.headers,
    }

    const response = await fetch(url, { ...options, headers })
    if (!response.ok) {
        const errorDetails = await response.text()
        console.error(`WPPConnect API Error (${endpoint}):`, errorDetails)
        throw new Error(`Failed to fetch ${endpoint}`)
    }
    return response.json()
}

export async function createSession(
    storeName: string,
    webhook?: string,
    chatwootAccountId?: number,
    chatwootToken?: string,
    chatwootUrl?: string
) {
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    const sessionId = `${slug}_${Date.now()}`

    const session = await db.whatsappSession.create({
        data: {
            storeName,
            sessionId,
            webhook: webhook || null,
            status: SessionStatus.CONNECTING,
            chatwootAccountId,
            chatwootToken,
            chatwootUrl
        },
    })

    try {
        // Força a geração de um NOVO token sempre que for recriar a sessão
        await wppconnectFetch(sessionId, `/api/${sessionId}/start-session`, {
            method: "POST",
            body: JSON.stringify({
                waitQrCode: true,
                ...(webhook ? { webhook } : {})
            })
        }, true)

        // Se os dados do chatwoot estiverem presentes, configurar o endpoint do chatwoot no WPPConnect
        if (chatwootAccountId && chatwootToken && chatwootUrl) {
            try {
                await wppconnectFetch(sessionId, `/api/${sessionId}/chatwoot`, {
                    method: "POST",
                    body: JSON.stringify({
                        accountId: chatwootAccountId,
                        token: chatwootToken,
                        url: chatwootUrl,
                        signMsg: true
                    })
                })
                console.log(`Chatwoot configurado para a sessão ${sessionId}`)
            } catch (err) {
                console.error("Erro ao configurar chatwoot para a sessão:", err)
            }
        }

        revalidatePath("/")
        return { success: true, session }
    } catch (error) {
        console.error("Erro start-session:", error)
        await db.whatsappSession.update({
            where: { id: session.id },
            data: { status: SessionStatus.DISCONNECTED },
        })
    }
}

export async function reconnectSession(sessionId: string) {
    const session = await db.whatsappSession.findUnique({ where: { sessionId } })
    await db.whatsappSession.update({
        where: { sessionId },
        data: { status: SessionStatus.CONNECTING },
    })

    try {
        await wppconnectFetch(sessionId, `/api/${sessionId}/start-session`, {
            method: "POST",
            body: JSON.stringify({
                waitQrCode: true,
                ...(session?.webhook ? { webhook: session.webhook } : {})
            })
        }, true) // Força token novo
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Erro reconnect-session:", error)
        await db.whatsappSession.update({
            where: { sessionId },
            data: { status: SessionStatus.DISCONNECTED },
        })
        throw new Error("Falha ao reconectar a sessão.")
    }
}

export async function getSessionStatus(sessionId: string) {
    try {
        const response = await wppconnectFetch(sessionId, `/api/${sessionId}/status-session`, {
            method: "GET", cache: 'no-store'
        })

        const statusMap: Record<string, SessionStatus> = {
            isLogged: SessionStatus.CONNECTED,
            qrReadSuccess: SessionStatus.CONNECTED,
            inChat: SessionStatus.CONNECTED,
            CONNECTED: SessionStatus.CONNECTED,
            qrReadFail: SessionStatus.QRCODE,
            autocloseCalled: SessionStatus.DISCONNECTED,
            desconnectedMobile: SessionStatus.DISCONNECTED,
            notLogged: SessionStatus.DISCONNECTED,
        }

        let currentStatus = statusMap[response.status] || SessionStatus.CONNECTING
        let qrcode: string | null = null

        if (currentStatus === SessionStatus.CONNECTED) {
            qrcode = null // Força a remoção do QR Code se já conectou
        } else if (response.qrcode || response.status === 'qrReadFail' || response.status === 'notLogged') {
            currentStatus = SessionStatus.QRCODE
            qrcode = response.qrcode
        }

        await db.whatsappSession.update({
            where: { sessionId },
            data: { status: currentStatus, qrcode },
        })

        return { status: currentStatus, qrcode }
    } catch (error) {
        console.error("Erro status:", error)
        return { status: SessionStatus.DISCONNECTED, qrcode: null }
    }
}

export async function checkConnectionSession(sessionId: string) {
    try {
        const response = await wppconnectFetch(sessionId, `/api/${sessionId}/check-connection-session`, {
            method: "GET", cache: 'no-store'
        })

        // The check-connection-session endpoint returns the actual phone connection state
        const isConnected = response.status === true || response.status === "CONNECTED" || response.result === true

        const newStatus = isConnected ? SessionStatus.CONNECTED : SessionStatus.DISCONNECTED

        await db.whatsappSession.update({
            where: { sessionId },
            data: { status: newStatus },
        })

        return { status: newStatus }
    } catch (error) {
        console.error("Erro check-connection-session:", error)
        // Se der erro na chamada, marca como desconectado
        await db.whatsappSession.update({
            where: { sessionId },
            data: { status: SessionStatus.DISCONNECTED },
        })
        return { status: SessionStatus.DISCONNECTED }
    }
}

export async function disconnectSession(sessionId: string) {
    await wppconnectFetch(sessionId, `/api/${sessionId}/close-session`, { method: "POST" })
    await db.whatsappSession.update({
        where: { sessionId },
        data: { status: SessionStatus.DISCONNECTED, qrcode: null },
    })
    revalidatePath("/")
}

export async function deleteSession(id: string, sessionId: string) {
    try {
        await wppconnectFetch(sessionId, `/api/${sessionId}/logout-session`, { method: "POST" })
    } catch (e) {
        console.warn("Sessão já deslogada do server", e)
    }

    await db.whatsappSession.delete({ where: { id } })
    revalidatePath("/")
}

export async function editSession(sessionId: string, data: { storeName: string, webhook?: string }) {
    await db.whatsappSession.update({
        where: { sessionId },
        data: {
            storeName: data.storeName,
            webhook: data.webhook || null
        }
    })
    revalidatePath("/")
    return { success: true }
}

export async function sendTestMessage(sessionId: string, phone: string, message: string) {
    try {
        const targetPhone = phone.includes("@c.us") ? phone : `${phone.replace(/\D/g, "")}@c.us`

        const response = await wppconnectFetch(sessionId, `/api/${sessionId}/send-message`, {
            method: "POST",
            body: JSON.stringify({
                phone: targetPhone,
                message: message,
                isGroup: false
            })
        })

        if (response.status === "error") {
            return { success: false, error: response.message || "Erro retornado pelo whatsapp." }
        }

        return { success: true, response }
    } catch (error: unknown) {
        console.error("Erro sendMessage:", error)
        const message = error instanceof Error ? error.message : "Falha na comunicação."
        return { success: false, error: message }
    }
}

export async function configureChatwoot(
    sessionId: string,
    chatwootAccountId?: number | null,
    chatwootToken?: string | null,
    chatwootUrl?: string | null
) {
    // 1. Atualizar banco de dados
    await db.whatsappSession.update({
        where: { sessionId },
        data: {
            chatwootAccountId,
            chatwootToken,
            chatwootUrl
        }
    })

    // 2. Se os dados foram apagados, chamamos para desativar no WPPConnect? 
    // O WPPConnect não possui documentação clara para remoção, mas podemos enviar nulo.
    // Vamos apenas focar na configuração se estiver completo.
    if (chatwootAccountId && chatwootToken && chatwootUrl) {
        try {
            await wppconnectFetch(sessionId, `/api/${sessionId}/chatwoot`, {
                method: "POST",
                body: JSON.stringify({
                    accountId: chatwootAccountId,
                    token: chatwootToken,
                    url: chatwootUrl,
                    signMsg: true
                })
            })
            console.log(`Chatwoot configurado para a sessão ${sessionId} via painel posterior`)
        } catch (err: unknown) {
            console.error("Erro ao configurar chatwoot posteriormente na sessão:", err)
            const message = err instanceof Error ? err.message : "Falha ao enviar ao WPPConnect"
            throw new Error(message)
        }
    }

    revalidatePath("/")
    return { success: true }
}
