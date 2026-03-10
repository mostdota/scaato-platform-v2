import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as asaas from '@/services/asaas'
import * as clicksign from '@/services/clicksign'
import { generateContractPdf } from '@/services/pdf'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment: asaasPayment } = body

    if (!asaasPayment?.id) {
      return NextResponse.json({ received: true })
    }

    const admin = createAdminClient()

    // Busca payment local pelo asaas_payment_id
    const { data: payment } = await admin
      .from('payments')
      .select('*, order:orders(*, scooter:scooters(*)), profile:profiles(*)')
      .eq('asaas_payment_id', asaasPayment.id)
      .single()

    if (!payment) {
      console.warn(`Payment not found for asaas id: ${asaasPayment.id}`)
      return NextResponse.json({ received: true })
    }

    const newStatus = asaas.mapStatus(asaasPayment.status)

    // Atualiza payment
    await admin.from('payments').update({
      status: newStatus,
      paid_at: newStatus === 'CONFIRMED' ? new Date().toISOString() : null,
      raw_asaas_response: asaasPayment,
    }).eq('id', payment.id)

    // Se confirmado → gera contrato
    if (
      newStatus === 'CONFIRMED' &&
      ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)
    ) {
      try {
        await admin.from('orders').update({ status: 'PAID' }).eq('id', payment.order_id)

        const profile = payment.profile
        const order   = payment.order
        const scooter = order?.scooter

        if (profile && order && scooter) {
          // Gera PDF
          const { buffer, hash } = await generateContractPdf({
            profile,
            order,
            scooter,
            brandName: 'SCAATO',
          })

          // Envia para Clicksign
          const fileName = `contrato-${profile.name?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
          const { documentKey, signerKey, signatureUrl } = await clicksign.sendContractForSigning({
            fileName,
            pdfBuffer: buffer,
            signerName:  profile.name,
            signerEmail: profile.email,
            signerPhone: profile.phone,
          })

          // Salva contrato no DB
          await admin.from('contracts').insert({
            order_id:               order.id,
            profile_id:             profile.id,
            title:                  `Contrato de Compra — ${scooter.model}`,
            status:                 'SENT',
            hash,
            clicksign_document_key: documentKey,
            clicksign_signer_key:   signerKey,
            signature_url:          signatureUrl,
          })

          // Atualiza pedido
          await admin.from('orders').update({ status: 'CONTRACT_PENDING' }).eq('id', order.id)
        }
      } catch (contractErr) {
        console.error('Contract generation error:', contractErr)
        // Não falha o webhook, apenas loga
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Asaas webhook error:', err)
    return NextResponse.json({ received: true }) // sempre 200 para webhooks
  }
}
