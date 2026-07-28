/**
* Constantes compartidas por las vistas que consumen listados paginados.
*
* LIMITE_OPCIONES es el tope de registros que el backend permite pedir de una
* sola vez; se usa al llenar los desplegables de los formularios, que necesitan
* el catálogo completo y no una página.
*
* ESPERA_BUSQUEDA son los milisegundos que se espera tras la última tecla antes
* de consultar al servidor, para no disparar una petición por carácter.
**/
export const LIMITE_OPCIONES = 100;
export const ESPERA_BUSQUEDA = 300;
