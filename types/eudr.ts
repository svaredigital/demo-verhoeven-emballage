// Types voor de EUDR Traceability System
export interface EUDREntry {
  id: string;
  eudrNumber: string;
  tracesId: string;
  isValid: boolean;
  validatedAt: Date;
}

export interface Leverancier {
  naam: string;
  adres: string;
  land: string;
}

export interface Ontvangst {
  id: string;
  eudrNumber: string;
  tracesId: string;
  leverancier: Leverancier;
  cmrNumber: string;
  pefcNumber: string;
  houtType: string;
  volume: number; // in m3
  ontvangstDatum: Date;
  chauffeurNaam: string;
}

export interface VoorraadItem {
  id: string;
  tracesId: string;
  ontvangstId: string;
  houtType: string;
  volume: number;
  beschikbaarVolume: number;
  leverancier: string;
  ontvangstDatum: Date;
  status: 'beschikbaar' | 'in-productie' | 'verwerkt';
}

export interface ProductieRun {
  id: string;
  batchNummer: string;
  week: number;
  jaar: number;
  startDatum: Date;
  eindDatum?: Date;
  status: 'actief' | 'voltooid';
  gebruikteTraces: string[]; // Array van traces IDs
  inputVolume: number;
}

export interface BatchUitkomst {
  batchNummer: string;
  productieRunId: string;
  producten: {
    plankjes: number; // m3
    zaagsel: number; // m3
    chips: number; // m3
  };
  gebruikteTraces: {
    tracesId: string;
    volume: number;
    leverancier: string;
  }[];
  totaalInput: number;
  efficiencyPercentage: number;
}