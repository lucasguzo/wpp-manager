import { db } from "@/lib/prisma"
import { NewConnectionModal } from "@/components/new-connection-modal"
import { SessionCard, type SessionProps } from "@/components/session-card"
import { TestMessageModal } from "@/components/test-message-modal"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const sessions: SessionProps[] = await db.whatsappSession.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      storeName: true,
      sessionId: true,
      status: true,
      token: true,
      webhook: true,
      chatwootAccountId: true,
      chatwootToken: true,
      chatwootUrl: true,
    },
  }) as SessionProps[]

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">WPP-Manager</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Múltiplos números do WPPConnect em um ambiente gerenciado.</p>
        </div>
        <div className="flex items-center gap-3">
          <TestMessageModal sessions={sessions} />
          <NewConnectionModal />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10 mx-auto">
          <p className="text-muted-foreground text-sm">Nenhuma loja autorizada. Cadastre a primeira para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
