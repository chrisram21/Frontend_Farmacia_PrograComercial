<template>
  <AppLayout title="Clientes">
    <ResourceCrud title="Listado de clientes" singular="cliente"
      api-path="/clientes" pk="id_cliente" :columns="columns" :fields="fields"
      :write-roles="[ROLES.VENDEDOR]" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';
import { ROLES } from '../config/roles.js';

const columns = [
  { key: 'id_cliente', label: '#' },
  { key: 'nombre_cliente', label: 'Nombre' },
  { key: 'nit_cliente', label: 'NIT' },
];
const fields = [
  { key: 'nombre_cliente', label: 'Nombre', type: 'text' },
  { key: 'nit_cliente', label: 'NIT', type: 'text' },
];
</script>
