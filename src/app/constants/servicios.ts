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
    icono: '📶',
    descripcion: 'Internet inalámbrico de alta velocidad'
  },
  {
    id: 'WiFi Premium',
    nombre: 'WiFi Premium',
    icono: '🚀',
    descripcion: 'Internet inalámbrico ultra rápido'
  },
  {
    id: 'TV',
    nombre: 'TV',
    icono: '📺',
    descripcion: 'Televisión por cable'
  },
  {
    id: 'TV Smart',
    nombre: 'TV Smart',
    icono: '📱',
    descripcion: 'Televisión inteligente con aplicaciones'
  },
  {
    id: 'Aire Acondicionado',
    nombre: 'Aire Acondicionado',
    icono: '❄️',
    descripcion: 'Sistema de climatización'
  },
  {
    id: 'Calefacción',
    nombre: 'Calefacción',
    icono: '🔥',
    descripcion: 'Sistema de calefacción'
  },
  {
    id: 'Minibar',
    nombre: 'Minibar',
    icono: '🍷',
    descripcion: 'Minibar con bebidas y snacks'
  },
  {
    id: 'Desayuno incluido',
    nombre: 'Desayuno',
    icono: '🍳',
    descripcion: 'Desayuno incluido en la tarifa'
  },
  {
    id: 'Caja fuerte',
    nombre: 'Caja Fuerte',
    icono: '🔒',
    descripcion: 'Caja de seguridad en la habitación'
  },
  {
    id: 'Balcón',
    nombre: 'Balcón',
    icono: '🪴',
    descripcion: 'Balcón o terraza privada'
  },
  {
    id: 'Vista al mar',
    nombre: 'Vista al Mar',
    icono: '🌊',
    descripcion: 'Vista panorámica al océano'
  },
  {
    id: 'Vista a la montaña',
    nombre: 'Vista Montaña',
    icono: '⛰️',
    descripcion: 'Vista panorámica a las montañas'
  },
  {
    id: 'Jacuzzi',
    nombre: 'Jacuzzi',
    icono: '🛁',
    descripcion: 'Jacuzzi o bañera de hidromasaje'
  },
  {
    id: 'Escritorio',
    nombre: 'Escritorio',
    icono: '🖥️',
    descripcion: 'Área de trabajo con escritorio'
  },
  {
    id: 'Servicio a la habitación',
    nombre: 'Room Service',
    icono: '🍽️',
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
