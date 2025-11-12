# Verhoeven Zagerij - EUDR Demo Applicatie

Een demo applicatie die de volledige EUDR (European Union Deforestation Regulation) traceability flow simuleert voor een houtzagerij.

## 🌲 Overzicht

Deze applicatie demonstreert hoe Verhoeven Zagerij de complete keten van rondhout naar tussenproducten kan traceren volgens EUDR regelgeving. De app simuleert de volledige workflow van EUDR validatie tot eindrapportage.

## 🔄 Proces Flow

1. **EUDR Validatie** - Chauffeur vult EUDR nummer in, systeem valideert via (gesimuleerd) TRACES
2. **Ontvangst Registratie** - Registreer leverancier, CMR/PEFC nummers en hout specificaties
3. **Voorraad Beheer** - Overzicht van alle voorraad met TRACES IDs
4. **Productie Runs** - Weekly batch systeem met unieke batch nummers
5. **Batch Rapporten** - Volledige traceability van input naar output producten

## 🚀 Installatie & Setup

```bash
# Clone of download het project
cd demo-verhoeven-emballage

# Installeer dependencies
npm install

# Start development server
npm run dev
```

De applicatie is beschikbaar op: http://localhost:3000

## 📱 Gebruik van de Demo

### Stap 1: EUDR Validatie
- Ga naar "EUDR Validatie"
- Vul chauffeur naam in
- Gebruik een test EUDR nummer:
  - `EUDR-2024-001` (Geldig - Duitsland)
  - `EUDR-2024-002` (Geldig - Polen) 
  - `EUDR-2024-003` (Ongeldig)
  - `EUDR-2024-004` (Geldig - België)
  - `EUDR-2024-005` (Geldig - Frankrijk)

### Stap 2: Ontvangst Registreren
- Na succesvolle EUDR validatie → "Naar Ontvangst"
- Vul leverancier details in
- Voeg CMR en PEFC nummers toe
- Specificeer houtsoort en volume
- Registreer ontvangst

### Stap 3: Voorraad Bekijken  
- Ga naar "Voorraad" om alle ontvangen materialen te zien
- Filter op status, houtsoort of sorteer op verschillende criteria
- Bekijk TRACES IDs en beschikbare volumes

### Stap 4: Productie Run Aanmaken
- Ga naar "Productie Run"
- Selecteer de productieweek (meestal vorige week)
- Alle leveringen van die week worden automatisch geselecteerd
- Zet eventueel vrachten uit die niet mee moeten doen
- Maak de productie run aan (gebeurt achteraf, na de productieweek)

### Stap 5: Rapporten Bekijken
- Ga naar "Rapporten"
- Selecteer voltooide batch voor gedetailleerd rapport
- Bekijk product uitkomsten (plankjes, zaagsel, chips)
- Volledige traceability van alle gebruikte TRACES IDs

## 📊 Dashboard

Het dashboard geeft een volledig overzicht van:
- Totaal aantal ontvangsten en voorraad volumes
- Actieve en voltooide productie runs  
- Recente activiteiten
- EUDR compliance status
- Snelle toegang tot alle functies

## 🔧 Features

### EUDR Compliance
- ✅ Volledige TRACES integratie (gesimuleerd)
- ✅ EUDR nummer validatie
- ✅ Leverancier en herkomst registratie
- ✅ CMR en PEFC certificering tracking

### Traceability 
- ✅ Unieke TRACES IDs voor elke levering
- ✅ Weekly batch nummers voor productie runs (achteraf aangemaakt)
- ✅ Automatische selectie van alle leveringen per week
- ✅ Flexibiliteit om vrachten uit te zetten
- ✅ Volledige koppeling input → output
- ✅ Gedetailleerde rapporten met herkomst info

### Gebruiksgemak
- ✅ Visueel simpele interface
- ✅ Stap-voor-stap workflow
- ✅ Real-time validatie en feedback
- ✅ Responsive design voor verschillende apparaten

## 💾 Data Opslag

De demo gebruikt browser localStorage voor data persistentie. Alle data blijft beschikbaar zolang de browser cache niet gewist wordt.

### Reset Demo Data
- Ga naar Dashboard
- Klik "Reset Demo" om alle data te wissen
- Of wis browser localStorage handmatig

## 🎯 Demo Scenario

Voor een volledige demo workflow:

1. Registreer 3-4 verschillende ontvangsten met verschillende EUDR nummers
2. Start een productie run en voeg verschillende TRACES toe
3. Voltooi de productie run
4. Bekijk het batch rapport met volledige traceability
5. Herhaal voor meerdere weken om trend te zien

## 🛠️ Technische Details

- **Framework**: Next.js 14 met App Router
- **Styling**: Tailwind CSS met custom thema
- **TypeScript**: Volledig getypeerd
- **State Management**: React hooks + localStorage
- **Responsive**: Mobile-first design

## 🌍 EUDR Compliance

Deze demo toont aan hoe een moderne web applicatie kan voldoen aan:
- EUDR Article 3 - Due diligence requirements
- EUDR Article 4 - Traceability requirements  
- EUDR Article 5 - Information requirements
- Volledige keten van bos tot eindproduct tracking

## 📝 Volgende Stappen

Voor productie implementatie zou de applicatie uitgebreid kunnen worden met:
- Echte TRACES API integratie
- Database backend (PostgreSQL/MySQL)
- Gebruikers authenticatie en autorisatie
- PDF rapport generatie
- Email notificaties
- Backup en sync functionaliteit
- Barcode/QR code scanning
- Mobiele app voor chauffeurs

## 📞 Contact

Deze demo is ontwikkeld voor Verhoeven Zagerij om de mogelijkheden van een moderne EUDR traceability systeem te demonstreren.