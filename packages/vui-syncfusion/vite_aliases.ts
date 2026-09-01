import { fileURLToPath } from 'node:url'

const themePackages = [
  'ej2-base',
  'ej2-buttons',
  'ej2-splitbuttons',
  'ej2-inputs',
  'ej2-dropdowns',
  'ej2-calendars',
  'ej2-lists',
  'ej2-navigations',
  'ej2-popups',
  'ej2-notifications',
  'ej2-grids',
  'ej2-diagrams',
  'ej2-layouts',
  'ej2-gantt',
  'ej2-treegrid',
]

/** Vite aliases required when a workspace consumes the skin from source. */
export const syncfusionThemeAliases = themePackages.map(name => ({
  find: `@syncfusion/${name}`,
  replacement: fileURLToPath(
    new URL(`./node_modules/@syncfusion/${name}`, import.meta.url),
  ),
}))
