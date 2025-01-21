'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface Review {
  id: string
  request_number: string
  company_name: string
  employee_name: string
  status: string
  review_notes: string
  reviewed_at: string
  reviewer: string
}

export function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const perPage = 10

  const loadReviews = async (pageNumber: number) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('certification_requests')
        .select(`
          id,
          request_number,
          status,
          review_notes,
          reviewed_at,
          companies (company_name),
          employees (first_name, last_name),
          profiles (full_name)
        `)
        .not('reviewed_at', 'is', null)
        .order('reviewed_at', { ascending: false })
        .range((pageNumber - 1) * perPage, pageNumber * perPage - 1)

      if (error) throw error

      const formattedReviews = data.map(r => ({
        id: r.id,
        request_number: r.request_number,
        company_name: r.companies.company_name,
        employee_name: `${r.employees.first_name} ${r.employees.last_name}`,
        status: r.status,
        review_notes: r.review_notes,
        reviewed_at: r.reviewed_at,
        reviewer: r.profiles.full_name
      }))

      setReviews(prev => pageNumber === 1 ? formattedReviews : [...prev, ...formattedReviews])
      setHasMore(data.length === perPage)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Revisione</TableHead>
            <TableHead>Pratica</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Dipendente</TableHead>
            <TableHead>Esito</TableHead>
            <TableHead>Revisore</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{new Date(review.reviewed_at).toLocaleString()}</TableCell>
              <TableCell>{review.request_number}</TableCell>
              <TableCell>{review.company_name}</TableCell>
              <TableCell>{review.employee_name}</TableCell>
              <TableCell>
                <Badge variant={
                  review.status === 'approved' ? 'success' :
                  review.status === 'rejected' ? 'destructive' :
                  'default'
                }>
                  {review.status}
                </Badge>
              </TableCell>
              <TableCell>{review.reviewer}</TableCell>
              <TableCell className="max-w-xs truncate">{review.review_notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <Button
          onClick={() => {
            setPage(p => p + 1)
            loadReviews(page + 1)
          }}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Caricamento...' : 'Carica altri'}
        </Button>
      )}
    </div>
  )
} 