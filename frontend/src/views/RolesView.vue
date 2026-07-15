<template>
  <AppLayout title="Roles">
    <ResourceCrud title="Listado de roles" singular="rol"
      api-path="/roles" pk="id_rol" :columns="columns" :fields="fields" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';

const columns = [
  { key: 'nombre_rol', label: 'Nombre' },
  { key: 'estado_rol', label: 'Estado', type: 'bool' },
];
const fields = [
  { key: 'nombre_rol', label: 'Nombre', type: 'text' },
  { key: 'estado_rol', label: 'Estado', type: 'boolean' },
];
</script>
