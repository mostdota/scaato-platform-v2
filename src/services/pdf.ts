import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import crypto from 'crypto'
import type { Profile, Order, Scooter } from '@/types'

interface GenerateContractInput {
  profile: Profile
  order: Order
  scooter: Scooter
  brandName: string
}

export async function generateContractPdf(
  input: GenerateContractInput
): Promise<{ buffer: Buffer; hash: string }> {
  const { profile, order, scooter, brandName } = input
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const GREEN  = rgb(0.114, 0.725, 0.333)   // #1DB954
  const BLACK  = rgb(0.04,  0.04,  0.04)
  const GRAY   = rgb(0.5,   0.5,   0.5)
  const WHITE  = rgb(1,     1,     1)
  const BGDARK = rgb(0.04,  0.04,  0.04)

  // ── Header Strip ──
  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: BGDARK })
  page.drawRectangle({ x: 0, y: height - 76, width, height: 4, color: GREEN })

  page.drawText(brandName.toUpperCase(), {
    x: 44, y: height - 44,
    size: 26, font: boldFont, color: GREEN,
  })
  page.drawText('CONTRATO DE COMPRA DE SCOOTER ELÉTRICA', {
    x: 44, y: height - 64,
    size: 9, font: regularFont, color: rgb(0.6, 0.6, 0.6),
  })

  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  page.drawText(`Emitido em ${now}`, {
    x: width - 200, y: height - 50,
    size: 9, font: regularFont, color: rgb(0.5, 0.5, 0.5),
  })

  let y = height - 110

  const section = (title: string) => {
    y -= 8
    page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 22, color: rgb(0.96, 0.98, 0.96) })
    page.drawRectangle({ x: 40, y: y - 4, width: 3, height: 22, color: GREEN })
    page.drawText(title.toUpperCase(), { x: 52, y, size: 9, font: boldFont, color: BLACK })
    y -= 20
  }

  const field = (label: string, value: string) => {
    page.drawText(label + ':', { x: 52, y, size: 9, font: boldFont, color: GRAY })
    page.drawText(value || '—', { x: 200, y, size: 9, font: regularFont, color: BLACK })
    y -= 15
  }

  // ── DADOS DO COMPRADOR ──
  section('DADOS DO COMPRADOR')
  field('Nome completo', profile.name)
  field('CPF', profile.cpf || '—')
  field('RG', profile.rg || '—')
  field('E-mail', profile.email)
  field('Telefone', profile.phone || '—')
  field('Endereço', profile.address ? `${profile.address}, ${profile.city} - ${profile.state}` : '—')
  field('CEP', profile.zip_code || '—')

  y -= 8
  section('DADOS DO PRODUTO')
  field('Modelo', scooter.model)
  field('Descrição', scooter.description || '—')
  field('Valor total', `R$ ${Number(scooter.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  field('Nº do Pedido', order.id.slice(0, 8).toUpperCase())
  field('Data do pedido', new Date(order.created_at).toLocaleDateString('pt-BR'))

  if (scooter.specs && Object.keys(scooter.specs).length > 0) {
    y -= 4
    section('ESPECIFICAÇÕES TÉCNICAS')
    const specs = scooter.specs as Record<string, string>
    if (specs.maxSpeed) field('Velocidade máxima', specs.maxSpeed)
    if (specs.range)    field('Autonomia', specs.range)
    if (specs.battery)  field('Bateria', specs.battery)
    if (specs.motor)    field('Motor', specs.motor)
    if (specs.charging) field('Tempo de carga', specs.charging)
    if (specs.weight)   field('Peso', specs.weight)
  }

  y -= 8
  section('CLÁUSULAS E CONDIÇÕES')
  y -= 4
  const clauses = [
    '1. O COMPRADOR declara que todas as informações fornecidas são verdadeiras e completas.',
    '2. O pagamento deve ser realizado conforme acordado, via PIX, boleto bancário ou cartão de crédito.',
    '3. A SCAATO se compromete a entregar o produto em perfeitas condições, conforme especificações.',
    '4. O prazo de entrega será informado após a confirmação do pagamento, em até 15 dias úteis.',
    '5. O produto possui garantia de 12 meses contra defeitos de fabricação.',
    '6. Em caso de desistência, o COMPRADOR deverá comunicar em até 7 dias corridos após a assinatura.',
    '7. Este contrato possui validade jurídica através de assinatura eletrônica qualificada.',
  ]

  for (const clause of clauses) {
    if (y < 120) break
    const words = clause.split(' ')
    let line = ''
    for (const word of words) {
      const test = line + word + ' '
      if (regularFont.widthOfTextAtSize(test, 9) > width - 104 && line) {
        page.drawText(line.trim(), { x: 52, y, size: 9, font: regularFont, color: BLACK })
        y -= 13
        line = word + ' '
      } else {
        line = test
      }
    }
    if (line.trim()) {
      page.drawText(line.trim(), { x: 52, y, size: 9, font: regularFont, color: BLACK })
      y -= 13
    }
    y -= 4
  }

  // ── Assinatura footer ──
  const footerY = 90
  page.drawLine({ start: { x: 40, y: footerY + 30 }, end: { x: 280, y: footerY + 30 }, thickness: 0.5, color: GRAY })
  page.drawLine({ start: { x: 320, y: footerY + 30 }, end: { x: width - 40, y: footerY + 30 }, thickness: 0.5, color: GRAY })
  page.drawText(profile.name, { x: 40, y: footerY + 15, size: 9, font: boldFont, color: BLACK })
  page.drawText('COMPRADOR', { x: 40, y: footerY + 4, size: 8, font: regularFont, color: GRAY })
  page.drawText(`${brandName} (Vendedor)`, { x: 320, y: footerY + 15, size: 9, font: boldFont, color: BLACK })
  page.drawText('VENDEDOR', { x: 320, y: footerY + 4, size: 8, font: regularFont, color: GRAY })

  // Watermark
  page.drawText(brandName, {
    x: width / 2 - 80, y: height / 2 - 20,
    size: 72, font: boldFont,
    color: rgb(0.93, 0.97, 0.93),
    rotate: degrees(35),
    opacity: 0.15,
  })

  const pdfBytes = await pdfDoc.save()
  const buffer = Buffer.from(pdfBytes)
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  return { buffer, hash }
}
