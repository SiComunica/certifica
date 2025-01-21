export function validatePassword(password: string): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("La password deve essere di almeno 8 caratteri")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera maiuscola")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera minuscola")
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("La password deve contenere almeno un numero")
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("La password deve contenere almeno un carattere speciale (!@#$%^&*)")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 