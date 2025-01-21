import * as z from "zod"

export const registerSchema = z.object({
  // Dati Aziendali
  ragioneSociale: z.string().min(1, "Ragione sociale è richiesta"),
  partitaIva: z.string().length(11, "Partita IVA deve essere di 11 caratteri"),
  codiceFiscale: z.string().length(16, "Codice fiscale deve essere di 16 caratteri"),
  email: z.string().email("Email non valida"),
  pec: z.string().email("PEC non valida"),
  telefono: z.string().optional(),
  settoreAttivita: z.string().min(1, "Settore di attività è richiesto"),
  ccnlApplicato: z.string().min(1, "CCNL è richiesto"),

  // Sede Legale
  indirizzo: z.string().min(1, "Indirizzo è richiesto"),
  cap: z.string().length(5, "CAP deve essere di 5 caratteri"),
  citta: z.string().min(1, "Città è richiesta"),
  provincia: z.string().length(2, "Provincia deve essere di 2 caratteri"),

  // Rappresentante Legale
  nomeLegale: z.string().min(1, "Nome è richiesto"),
  cognomeLegale: z.string().min(1, "Cognome è richiesto"),
  cfLegale: z.string().length(16, "Codice fiscale deve essere di 16 caratteri"),
  emailLegale: z.string().email("Email non valida"),
  telefonoLegale: z.string().optional(),
  dataNascita: z.string().min(1, "Data di nascita è richiesta"),
  luogoNascita: z.string().min(1, "Luogo di nascita è richiesto"),

  // Dati Amministrativi
  dataCostituzione: z.string().min(1, "Data costituzione è richiesta"),
  numeroRea: z.string().min(1, "Numero REA è richiesto"),
  cciaa: z.string().min(1, "Camera di commercio è richiesta"),
  numeroDipendenti: z.string().min(1, "Numero dipendenti è richiesto"),

  // Password
  password: z.string()
    .min(8, "Password deve essere almeno 8 caratteri")
    .regex(/[A-Z]/, "Password deve contenere almeno una lettera maiuscola")
    .regex(/[a-z]/, "Password deve contenere almeno una lettera minuscola")
    .regex(/[0-9]/, "Password deve contenere almeno un numero"),
  confermaPassword: z.string()
}).refine((data) => data.password === data.confermaPassword, {
  message: "Le password non coincidono",
  path: ["confermaPassword"],
})

export type RegisterFormData = z.infer<typeof registerSchema> 