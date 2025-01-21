import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const BUCKET_NAME = 'invoices'

export async function setupInvoiceBucket() {
  const supabase = createClientComponentClient()
  
  // Verifica se il bucket esiste
  const { data: buckets } = await supabase
    .storage
    .listBuckets()
  
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
  
  // Crea il bucket solo se non esiste
  if (!bucketExists) {
    const { error: bucketError } = await supabase
      .storage
      .createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['application/pdf']
      })

    if (bucketError) {
      console.error('Errore creazione bucket:', bucketError)
      throw bucketError
    }
  }

  return BUCKET_NAME
}

export async function uploadInvoice(fileName: string, file: Blob) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(`invoices/${fileName}`, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false // non sovrascrive file esistenti
    })

  if (error) throw error
  return data.path
} 