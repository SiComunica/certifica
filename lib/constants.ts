export const PROVINCE_ITALIANE = [
  { value: "AG", label: "Agrigento" },
  { value: "AL", label: "Alessandria" },
  { value: "AN", label: "Ancona" },
  { value: "AO", label: "Aosta" },
  { value: "AR", label: "Arezzo" },
  { value: "AP", label: "Ascoli Piceno" },
  { value: "AT", label: "Asti" },
  { value: "AV", label: "Avellino" },
  { value: "BA", label: "Bari" },
  { value: "BT", label: "Barletta-Andria-Trani" },
  { value: "BL", label: "Belluno" },
  { value: "BN", label: "Benevento" },
  { value: "BG", label: "Bergamo" },
  { value: "BI", label: "Biella" },
  { value: "BO", label: "Bologna" },
  { value: "BZ", label: "Bolzano" },
  { value: "BS", label: "Brescia" },
  { value: "BR", label: "Brindisi" },
  { value: "CA", label: "Cagliari" },
  { value: "CL", label: "Caltanissetta" },
  { value: "CB", label: "Campobasso" },
  { value: "CE", label: "Caserta" },
  { value: "CT", label: "Catania" },
  { value: "CZ", label: "Catanzaro" },
  { value: "CH", label: "Chieti" },
  { value: "CO", label: "Como" },
  { value: "CS", label: "Cosenza" },
  { value: "CR", label: "Cremona" },
  { value: "KR", label: "Crotone" },
  { value: "CN", label: "Cuneo" },
  { value: "EN", label: "Enna" },
  { value: "FM", label: "Fermo" },
  { value: "FE", label: "Ferrara" },
  { value: "FI", label: "Firenze" },
  { value: "FG", label: "Foggia" },
  { value: "FC", label: "Forlì-Cesena" },
  { value: "FR", label: "Frosinone" },
  { value: "GE", label: "Genova" },
  { value: "GO", label: "Gorizia" },
  { value: "GR", label: "Grosseto" },
  { value: "IM", label: "Imperia" },
  { value: "IS", label: "Isernia" },
  { value: "SP", label: "La Spezia" },
  { value: "AQ", label: "L'Aquila" },
  { value: "LT", label: "Latina" },
  { value: "LE", label: "Lecce" },
  { value: "LC", label: "Lecco" },
  { value: "LI", label: "Livorno" },
  { value: "LO", label: "Lodi" },
  { value: "LU", label: "Lucca" },
  { value: "MC", label: "Macerata" },
  { value: "MN", label: "Mantova" },
  { value: "MS", label: "Massa-Carrara" },
  { value: "MT", label: "Matera" },
  { value: "ME", label: "Messina" },
  { value: "MI", label: "Milano" },
  { value: "MO", label: "Modena" },
  { value: "MB", label: "Monza e Brianza" },
  { value: "NA", label: "Napoli" },
  { value: "NO", label: "Novara" },
  { value: "NU", label: "Nuoro" },
  { value: "OR", label: "Oristano" },
  { value: "PD", label: "Padova" },
  { value: "PA", label: "Palermo" },
  { value: "PR", label: "Parma" },
  { value: "PV", label: "Pavia" },
  { value: "PG", label: "Perugia" },
  { value: "PU", label: "Pesaro e Urbino" },
  { value: "PE", label: "Pescara" },
  { value: "PC", label: "Piacenza" },
  { value: "PI", label: "Pisa" },
  { value: "PT", label: "Pistoia" },
  { value: "PN", label: "Pordenone" },
  { value: "PZ", label: "Potenza" },
  { value: "PO", label: "Prato" },
  { value: "RG", label: "Ragusa" },
  { value: "RA", label: "Ravenna" },
  { value: "RC", label: "Reggio Calabria" },
  { value: "RE", label: "Reggio Emilia" },
  { value: "RI", label: "Rieti" },
  { value: "RN", label: "Rimini" },
  { value: "RM", label: "Roma" },
  { value: "RO", label: "Rovigo" },
  { value: "SA", label: "Salerno" },
  { value: "SS", label: "Sassari" },
  { value: "SV", label: "Savona" },
  { value: "SI", label: "Siena" },
  { value: "SR", label: "Siracusa" },
  { value: "SO", label: "Sondrio" },
  { value: "SU", label: "Sud Sardegna" },
  { value: "TA", label: "Taranto" },
  { value: "TE", label: "Teramo" },
  { value: "TR", label: "Terni" },
  { value: "TO", label: "Torino" },
  { value: "TP", label: "Trapani" },
  { value: "TN", label: "Trento" },
  { value: "TV", label: "Treviso" },
  { value: "TS", label: "Trieste" },
  { value: "UD", label: "Udine" },
  { value: "VA", label: "Varese" },
  { value: "VE", label: "Venezia" },
  { value: "VB", label: "Verbano-Cusio-Ossola" },
  { value: "VC", label: "Vercelli" },
  { value: "VR", label: "Verona" },
  { value: "VV", label: "Vibo Valentia" },
  { value: "VI", label: "Vicenza" },
  { value: "VT", label: "Viterbo" }
] as const;

export type Provincia = typeof PROVINCE_ITALIANE[number]; 