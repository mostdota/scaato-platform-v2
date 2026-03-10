import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import * as asaas from '@/services/asaas'
import { format, addDays } from 'date-fns'

const schema = z.object({
  method: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD']),
  scooterId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { method, scooterId } = schema.parse(body)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    // Busca profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })

    // Busca scooter
    const admin = createAdminClient()
    const { data: scooter } = await admin.from('scooters')
      .select('*')
      .eq('available', true)
      .single()
    if (!scooter) return NextResponse.json({ success: false, error: 'Scooter não disponível' }, { status: 404 })

    // Garante que o cliente existe no Asaas
    let asaasCustomerId = profile.asaas_customer_id
    if (!asaasCustomerId) {
      if (!profile.cpf) return NextResponse.json({ success: false, error: 'CPF necessário para pagamento' }, { status: 400 })
      const customer = await asaas.getOrCreateCustomer({
        name: profile.name,
        cpf: profile.cpf,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        zipCode: profile.zip_code,
      })
      asaasCustomerId = customer.id
      await admin.from('profiles').update({ asaas_customer_id: asaasCustomerId }).eq('id', user.id)
    }

    // Cria pedido
    const { data: order, error: orderError } = await admin.from('orders').insert({
      profile_id: user.id,
      scooter_id: scooter.id,
      status: 'PAYMENT_PENDING',
      total_amount: scooter.price,
    }).select().single()
    if (orderError) throw new Error(orderError.message)

    // Cria cobrança no Asaas
    const dueDate = format(addDays(new Date(), method === 'PIX' ? 1 : 3), 'yyyy-MM-dd')
    const asaasPayment = await asaas.createPayment({
      customerId: asaasCustomerId,
      value: Number(scooter.price),
      dueDate,
      description: `SCAATO — ${scooter.model}`,
      billingType: method,
      externalReference: order.id,
    })

    // Busca dados extra (PIX QR Code)
    let pixQrCodeImage: string | undefined
    let pixQrCodePayload: string | undefined

    if (method === 'PIX') {
      try {
        const qr = await asaas.getPixQrCode(asaasPayment.id)
        pixQrCodeImage   = qr.encodedImage
        pixQrCodePayload = qr.payload
      } catch {}
    }

    // Salva payment no DB
    await admin.from('payments').insert({
      order_id: order.id,
      profile_id: user.id,
      asaas_payment_id: asaasPayment.id,
      asaas_customer_id: asaasCustomerId,
      method,
      value: scooter.price,
      due_date: dueDate,
      status: 'PENDING',
      description: `${scooter.model}`,
      invoice_url: asaasPayment.invoiceUrl,
      bank_slip_url: asaasPayment.bankSlipUrl,
      pix_qr_code_image: pixQrCodeImage,
      pix_qr_code_payload: pixQrCodePayload,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        paymentId: asaasPayment.id,
        method,
        value: Number(scooter.price),
        dueDate,
        pixQrCodeImage,
        pixQrCodePayload,
        bankSlipUrl: asaasPayment.bankSlipUrl,
        invoiceUrl: asaasPayment.invoiceUrl,
      },
    })
  } catch (err: any) {
    console.error('Payment creation error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Erro interno' }, { status: 500 })
  }
}
