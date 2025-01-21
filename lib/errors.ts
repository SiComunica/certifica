export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof PaymentError) {
    return {
      title: 'Errore nel pagamento',
      description: error.message,
      variant: 'destructive' as const,
      action: error.code === 'PAYMENT_EXPIRED' ? {
        label: 'Riprova',
        onClick: () => window.location.reload()
      } : undefined
    }
  }

  if (error instanceof ValidationError) {
    return {
      title: 'Errore di validazione',
      description: error.message,
      variant: 'destructive' as const
    }
  }

  return {
    title: 'Errore',
    description: error instanceof Error ? error.message : 'Si è verificato un errore imprevisto',
    variant: 'destructive' as const
  }
} 