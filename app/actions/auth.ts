"use server"

export async function verifyManagerApiKey(key: string | null): Promise<{ isConfigured: boolean; isValid: boolean }> {
    const expected = process.env.MANAGER_API_KEY

    if (!expected) {
        console.warn("[AUTH] A variável MANAGER_API_KEY não foi encontrada no ambiente (Portainer/Docker). O sistema ficará bloqueado por segurança.")
        return { isConfigured: false, isValid: false }
    }

    return { isConfigured: true, isValid: key === expected }
}
