import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('=== RICHIESTA TOKEN EASYCOMMERCE ===')
    
    const authBody = {
      Username: "UniRoma2test",
      Password: process.env.PAYMENT_API_KEY
    }

    const authResponse = await fetch(
      'https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/auth/gettoken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(authBody)
      }
    )

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Autenticazione fallita: ${authResponse.status} ${errorText}`)
    }

    const authData = await authResponse.json()
    return authData.token
  } catch (error) {
    console.error('=== ERRORE TOKEN EASYCOMMERCE ===', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== INIZIO PROCESSO PAGAMENTO ===')

    // Validazione dati ricevuti
    const paymentData = await request.json()
    console.log('Dati ricevuti:', paymentData)

    if (!paymentData.email || !paymentData.fiscalCode || !paymentData.employeeName) {
      return NextResponse.json(
        { 
          message: 'Dati utente mancanti',
          details: 'Email, codice fiscale e nome sono obbligatori'
        },
        { status: 400 }
      )
    }

    // Ottieni token EasyCommerce
    const token = await getEasyCommerceToken()
    console.log('Token ottenuto con successo')

    // Prepara i parametri per l'URL
    const categoryId = '1' // Da configurare in base alla categoria corretta
    const productId = paymentData.productId
    const qty = paymentData.quantity.toString()
    const price = paymentData.totalPrice.toString()
    const note = `Ordine per ${paymentData.employeeName}`

    // Costruisci l'URL di EasyCommerce
    const easyCommerceUrl = `https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/authshop/${categoryId}/${productId}/${qty}/${price}/${encodeURIComponent(note)}`

    // Prepara i dati utente
    const userData = {
      email: paymentData.email,
      fiscalCode: paymentData.fiscalCode,
      fullName: paymentData.employeeName,
      // altri dati utente necessari...
    }

    // Effettua la richiesta a EasyCommerce
    const shopResponse = await fetch(easyCommerceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    if (!shopResponse.ok) {
      const errorText = await shopResponse.text()
      throw new Error(`Errore EasyCommerce: ${shopResponse.status} ${errorText}`)
    }

    const shopData = await shopResponse.json()
    console.log('Risposta EasyCommerce:', shopData)

    // Restituisci l'URL per il redirect
    return NextResponse.json({
      message: 'Processo di pagamento iniziato',
      redirectUrl: shopData.redirectUrl || shopData.url,
      orderId: shopData.orderId
    })

  } catch (error) {
    console.error('=== ERRORE PROCESSO PAGAMENTO ===', error)
    return NextResponse.json(
      {
        message: "Errore durante l'elaborazione del pagamento",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 