import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'

interface InvoiceData {
  invoice_number: string
  payment_date: string
  amount: number
  payment_method: string
  practice_number: string
  employee_name: string
  company_name: string
  company_address: string
  company_vat: string
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = doc.pipe(blobStream());

    // Aggiungi intestazione
    doc
      .fontSize(20)
      .text('FATTURA', { align: 'center' })
      .moveDown();

    // Informazioni azienda
    doc
      .fontSize(12)
      .text(data.company_name)
      .text(data.company_address)
      .text(`P.IVA: ${data.company_vat}`)
      .moveDown();

    // Dettagli fattura
    doc
      .fontSize(14)
      .text(`Fattura N°: ${data.invoice_number}`)
      .text(`Data: ${data.payment_date}`)
      .moveDown();

    // Dettagli pratica
    doc
      .fontSize(12)
      .text(`Riferimento Pratica: ${data.practice_number}`)
      .text(`Dipendente: ${data.employee_name}`)
      .moveDown();

    // Tabella importi
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    doc
      .text('Descrizione', 50, doc.y)
      .text('Importo', 450, doc.y)
      .moveDown();

    doc
      .text('Servizio di certificazione', 50)
      .text(`€ ${data.amount.toFixed(2)}`, 450)
      .moveDown();

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // Totale
    doc
      .fontSize(14)
      .text(`Totale: € ${data.amount.toFixed(2)}`, { align: 'right' })
      .moveDown();

    // Metodo di pagamento
    doc
      .fontSize(12)
      .text(`Metodo di pagamento: ${data.payment_method}`)
      .moveDown();

    // Footer
    doc
      .fontSize(10)
      .text('Documento generato automaticamente', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      resolve(stream.toBlob('application/pdf'));
    });

    stream.on('error', reject);
  });
} 