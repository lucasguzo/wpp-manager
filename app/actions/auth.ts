"use server"

export async function verifyManagerApiKey(key: string | null): Promise<boolean> {
    // Se a variável não estiver definida, não requeremos senha para rodar
    const expected = process.env.MANAGER_API_KEY
    if (!expected) {
        return true
    }

    return key === expected
}
