import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as clicksign from '@/services/clicksign'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const admin = createAdminClient()

    if (clicksign.isDocumentClosed(body)) {
      const documentKey = body.event?.data?.document?.key
      if (documentKey) {
        const { data: contract } = await admin
          .from('contracts')
          .select('*')
          .eq('clicksign_document_key', documentKey)
          .single()

        if (contract) {
          await admin.from('contracts').update({
            status: 'SIGNED',
            signed_at: new Date().toISOString(),
          }).eq('id', contract.id)

          await admin.from('orders').update({
            status: 'CONTRACT_SIGNED',
          }).eq('id', contract.order_id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Clicksign webhook error:', err)
    return NextResponse.json({ received: true })
  }
}
