import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Request {
  id: string
  request_number: string
  status: string
  payment_status: string
  created_at: string
  payment_amount: number
}

export function RequestsTable({ requests }: { requests: Request[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numero Pratica</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Importo</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.request_number}</TableCell>
              <TableCell>
                <Badge variant={
                  request.status === 'approved' ? 'success' :
                  request.status === 'rejected' ? 'destructive' :
                  'default'
                }>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  request.payment_status === 'paid' ? 'success' : 'default'
                }>
                  {request.payment_status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell>€ {request.payment_amount}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Dettagli
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 