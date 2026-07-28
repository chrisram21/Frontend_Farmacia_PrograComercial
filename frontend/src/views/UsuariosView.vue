<template>
  <AppLayout title="Usuarios">
    <ResourceCrud title="Listado de usuarios" singular="usuario"
      api-path="/usuarios" pk="id_usuario" :columns="columns" :fields="fields"
      :write-roles="[]" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/layout/AppLayout.vue';
import ResourceCrud from '../components/ui/ResourceCrud.vue';

const columns = [
  { key: 'nombre_usuario', label: 'Nombre' },
  { key: 'user', label: 'Usuario' },
  { key: 'correo_usuario', label: 'Correo' },
  { key: 'rol', label: 'Rol', path: 'rol.nombre_rol' },
  { key: 'estado_usuario', label: 'Estado', type: 'bool' },
];
const fields = [
  { key: 'nombre_usuario', label: 'Nombre completo', type: 'text' },
  { key: 'user', label: 'Usuario', type: 'text' },
  { key: 'password', label: 'Contraseña', type: 'password' },
  { key: 'correo_usuario', label: 'Correo', type: 'text' },
  { key: 'telefono_usuario', label: 'Teléfono', type: 'text' },
  { key: 'dpi_usuario', label: 'DPI', type: 'text' },
  { key: 'id_rol', label: 'Rol', type: 'select',
    optionsApi: '/roles', optionValue: 'id_rol', optionLabel: 'nombre_rol' },
  { key: 'estado_usuario', label: 'Estado', type: 'boolean' },
];
</script>
