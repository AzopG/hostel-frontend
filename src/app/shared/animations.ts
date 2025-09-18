import { 
  trigger, 
  state, 
  style, 
  transition, 
  animate, 
  keyframes, 
  query, 
  stagger, 
  group,
  sequence,
  animateChild
} from '@angular/animations';

// Animaciones de entrada y salida
export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(-100%)', opacity: 0 })
    )
  ])
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

export const slideUpDown = trigger('slideUpDown', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateY(0)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateY(-100%)', opacity: 0 })
    )
  ])
]);

export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0)', opacity: 0 }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
      style({ transform: 'scale(1)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('200ms ease-in', 
      style({ transform: 'scale(0)', opacity: 0 })
    )
  ])
]);

// Animaciones de hover y estados
export const buttonHover = trigger('buttonHover', [
  state('normal', style({ transform: 'scale(1)' })),
  state('hovered', style({ transform: 'scale(1.05)' })),
  transition('normal <=> hovered', animate('200ms ease-in-out'))
]);

export const cardHover = trigger('cardHover', [
  state('normal', style({ 
    transform: 'translateY(0px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  })),
  state('hovered', style({ 
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  })),
  transition('normal <=> hovered', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
]);

// Animaciones de listas
export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      stagger('50ms', [
        animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0px)' })
        )
      ])
    ], { optional: true })
  ])
]);

export const staggerAnimation = trigger('staggerAnimation', [
  transition(':enter', [
    query('.stagger-item', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('100ms', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ], { optional: true })
  ])
]);

// Animaciones de acordeón
export const accordionAnimation = trigger('accordionAnimation', [
  state('expanded', style({ height: '*', opacity: 1 })),
  state('collapsed', style({ height: '0px', opacity: 0 })),
  transition('expanded <=> collapsed', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Animaciones de notificaciones/toasts
export const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(100%)', opacity: 0 })
    )
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
      style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(1.1)', opacity: 0.7, offset: 0.6 }),
      style({ transform: 'scale(0.95)', opacity: 0.9, offset: 0.8 }),
      style({ transform: 'scale(1)', opacity: 1, offset: 1 })
    ]))
  ])
]);

// Animaciones de carga
export const pulseAnimation = trigger('pulseAnimation', [
  state('active', style({ transform: 'scale(1)' })),
  transition('* => active', [
    animate('1s ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const spinAnimation = trigger('spinAnimation', [
  transition(':enter', [
    style({ transform: 'rotate(0deg)' }),
    animate('1s linear', style({ transform: 'rotate(360deg)' }))
  ])
]);

// Animaciones de modal/overlay
export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    group([
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 })),
      query('.modal-content', [
        style({ transform: 'scale(0.7)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'scale(1)', opacity: 1 })
        )
      ])
    ])
  ]),
  transition(':leave', [
    group([
      animate('200ms ease-in', style({ opacity: 0 })),
      query('.modal-content', [
        animate('200ms ease-in', 
          style({ transform: 'scale(0.7)', opacity: 0 })
        )
      ])
    ])
  ])
]);

// Animaciones para sidebar/navegación
export const slideInFromLeft = trigger('slideInFromLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(0)' })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(-100%)' })
    )
  ])
]);

export const expandCollapse = trigger('expandCollapse', [
  state('expanded', style({
    height: '*',
    opacity: 1,
    overflow: 'visible'
  })),
  state('collapsed', style({
    height: '0',
    opacity: 0,
    overflow: 'hidden'
  })),
  transition('expanded <=> collapsed', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Animaciones de página/ruteo
export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        left: 0,
        width: '100%',
        opacity: 0,
        transform: 'scale(0.8)'
      })
    ], { optional: true }),
    
    query(':enter', [
      animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
        style({ opacity: 1, transform: 'scale(1)' })
      )
    ], { optional: true })
  ])
]);

export const pageSlide = trigger('pageSlide', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateX(-100%)', opacity: 0 })
    )
  ])
]);

// Animaciones complejas y micro-interacciones
export const buttonPress = trigger('buttonPress', [
  transition(':enter', [
    style({ transform: 'scale(1)' }),
    animate('100ms ease-in', style({ transform: 'scale(0.95)' })),
    animate('100ms ease-out', style({ transform: 'scale(1)' }))
  ])
]);

export const wiggle = trigger('wiggle', [
  transition('* => *', [
    animate('500ms ease-in-out', keyframes([
      style({ transform: 'rotate(0deg)', offset: 0 }),
      style({ transform: 'rotate(-3deg)', offset: 0.25 }),
      style({ transform: 'rotate(3deg)', offset: 0.75 }),
      style({ transform: 'rotate(0deg)', offset: 1 })
    ]))
  ])
]);

export const fadeInScale = trigger('fadeInScale', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.8)' }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ opacity: 1, transform: 'scale(1)' })
    )
  ]),
  transition(':leave', [
    animate('300ms ease-in', 
      style({ opacity: 0, transform: 'scale(0.8)' })
    )
  ])
]);

// Animación para elementos flotantes
export const floatingElement = trigger('floatingElement', [
  state('floating', style({
    transform: 'translateY(0px)'
  })),
  transition('* => floating', [
    animate('2s ease-in-out', keyframes([
      style({ transform: 'translateY(0px)', offset: 0 }),
      style({ transform: 'translateY(-10px)', offset: 0.5 }),
      style({ transform: 'translateY(0px)', offset: 1 })
    ]))
  ])
]);

// Utilidades para animaciones condicionales
export function conditionalAnimation(condition: boolean, animationTrigger: any) {
  return condition ? animationTrigger : [];
}

// Animaciones para diferentes tipos de contenido
export const contentAnimation = {
  list: listAnimation,
  card: cardHover,
  button: buttonHover,
  modal: modalAnimation,
  page: pageSlide,
  notification: slideInFromRight,
  loading: pulseAnimation
};

// Configuraciones de timing predefinidas
export const timings = {
  fast: '200ms ease-in-out',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.25, 0.8, 0.25, 1)',
  bounce: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};