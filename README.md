# Generador LOTO · Cerámica Mayor

**PR-DT-SEG-LOTO · Dirección Técnica · Rev. 01 · 2026**

Aplicación web interna para generar fichas LOTO de campo, imprimibles en A4 y plastificables para instalar en cuadros eléctricos y máquinas de planta.

## Acceso rápido

🔗 **[Abrir aplicación](https://TU_USUARIO.github.io/loto-ceramica/)**

## Funcionalidades

- Generación de fichas LOTO individuales por equipo o cuadro
- Vista previa en tiempo real formato A4
- Identificación de puntos de aislamiento con tipo de energía y candado asignado
- Sección de energías residuales con protocolo de disipación
- Checklist de verificación de energía cero
- EPI obligatorios por equipo
- Registro de intervenciones integrado en la ficha
- Guardado de borrador en localStorage (persiste entre sesiones)
- Impresión directa optimizada para A4 → PDF

## Estructura

```
loto-ceramica/
├── index.html          → App principal
├── css/
│   └── styles.css      → Estilos + identidad corporativa Cerámica Mayor
├── js/
│   └── app.js          → Lógica de la aplicación
└── README.md
```

## Uso local

1. Clonar el repositorio
2. Abrir `index.html` directamente en el navegador (no requiere servidor)
3. O usar Live Server en VSCode para desarrollo

## Publicar en GitHub Pages

1. Settings → Pages
2. Source: Deploy from branch → `main` → `/root`
3. URL disponible en ~2 minutos

## Plan de rollout LOTO · Cerámica Mayor

| Fase | Plazo | Equipos |
|------|-------|---------|
| 1 · Cuadros críticos | Mes 1 · Semanas 1-2 | CGBT, horno, prensas, compresor, F2 Schneider |
| 2 · Cuadros restantes | Mes 1-2 | 20 cuadros restantes (2-3 por semana) |
| 3 · Máquinas alto riesgo | Mes 2-3 | Horno, secaderos, Kerajet, robot UR20, prensas |
| 4 · Resto máquinas | Mes 3-5 | 180 máquinas por zonas |
| Simulacro y auditoría | Mes 6 | Planta completa |

## Referencia documental

- `PR-DT-SEG-LOTO-01` → Procedimiento Maestro LOTO
- `PR-DT-SEG-LOTO-FICHA` → Esta plantilla de ficha de campo

---

*Cerámica Mayor · Dirección Técnica · Alejandro Berenguer*
