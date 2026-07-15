# Sistema de Farmacia — Frontend

Vue 3 + Vite + Vue Router + Pinia. Diseño oscuro inspirado en el template **Larkon**.

## Requisitos
- Node.js 22 o superior
- El backend corriendo en `http://localhost:3000`

## Instalación

```bash
npm install
cp .env.example .env   # ya viene una copia
```

## Ejecutar

```bash
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción (carpeta dist/)
npm run preview  # previsualiza el build
```

En desarrollo, Vite hace proxy de `/api` hacia el backend (ver `vite.config.js`),
así que no necesitas configurar CORS ni URLs absolutas.

## Acceso

- **usuario:** `admin`
- **contraseña:** `admin123`

## Estructura

```
src/
├── main.js                 # bootstrap de la app
├── App.vue
├── router/                 # rutas + guard de autenticación
├── stores/auth.js          # sesión (Pinia)
├── services/api.js         # cliente axios con JWT
├── assets/styles/main.css  # tema oscuro Larkon
├── components/
│   ├── layout/             # Sidebar, Topbar, AppLayout
│   └── ui/                 # StatCard, Modal, ResourceCrud (CRUD reutilizable)
└── views/                  # una vista por pantalla
    ├── LoginView.vue
    ├── DashboardView.vue
    ├── MedicamentosView.vue
    ├── VentasView.vue      # punto de venta con detalles
    ├── ClientesView.vue
    ├── ProveedoresView.vue
    ├── UsuariosView.vue
    ├── PresentacionesView.vue
    ├── MetodosPagoView.vue
    └── RolesView.vue
```

La mayoría de las vistas de catálogo se apoyan en el componente
`ResourceCrud`, que genera tabla + formulario modal a partir de una
configuración de columnas y campos. Así se mantiene un estilo consistente
y es fácil agregar nuevas entidades.
