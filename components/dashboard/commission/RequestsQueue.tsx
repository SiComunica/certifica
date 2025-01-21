import * as React from 'react'
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
import { CheckIcon, Cross1Icon, EyeOpenIcon, Cross2Icon } from "@radix-ui/react-icons"

interface Request {
  id: string
  request_number: string
  company_name: string
  employee_name: string
  status: string
  created_at: string
  is_urgent: boolean
}

export function RequestsQueue({ requests }: { requests: Request[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numero Pratica</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Dipendente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Priorità</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.request_number}</TableCell>
              <TableCell>{request.company_name}</TableCell>
              <TableCell>{request.employee_name}</TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {request.is_urgent ? (
                  <Badge variant="destructive">Urgente</Badge>
                ) : (
                  <Badge variant="default">Normale</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={
                  request.status === 'pending' ? 'default' :
                  request.status === 'approved' ? 'success' :
                  'destructive'
                }>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <EyeOpenIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm">
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Cross1Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 