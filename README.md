# Pianificazione Turni & Costi Grocery AI

Applicazione web reattiva per la **previsione bisettimanale dei colli**, **pianificazione dei turni** e **controllo dei costi del lavoro** per magazzini e supermercati Grocery.

## Caratteristiche Principali

- **Pianificazione Bisettimanale Dinamica (14 Giorni)**: Calcolo automatico delle date a partire dall'ultimo giorno presente nelle distinte ordini (partenza dal lunedì successivo).
- **Modello Previsionale Gradient Boosting a 2 Stadi**:
  - Stadio 1: Analisi del rischio di taglio/rottura d'ordine su colli ordinati.
  - Stadio 2: Regressione e proiezione dei colli effettivi da allestire (target Colonna L) per ciascuno dei 5 sottoreparti:
    - ALIMENTARI
    - CHIMICA
    - LIQUIDI
    - PETFOOD
    - PROFUMERIA
- **Regola di Arrotondamento Soglia 0,50**:
  - Parte decimale < 0,50 → Arrotondamento per difetto (floor)
  - Parte decimale ≥ 0,50 → Arrotondamento per eccesso (ceil)
  - Copertura flessibile dei resti scoperti tramite **Addetti Jolly Mobilità Interna**.
- **Simulatore What-If Parametri Operativi**:
  - Costo Orario Allestitore 4° Livello (€/h)
  - Durata Turno Allestitori (ore)
  - Rese Orarie Target per Sottoreparto (colli/ora)
- **Visualizzazioni e Report**:
  - 📅 **1. Tabellone Turni & Costi 14 Giorni**: Visione d'insieme con subtotali Settimana 1, Settimana 2 e Totale Generale.
  - 📊 **2. Produttività & Costi per Sottoreparto**: Analisi resa, saturazione del presidio e costo unitario per collo.
  - 📦 **3. Previsione Colli (Colonna L)**: Grafico a barre interattivo (impilato o raggruppato) e matrice giornaliera.
  - 🔍 **4. Esploso Giornaliero Sottoreparti**: Dettaglio analitico con filtri per settimana e sottoreparto.
  - 📈 **5. Sintesi Multi-Orizzonte**: Proiezione strategica su Settimana 1, 2 Settimane, Mese (30gg) e Trimestre (13 sett.).
- **Esportazione Report Excel (5 Fogli)**:
  - Generazione client-side del file `.xlsx` completo a 5 fogli esattamente corrispondente agli standard del report direzionale.

## Avvio Sviluppo

```bash
npm install
npm run dev
```
L'applicazione risponde su `http://localhost:3000`.
