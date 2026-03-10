import axios from 'axios'

const api = axios.create({
  baseURL: process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1',
  timeout: 20000,
})

const token = () => process.env.CLICKSIGN_API_KEY!

// ── Documentos ──────────────────────────────

export async function createDocument(data: {
  fileName: string
  contentBase64: string
  deadlineDays?: number
}): Promise<{ key: string; filename: string; status: string }> {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + (data.deadlineDays ?? 30))

  const res = await api.post(`/documents?access_token=${token()}`, {
    document: {
      path: `/${data.fileName}`,
      content_base64: data.contentBase64,
      deadline_at: deadline.toISOString(),
      auto_close: true,
      locale: 'pt-BR',
      sequence_enabled: false,
    },
  })
  return res.data.document
}

// ── Signatários ─────────────────────────────

export async function createSigner(data: {
  name: string
  email: string
  phone?: string
}): Promise<{ key: string; name: string; email: string }> {
  const res = await api.post(`/signers?access_token=${token()}`, {
    signer: {
      email: data.email,
      auth_definition: 'email',
      name: data.name,
      phone_number: data.phone?.replace(/\D/g, ''),
      delivery: 'email',
    },
  })
  return res.data.signer
}

// ── Link Signatário ─────────────────────────

export async function addSignerToDocument(
  documentKey: string,
  signerKey: string
): Promise<{ listKey: string; signatureUrl: string }> {
  const res = await api.post(`/lists?access_token=${token()}`, {
    list: {
      document_key: documentKey,
      signer_key: signerKey,
      sign_as: 'contractor',
      refusable: false,
      message: 'Por favor, assine seu contrato SCAATO para ativar sua compra.',
    },
  })
  const listKey = res.data.list.key
  const base = (process.env.CLICKSIGN_API_URL ?? '').includes('sandbox')
    ? 'https://sandbox.clicksign.com'
    : 'https://app.clicksign.com'
  return { listKey, signatureUrl: `${base}/sign/${listKey}` }
}

// ── Fluxo Completo ──────────────────────────

export async function sendContractForSigning(data: {
  fileName: string
  pdfBuffer: Buffer
  signerName: string
  signerEmail: string
  signerPhone?: string
}): Promise<{
  documentKey: string
  signerKey: string
  signatureUrl: string
}> {
  const doc = await createDocument({
    fileName: data.fileName,
    contentBase64: data.pdfBuffer.toString('base64'),
  })
  const signer = await createSigner({
    name: data.signerName,
    email: data.signerEmail,
    phone: data.signerPhone,
  })
  const { signatureUrl } = await addSignerToDocument(doc.key, signer.key)
  return { documentKey: doc.key, signerKey: signer.key, signatureUrl }
}

// ── Webhook helpers ─────────────────────────

export function isDocumentClosed(payload: {
  event?: { name?: string; data?: { document?: { status?: string } } }
}): boolean {
  return (
    payload.event?.name === 'auto_close' ||
    payload.event?.data?.document?.status === 'closed'
  )
}
