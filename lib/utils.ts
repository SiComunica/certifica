import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type PriceInputs = {
  isPercentage: boolean
  threshold: number | null
  contractValue: number
  basePrice: number
  quantity: number
  isOdcec: boolean
  isRenewal: boolean
}

type PriceCalculation = {
  base: number
  inputs: PriceInputs
}

export function calculatePrice({ base, inputs }: PriceCalculation) {
  let price = base

  // Applica sconto ODCEC se presente
  if (inputs.isOdcec) {
    price = price * 0.8 // 20% di sconto
  }

  // Applica sconto rinnovo se presente
  if (inputs.isRenewal) {
    price = price * 0.9 // 10% di sconto
  }

  // Moltiplica per la quantità
  price = price * inputs.quantity

  // Calcola IVA
  const withVAT = price * 1.22

  return {
    base: price,
    withVAT,
    inputs
  }
}