<template>
  <AppLayout title="Medicamentos">
    <ResourceCrud
      title="Listado de medicamentos"
      singular="medicamento"
      api-path="/medicamentos"
      pk="id_medicamento"
      :columns="columns"
      :fields="fields"
      :write-roles="[ROLES.BODEGUERO]"
    />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';
import { ROLES } from '../config/roles.js';

const DIAS_POR_VENCER = 30;

/**
* Fecha de hoy en formato YYYY-MM-DD segun la zona horaria del navegador, para
* poder comparar directamente contra fecha_vencimiento, que viaja como cadena.
*
* @returns {string} la fecha de hoy como YYYY-MM-DD
**/
const fechaHoy = () => {
  const ahora = new Date();
  const desfase = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 10);
};

/**
* Calcula las situaciones de urgencia de un medicamento con los mismos criterios
* que el endpoint de alertas del backend: stock bajo, por vencer y vencido. Un
* medicamento puede caer en mas de una a la vez.
*
* @param {object} med registro de medicamento devuelto por la API
* @returns {Array<{clase: string, texto: string}>} etiquetas a mostrar en la fila
**/
const alertasDe = (med) => {
  const hoy = fechaHoy();
  const vence = med.fecha_vencimiento;
  const etiquetas = [];

  if (vence && vence < hoy) {
    etiquetas.push({ clase: 'tag--red', texto: 'Vencido' });
  } else if (vence) {
    const limite = new Date(`${hoy}T00:00:00`);
    limite.setDate(limite.getDate() + DIAS_POR_VENCER);
    if (new Date(`${vence}T00:00:00`) <= limite) {
      etiquetas.push({ clase: 'tag--yellow', texto: 'Por vencer' });
    }
  }
  if (Number(med.existencia_total) <= Number(med.stock_minimo)) {
    etiquetas.push({ clase: 'tag--orange', texto: 'Stock bajo' });
  }
  return etiquetas;
};

const columns = [
  { key: 'codigo_medicamento', label: 'Código' },
  { key: 'nombre_medicamento', label: 'Nombre' },
  { key: 'presentacion', label: 'Presentación', path: 'presentacion.nombre_presentacion' },
  { key: 'precio_venta', label: 'Precio venta', type: 'money' },
  { key: 'existencia_total', label: 'Existencia' },
  { key: 'stock_minimo', label: 'Stock mínimo' },
  { key: 'fecha_vencimiento', label: 'Vence' },
  { key: 'estado_medicamento', label: 'Estado', type: 'estado' },
  {
    key: 'alertas',
    label: 'Alertas',
    render: (row) => {
      const etiquetas = alertasDe(row);
      if (!etiquetas.length) return '<span class="tag tag--green">Sin alertas</span>';
      return etiquetas.map((e) => `<span class="tag ${e.clase}">${e.texto}</span>`).join(' ');
    },
  },
];

const fields = [
  { key: 'codigo_medicamento', label: 'Código', type: 'text' },
  { key: 'nombre_medicamento', label: 'Nombre', type: 'text' },
  { key: 'componente', label: 'Componente', type: 'text' },
  { key: 'id_presentacion', label: 'Presentación', type: 'select',
    optionsApi: '/presentaciones', optionValue: 'id_presentacion', optionLabel: 'nombre_presentacion' },
  { key: 'cantidad_por_presentacion', label: 'Cantidad por presentación', type: 'number' },
  { key: 'precio_mayorista', label: 'Precio mayorista', type: 'number' },
  { key: 'precio_minimo', label: 'Precio mínimo', type: 'number' },
  { key: 'precio_venta', label: 'Precio de venta', type: 'number' },
  { key: 'existencia_total', label: 'Existencia total', type: 'number' },
  { key: 'stock_minimo', label: 'Stock mínimo', type: 'number' },
  { key: 'fecha_vencimiento', label: 'Fecha de vencimiento', type: 'date' },
  { key: 'estado_medicamento', label: 'Estado', type: 'select',
    optionValue: 'value', optionLabel: 'label',
    options: [
      { value: 'disponible', label: 'Disponible' },
      { value: 'agotado', label: 'Agotado' },
      { value: 'vencido', label: 'Vencido' },
    ] },
  { key: 'venta_libre', label: 'Venta libre', type: 'boolean' },
];
</script>
