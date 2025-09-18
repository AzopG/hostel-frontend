import { trigger, state, style, transition, animate, query, stagger, group, keyframes } from '@angular/animations';

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

// Fade con escalado
export const fadeInScale = trigger('fadeInScale', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1)' })
    )
  ]),
  transition(':leave', [
    animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ opacity: 0, transform: 'scale(0.95)' })
    )
  ])
]);

// Animación de lista con stagger
export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('50ms', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 1, transform: 'translateY(0)' })
      ))
    ], { optional: true }),
    query(':leave', [
      stagger('50ms', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 0, transform: 'translateY(-20px)' })
      ))
    ], { optional: true })
  ])
]);

// Animación de slide vertical
export const slideUpDown = trigger('slideUpDown', [
  state('up', style({ transform: 'translateY(0)', opacity: 1 })),
  state('down', style({ transform: 'translateY(100%)', opacity: 0 })),
  transition('up <=> down', animate('250ms cubic-bezier(0.4, 0, 0.2, 1)'))
]);

// Rotación para iconos
export const rotateIcon = trigger('rotateIcon', [
  state('default', style({ transform: 'rotate(0deg)' })),
  state('rotated', style({ transform: 'rotate(180deg)' })),
  transition('default <=> rotated', animate('200ms ease-in-out'))
]);

// Bounce effect para botones
export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
      style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(0.3)', opacity: 0.3, offset: 0.3 }),
      style({ transform: 'scale(1.05)', opacity: 0.8, offset: 0.8 }),
      style({ transform: 'scale(1)', opacity: 1, offset: 1 })
    ]))
  ])
]);

// Shake para errores
export const shakeAnimation = trigger('shake', [
  transition('* => error', [
    animate('0.5s', keyframes([
      style({ transform: 'translateX(0)' }),
      style({ transform: 'translateX(-10px)' }),
      style({ transform: 'translateX(10px)' }),
      style({ transform: 'translateX(-10px)' }),
      style({ transform: 'translateX(10px)' }),
      style({ transform: 'translateX(-5px)' }),
      style({ transform: 'translateX(5px)' }),
      style({ transform: 'translateX(0)' })
    ]))
  ])
]);

// Pulse para notificaciones
export const pulseAnimation = trigger('pulse', [
  state('inactive', style({ transform: 'scale(1)' })),
  state('active', style({ transform: 'scale(1.05)' })),
  transition('inactive <=> active', [
    animate('0.5s ease-in-out')
  ])
]);

// Slide para modales
export const slideModal = trigger('slideModal', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    group([
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ transform: 'translateY(0)' })
      ),
      animate('200ms ease-out', 
        style({ opacity: 1 })
      )
    ])
  ]),
  transition(':leave', [
    group([
      animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ transform: 'translateY(-100%)' })
      ),
      animate('150ms ease-in', 
        style({ opacity: 0 })
      )
    ])
  ])
]);

// Expand/Collapse para acordeones
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0px', overflow: 'hidden' })),
  state('expanded', style({ height: '*', overflow: 'visible' })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Flip card effect
export const flipCard = trigger('flipCard', [
  state('default', style({ transform: 'rotateY(0)' })),
  state('flipped', style({ transform: 'rotateY(-180deg)' })),
  transition('default => flipped', [
    animate('600ms ease-in-out')
  ]),
  transition('flipped => default', [
    animate('600ms ease-in-out')
  ])
]);

// Zoom para hover effects
export const zoomHover = trigger('zoomHover', [
  state('default', style({ transform: 'scale(1)' })),
  state('hovered', style({ transform: 'scale(1.02)' })),
  transition('default <=> hovered', [
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Typing effect para texto
export const typeWriter = trigger('typeWriter', [
  transition(':enter', [
    style({ width: '0ch', opacity: 0 }),
    animate('2s steps(40, end)', style({ width: '*ch', opacity: 1 }))
  ])
]);

// Loading spinner
export const spinLoader = trigger('spinLoader', [
  state('spinning', style({ transform: 'rotate(360deg)' })),
  transition('* => spinning', [
    animate('1s linear', style({ transform: 'rotate(360deg)' }))
  ])
]);

// Progress bar fill
export const progressFill = trigger('progressFill', [
  state('empty', style({ width: '0%' })),
  state('filled', style({ width: '{{width}}%' }), { params: { width: 100 } }),
  transition('empty => filled', [
    animate('{{duration}}ms cubic-bezier(0.4, 0, 0.2, 1)')
  ], { params: { duration: 1000 } })
]);

// Count up animation
export const countUp = trigger('countUp', [
  transition(':increment', [
    style({ transform: 'translateY(-20px)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);

// Page transition
export const pageTransition = trigger('pageTransition', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' })
    ], { optional: true }),
    query(':leave', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 0, transform: 'translateX(-100%)' })
      )
    ], { optional: true }),
    query(':enter', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 1, transform: 'translateX(0%)' })
      )
    ], { optional: true })
  ])
]);

// Micro-interactions
export const buttonPress = trigger('buttonPress', [
  state('pressed', style({ transform: 'scale(0.98)' })),
  state('released', style({ transform: 'scale(1)' })),
  transition('released => pressed', animate('100ms ease-out')),
  transition('pressed => released', animate('100ms ease-out'))
]);

export const cardHover = trigger('cardHover', [
  state('default', style({ 
    transform: 'translateY(0) scale(1)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  })),
  state('hovered', style({ 
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  })),
  transition('default <=> hovered', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Notification toast
export const toastSlide = trigger('toastSlide', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(100%)', opacity: 0 })
    )
  ])
]);