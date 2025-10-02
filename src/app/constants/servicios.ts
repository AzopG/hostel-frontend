/**
 * HU06: Servicios adicionales disponibles para filtrar habitaciones
 */

export interface ServicioDisponible {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

/**
 * Lista de servicios comunes en habitaciones del sistema
 */
export const SERVICIOS_DISPONIBLES: ServicioDisponible[] = [
  {
    id: 'WiFi',
    nombre: 'WiFi',
    icono: '<i class="fas fa-wifi"></i>',
    descripcion: 'Internet inalámbrico de alta velocidad'
  },
  {
    id: 'WiFi Premium',
    nombre: 'WiFi Premium',
    icono: '<i class="fas fa-rocket"></i>',
    descripcion: 'Internet inalámbrico ultra rápido'
  },
  {
    id: 'TV',
    nombre: 'TV',
    icono: '<i class="fas fa-tv"></i>',
    descripcion: 'Televisión por cable'
  },
  {
    id: 'TV Smart',
    nombre: 'TV Smart',
    icono: '<i class="fas fa-mobile-alt"></i>',
    descripcion: 'Televisión inteligente con aplicaciones'
  },
  {
    id: 'Aire Acondicionado',
    nombre: 'Aire Acondicionado',
    icono: '<i class="fas fa-snowflake"></i>',
    descripcion: 'Sistema de climatización'
  },
  {
    id: 'Calefacción',
    nombre: 'Calefacción',
    icono: '<i class="fas fa-fire"></i>',
    descripcion: 'Sistema de calefacción'
  },
  {
    id: 'Minibar',
    nombre: 'Minibar',
    icono: '<i class="fas fa-wine-glass"></i>',
    descripcion: 'Minibar con bebidas y snacks'
  },
  {
    id: 'Desayuno incluido',
    nombre: 'Desayuno',
    icono: '<i class="fas fa-utensils"></i>',
    descripcion: 'Desayuno incluido en la tarifa'
  },
  {
    id: 'Caja fuerte',
    nombre: 'Caja Fuerte',
    icono: '<i class="fas fa-lock"></i>',
    descripcion: 'Caja de seguridad en la habitación'
  },
  {
    id: 'Balcón',
    nombre: 'Balcón',
    icono: '<i class="fas fa-seedling"></i>',
    descripcion: 'Balcón o terraza privada'
  },
  {
    id: 'Vista al mar',
    nombre: 'Vista al Mar',
    icono: '<i class="fas fa-water"></i>',
    descripcion: 'Vista panorámica al océano'
  },
  {
    id: 'Vista a la montaña',
    nombre: 'Vista Montaña',
    icono: '<i class="fas fa-mountain"></i>',
    descripcion: 'Vista panorámica a las montañas'
  },
  {
    id: 'Jacuzzi',
    nombre: 'Jacuzzi',
    icono: '<i class="fas fa-bath"></i>',
    descripcion: 'Jacuzzi o bañera de hidromasaje'
  },
  {
    id: 'Escritorio',
    nombre: 'Escritorio',
    icono: '<i class="fas fa-desktop"></i>',
    descripcion: 'Área de trabajo con escritorio'
  },
  {
    id: 'Servicio a la habitación',
    nombre: 'Room Service',
    icono: '<i class="fas fa-concierge-bell"></i>',
    descripcion: 'Servicio de comida a la habitación 24h'
  }
];

/**
 * Obtener servicio por ID
 */
export function getServicioById(id: string): ServicioDisponible | undefined {
  return SERVICIOS_DISPONIBLES.find(s => s.id === id);
}

/**
 * Obtener servicios por IDs
 */
export function getServiciosByIds(ids: string[]): ServicioDisponible[] {
  return ids.map(id => getServicioById(id)).filter(s => s !== undefined) as ServicioDisponible[];
}
