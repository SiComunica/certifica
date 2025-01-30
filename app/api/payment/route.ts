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
    console.log('=== INIZIO PROCESSO PAGAMENTO BACKEND ===')

    // Log dei dati ricevuti
    const paymentData = await request.json()
    console.log('Dati ricevuti dal frontend:', paymentData)

    // Validazione campi obbligatori
    const requiredFields = ['email', 'fiscalCode', 'employeeName', 'productId', 'totalPrice']
    const missingFields = requiredFields.filter(field => !paymentData[field])
    
    if (missingFields.length > 0) {
      console.log('Campi mancanti:', missingFields)
      return NextResponse.json(
        { 
          message: 'Dati di pagamento incompleti',
          details: `Campi mancanti: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Ottieni token EasyCommerce
    console.log('Richiesta token EasyCommerce...')
    const token = await getEasyCommerceToken()
    console.log('Token ottenuto:', !!token)

    // Prepara i parametri per l'URL
    const categoryId = '1' // Da configurare
    const { productId, quantity, totalPrice, employeeName } = paymentData
    const note = `Ordine per ${employeeName}`

    // Costruisci l'URL
    const easyCommerceUrl = `https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/authshop/${categoryId}/${productId}/${quantity}/${totalPrice}/${encodeURIComponent(note)}`
    console.log('URL EasyCommerce:', easyCommerceUrl)

    // Prepara i dati utente
    const userData = {
      email: paymentData.email,
      fiscalCode: paymentData.fiscalCode,
      fullName: paymentData.employeeName
    }
    console.log('Dati utente:', userData)

    // Chiamata a EasyCommerce
    console.log('Invio richiesta a EasyCommerce...')
    const shopResponse = await fetch(easyCommerceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    console.log('Stato risposta EasyCommerce:', shopResponse.status)
    const responseText = await shopResponse.text()
    console.log('Risposta EasyCommerce:', responseText)

    if (!shopResponse.ok) {
      throw new Error(`Errore EasyCommerce: ${shopResponse.status} ${responseText}`)
    }

    const shopData = JSON.parse(responseText)
    console.log('Dati risposta parsati:', shopData)

    return NextResponse.json({
      message: 'Processo di pagamento iniziato',
      redirectUrl: shopData.redirectUrl || shopData.url,
      orderId: shopData.orderId
    })

  } catch (error) {
    console.error('=== ERRORE PROCESSO PAGAMENTO BACKEND ===', error)
    return NextResponse.json(
      {
        message: "Errore durante l'elaborazione del pagamento",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 