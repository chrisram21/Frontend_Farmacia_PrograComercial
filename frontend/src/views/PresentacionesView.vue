<template>
  <AppLayout title="Presentaciones">
    <ResourceCrud title="Listado de presentaciones" singular="presentación"
      api-path="/presentaciones" pk="id_presentacion" :columns="columns" :fields="fields"
      :write-roles="[ROLES.BODEGUERO]" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';
import { ROLES } from '../config/roles.js';

const columns = [
  { key: 'nombre_presentacion', label: 'Nombre' },
  { key: 'estado_presentacion', label: 'Estado', type: 'bool' },
];
const fields = [
  { key: 'nombre_presentacion', label: 'Nombre', type: 'text' },
  { key: 'estado_presentacion', label: 'Estado', type: 'boolean' },
];
</script>
