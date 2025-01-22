"use client"

import { useState } from 'react'

interface Review {
  id: string
  requestNumber: string
  companyName: string
  employeeName: string
  status: string
  reviewNotes: string
  reviewedAt: string
}

export function ReviewHistory() {
  // Dati di esempio
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      requestNumber: 'REQ-001',
      companyName: 'Azienda Example',
      employeeName: 'Mario Rossi',
      status: 'approved',
      reviewNotes: 'Tutto in ordine',
      reviewedAt: '2024-01-21'
    },
    {
      id: '2',
      requestNumber: 'REQ-002',
      companyName: 'Azienda Test',
      employeeName: 'Luigi Verdi',
      status: 'rejected',
      reviewNotes: 'Documentazione incompleta',
      reviewedAt: '2024-01-21'
    }
  ])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Storico Revisioni</h3>
      
      <div className="divide-y">
        {reviews.map((review) => (
          <div key={review.id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">
                  {review.requestNumber} - {review.companyName}
                </h4>
                <p className="text-sm text-gray-500">
                  {review.employeeName}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                review.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {review.status === 'approved' ? 'Approvato' : 'Rifiutato'}
              </span>
            </div>
            
            {review.reviewNotes && (
              <p className="mt-2 text-sm text-gray-600">
                Note: {review.reviewNotes}
              </p>
            )}
            
            <p className="mt-1 text-xs text-gray-400">
              Revisionato il: {review.reviewedAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 