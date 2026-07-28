import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend
);

/**
* Paleta de las gráficas. Estos hexes se validaron contra las dos superficies
* sobre las que se dibuja el mismo canvas: la tarjeta oscura de la aplicación
* (#232838) y el papel blanco al imprimir. Por eso no cambian según el tema: un
* solo juego de colores tiene que leerse bien en ambas.
*
* La paleta categórica se queda en tres entradas a propósito. En una dona
* cualquier par de porciones se compara entre sí, y a partir del cuarto color las
* parejas dejan de distinguirse con seguridad (incluso con visión normal), así que
* lo que exceda se agrupa en "Otros" con el gris neutro y el desglose exacto se
* muestra en la tabla que acompaña a la gráfica.
**/
export const SERIE = '#3987e5';
export const CATEGORICA = ['#3987e5', '#d95926', '#199e70'];
export const NEUTRO = '#898781';
export const MAXIMO_CATEGORIAS = CATEGORICA.length;

const TINTA = '#898781';
const REJILLA = 'rgba(137, 135, 129, 0.25)';

/**
* Agrupa una serie de categorías para que la dona nunca dibuje más colores de los
* que la paleta puede distinguir: conserva las mayores y suma el resto en "Otros".
*
* @param {Array} filas datos ya ordenados de mayor a menor
* @param {string} etiqueta nombre del campo que identifica la categoría
* @param {string} valor nombre del campo numérico a sumar
* @returns {{etiquetas: string[], valores: number[], colores: string[]}} datos listos para Chart.js
**/
export const agruparCategorias = (filas, etiqueta, valor) => {
  const principales = filas.slice(0, MAXIMO_CATEGORIAS);
  const resto = filas.slice(MAXIMO_CATEGORIAS);

  const etiquetas = principales.map((f) => f[etiqueta]);
  const valores = principales.map((f) => Number(f[valor]) || 0);
  const colores = principales.map((_, i) => CATEGORICA[i]);

  if (resto.length) {
    etiquetas.push(`Otros (${resto.length})`);
    valores.push(resto.reduce((suma, f) => suma + (Number(f[valor]) || 0), 0));
    colores.push(NEUTRO);
  }

  return { etiquetas, valores, colores };
};

/**
* Opciones comunes de las gráficas de ejes. Sin animación para que el canvas esté
* siempre pintado al mandar a imprimir, y con la leyenda apagada porque todas las
* gráficas de barras y líneas del reporte son de una sola serie: quien nombra el
* dato es el título del panel, no una caja de color.
*
* @param {object} extra opciones específicas de cada gráfica
* @returns {object} configuración para Chart.js
**/
export const opcionesEjes = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { padding: 10, boxPadding: 4 },
  },
  scales: {
    x: {
      ticks: { color: TINTA, font: { size: 11 } },
      grid: { color: REJILLA, drawTicks: false },
      border: { color: REJILLA },
    },
    y: {
      beginAtZero: true,
      ticks: { color: TINTA, font: { size: 11 } },
      grid: { color: REJILLA, drawTicks: false },
      border: { color: REJILLA },
    },
  },
  ...extra,
});

/**
* Opciones de la dona. Aquí sí hay leyenda porque el color es lo que identifica a
* cada porción, y va acompañada del monto exacto en la tabla contigua.
*
* @returns {object} configuración para Chart.js
**/
export const opcionesDona = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  cutout: '58%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: TINTA, boxWidth: 12, boxHeight: 12, padding: 14, font: { size: 12 } },
    },
    tooltip: { padding: 10, boxPadding: 4 },
  },
});
