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

const columns = [
  { key: 'codigo_medicamento', label: 'Código' },
  { key: 'nombre_medicamento', label: 'Nombre' },
  { key: 'presentacion', label: 'Presentación', path: 'presentacion.nombre_presentacion' },
  { key: 'precio_venta', label: 'Precio venta', type: 'money' },
  { key: 'existencia_total', label: 'Existencia' },
  { key: 'estado_medicamento', label: 'Estado', type: 'estado' },
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
