import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('=== INIZIO AUTENTICAZIONE ===')
    
    const authBody = {
      Username: "UniRoma2test",
      Password: "XXXX" // Da sostituire con la password ricevuta via email
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
    console.error('=== ERRORE AUTENTICAZIONE ===', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      contractType,    // categoryId
      productId,       // da aggiungere al form
      quantity = 1,    // default a 1
      totalPrice,
      employeeName,
      fiscalCode,
      email,
      // Aggiungere altri campi necessari per la fatturazione
      companyName,
      vatNumber,
      companyFiscalCode,
      address,
      city,
      postalCode,
      country
    } = body

    // 1. Otteniamo il token
    const token = await getEasyCommerceToken()

    // 2. Chiamiamo l'API5 per l'acquisto diretto
    const shopUrl = `https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/authshop/${contractType}/${productId}/${quantity}/${Math.round(totalPrice * 100)}`
    
    const response = await fetch(shopUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        codiceFiscale: fiscalCode,
        nome: employeeName.split(' ')[0],
        cognome: employeeName.split(' ')[1] || '',
        // Dati fatturazione
        ragioneSociale: companyName,
        partitaIva: vatNumber,
        codiceFiscaleAzienda: companyFiscalCode,
        indirizzo: address,
        citta: city,
        cap: postalCode,
        paese: country
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Errore nell'acquisto: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('=== ERRORE GENERALE ===', error)
    return NextResponse.json(
      { error: error?.message || 'Errore nel processo di acquisto' },
      { status: 500 }
    )
  }
} 