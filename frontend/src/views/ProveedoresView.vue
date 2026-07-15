<template>
  <AppLayout title="Proveedores">
    <ResourceCrud title="Listado de proveedores" singular="proveedor"
      api-path="/proveedores" pk="id_proveedor" :columns="columns" :fields="fields" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';

const columns = [
  { key: 'nombre_proveedor', label: 'Nombre' },
  { key: 'nit_proveedor', label: 'NIT' },
  { key: 'telefono_proveedor', label: 'Teléfono' },
  { key: 'estado_proveedor', label: 'Estado', type: 'bool' },
];
const fields = [
  { key: 'nombre_proveedor', label: 'Nombre', type: 'text' },
  { key: 'nit_proveedor', label: 'NIT', type: 'text' },
  { key: 'telefono_proveedor', label: 'Teléfono', type: 'text' },
  { key: 'estado_proveedor', label: 'Estado', type: 'boolean' },
];
</script>
