import { createClientComponentClient } from './supabase'
import { Company, Employee, CertificationRequest, Document } from './types'

export async function getCompanyData(userId: string) {
  const supabase = createClientComponentClient()
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return company as Company
}

export async function getEmployees(companyId: string) {
  const supabase = createClientComponentClient()
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)

  if (error) throw error
  return employees as Employee[]
}

export async function getCertificationRequests(companyId: string) {
  const supabase = createClientComponentClient()
  const { data: requests, error } = await supabase
    .from('certification_requests')
    .select(`
      *,
      employees (
        first_name,
        last_name
      ),
      documents (
        id,
        file_name
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return requests as (CertificationRequest & {
    employees: { first_name: string; last_name: string }
    documents: { id: string; file_name: string }[]
  })[]
}

export async function getStatistics(companyId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .rpc('get_certification_statistics', {
      company_id: companyId
    })

  if (error) throw error
  return data
}

export async function createCertificationRequest(request: Partial<CertificationRequest>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('certification_requests')
    .insert([request])
    .select()
    .single()

  if (error) throw error
  return data as CertificationRequest
}

export async function uploadDocument(file: File, certificationRequestId: string) {
  const supabase = createClientComponentClient()
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