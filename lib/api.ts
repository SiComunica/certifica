import { supabase } from './supabase'
import { Company, Employee, CertificationRequest, Document, CompanyInsert, EmployeeInsert, CertificationRequestInsert, DocumentInsert } from '@/types/entities'

export async function getCompanyByUserId(userId: string): Promise<Company | null> {
  const { data } = await supabase
    .from('companies')
    .select()
    .eq('user_id', userId)
    .single()
  return data
}

export async function getEmployeesByCompanyId(companyId: string): Promise<Employee[]> {
  const { data } = await supabase
    .from('employees')
    .select()
    .eq('company_id', companyId)
  return data || []
}

export async function getCertificationRequestsByCompanyId(
  companyId: string
): Promise<(CertificationRequest & {
  employees: { first_name: string; last_name: string }
  documents: { id: string; file_name: string }[]
})[]> {
  const { data } = await supabase
    .from('certification_requests')
    .select(`
      *,
      employees (first_name, last_name),
      documents (id, file_name)
    `)
    .eq('company_id', companyId)
  return data || []
}

export async function createCertificationRequests(
  requests: CertificationRequestInsert[]
): Promise<CertificationRequest | null> {
  const { data } = await supabase
    .from('certification_requests')
    .insert(requests)
    .select()
    .single()
  return data
}

export async function createDocuments(
  documents: DocumentInsert[]
): Promise<Document | null> {
  const { data } = await supabase
    .from('documents')
    .insert(documents)
    .select()
    .single()
  return data
}

export async function getStatistics(companyId: string) {
  const { data, error } = await supabase
    .rpc('get_certification_statistics', {
      company_id: companyId
    })

  if (error) throw error
  return data
}

export async function uploadDocument(file: File, certificationRequestId: string) {
  const fileName = `${certificationRequestId}/${file.name}`
  
  // Upload file to storage
  const { error: storageError } = await supabase
    .storage
    .from('contracts')
    .upload(fileName, file)

  if (storageError) throw storageError

  // Create document record
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert([{
      certification_request_id: certificationRequestId,
      file_name: file.name,
      file_path: fileName
    }])
    .select()
    .single()

  if (dbError) throw dbError
  return data as Document
} 