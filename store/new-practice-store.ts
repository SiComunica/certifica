import { create } from 'zustand'

interface FormData {
  practiceId: string
  employeeName: string
  contractTypeName: string
  contractValue: number
  quantity: number
  isOdcec: boolean
  isRenewal: boolean
  contractType: string
}

interface NewPracticeStore {
  formData: FormData
  setFormData: (data: FormData) => void
}

export const useNewPracticeStore = create<NewPracticeStore>((set) => ({
  formData: {
    practiceId: '',
    employeeName: '',
    contractTypeName: '',
    contractValue: 0,
    quantity: 1,
    isOdcec: false,
    isRenewal: false,
    contractType: ''
  },
  setFormData: (data) => set({ formData: data }),
})) 