export const assignmentEmailTemplate = (practice: any, member: any) => `
  <h1>Nuova Pratica Assegnata</h1>
  <p>Gentile ${member.full_name},</p>
  <p>Le è stata assegnata una nuova pratica:</p>
  <ul>
    <li>Numero Pratica: ${practice.practice_number}</li>
    <li>Dipendente: ${practice.employee_name}</li>
    <li>Data: ${new Date(practice.created_at).toLocaleDateString('it-IT')}</li>
  </ul>
`

export const statusUpdateTemplate = (practice: any, newStatus: string) => `
  <h1>Aggiornamento Stato Pratica</h1>
  <p>La pratica ${practice.practice_number} è stata aggiornata.</p>
  <p>Nuovo stato: ${newStatus}</p>
  <p>Data aggiornamento: ${new Date().toLocaleDateString('it-IT')}</p>
` 