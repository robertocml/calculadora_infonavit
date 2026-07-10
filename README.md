# Calculadora INFONAVIT

Web app 100% del lado del cliente (sin backend) para analizar tu crédito INFONAVIT y planear cómo liquidarlo antes.

## ¿Qué hace?

1. Carga tu **Estado de Cuenta Histórico** (PDF) de INFONAVIT/Hipotecaria Social arrastrándolo al navegador.
2. Extrae automáticamente los datos del crédito (monto, tasa, plazo, saldo, mensualidad, movimientos) usando [pdf.js](https://mozilla.github.io/pdf.js/) — todo se procesa en tu navegador, el PDF nunca se sube a ningún servidor.
3. Muestra una gráfica interactiva de "Sin pagos extra" vs. "Con pagos extra" para que veas cómo cae tu deuda si haces abonos mensuales y/o anuales anticipados.
4. Incluye herramientas para acelerar la liquidación:
   - Comparador de estrategias (distintos montos de abono extra).
   - Calculadora de meta ("quiero liquidar en X años, ¿cuánto abono extra necesito?").
   - Barra de avance (% de capital liquidado y tiempo transcurrido).
   - Tabla de movimientos editable, por si el PDF no se leyó perfecto.

Los datos capturados se guardan solo en `localStorage` de tu navegador (nunca en un servidor); puedes borrarlos en cualquier momento con "Cargar otro PDF".

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue en GitHub Pages

El workflow en `.github/workflows/deploy.yml` construye y publica automáticamente a GitHub Pages en cada push a `main`.

Para activarlo (solo una vez): en GitHub ve a **Settings → Pages** y en "Build and deployment" selecciona **Source: GitHub Actions**. Después de eso, cada push a `main` publicará la app en `https://robertocml.github.io/calculadora_infonavit/`.

## Aviso

Herramienta independiente, sin relación oficial con INFONAVIT. Los cálculos son estimaciones basadas en amortización estándar (pago fijo, interés compuesto mensual) y no sustituyen tu estado de cuenta oficial.
