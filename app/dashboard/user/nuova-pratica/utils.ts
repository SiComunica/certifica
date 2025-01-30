import { PraticaFormData, PriceInfo } from "./types"

export function calculatePrice(data: PraticaFormData): PriceInfo {
  const basePrice = data.priceInfo.base_price
  const quantity = data.quantity
  const conventionDiscount = data.conventionDiscount

  let price = basePrice * quantity
  if (conventionDiscount > 0) {
    price = price * (1 - conventionDiscount / 100)
  }

  return {
    ...data.priceInfo,
    base: basePrice,
    inputs: {
      isPercentage: data.priceInfo.is_percentage,
      threshold: data.priceInfo.threshold_value,
      contractValue: data.contractValue,
      basePrice: basePrice,
      quantity: quantity,
      isOdcec: data.isOdcec,
      isRenewal: data.isRenewal,
      conventionDiscount: conventionDiscount
    },
    withVAT: price * 1.22
  }
}