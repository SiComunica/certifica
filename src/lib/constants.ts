export interface ProvinciaType {
  value: string
  label: string
}

export const PROVINCE_ITALIANE: ProvinciaType[] = [
  { value: "AG", label: "Agrigento" },
  { value: "AL", label: "Alessandria" },
  // ... resto delle province ...
];

export type Provincia = typeof PROVINCE_ITALIANE[number]; 