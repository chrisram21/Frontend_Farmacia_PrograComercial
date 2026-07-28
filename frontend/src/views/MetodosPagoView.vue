<template>
  <AppLayout title="Métodos de pago">
    <ResourceCrud title="Listado de métodos de pago" singular="método de pago"
      api-path="/metodos-pago" pk="id_metodo_pago" :columns="columns" :fields="fields"
      :write-roles="[]" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';

const columns = [
  { key: 'nombre_metodo_pago', label: 'Nombre' },
  { key: 'estado_metodo_pago', label: 'Estado', type: 'bool' },
];
const fields = [
  { key: 'nombre_metodo_pago', label: 'Nombre', type: 'text' },
  { key: 'estado_metodo_pago', label: 'Estado', type: 'boolean' },
];
</script>
