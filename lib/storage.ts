import { supabase } from './supabase'

export async function uploadDocument(file: File, documentId: string, versionType: 'original' | 'signed') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${documentId}/${versionType}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  return {
    filePath: fileName,
    publicUrl
  }
}

// Funzioni di compatibilità
export async function uploadPdf(file: File, path: string) {
  const { filePath, publicUrl } = await uploadDocument(file, path, 'original')
  return { filePath, publicUrl }
}

export function getPdfUrl(path: string) {
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(path)
  return publicUrl
} 