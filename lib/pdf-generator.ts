import PDFDocument from 'pdfkit'
import { Contract } from './supabase/contracts'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export async function generateCertificate(contract: Contract): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Certificato - ${contract.employee_name}`,
        Author: 'Certifica System',
      }
    })

    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    // Header
    doc.fontSize(20)
       .text('Certificato di Conformità', { align: 'center' })
    
    doc.moveDown()
    doc.fontSize(12)
    
    // Dettagli certificato
    doc.text(`Numero Certificato: ${contract.id}`)
    doc.text(`Data Emissione: ${format(new Date(), 'dd/MM/yyyy', { locale: it })}`)
    doc.text(`Dipendente: ${contract.employee_name}`)
    doc.text(`Tipo Contratto: ${contract.type}`)
    
    doc.moveDown()
    doc.text('Si certifica che il contratto in oggetto è conforme alle normative vigenti.')
    
    // Footer con firma
    doc.moveDown(2)
    doc.text('Il Responsabile della Commissione', { align: 'right' })
    doc.moveDown()
    doc.text('_____________________', { align: 'right' })

    doc.end()
  })
} 