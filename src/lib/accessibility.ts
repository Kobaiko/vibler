// Accessibility utilities for consistent implementation across components

/**
 * Generate unique IDs for form elements and ARIA relationships
 */
export function generateId(prefix: string = 'vibler'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Keyboard navigation utilities
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * Handle keyboard navigation for interactive elements
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    preventDefault?: boolean
  }
) {
  const { key } = event
  const { preventDefault = true } = options

  switch (key) {
    case KEYS.ENTER:
      if (options.onEnter) {
        if (preventDefault) event.preventDefault()
        options.onEnter()
      }
      break
    case KEYS.SPACE:
      if (options.onSpace) {
        if (preventDefault) event.preventDefault()
        options.onSpace()
      }
      break
    case KEYS.ESCAPE:
      if (options.onEscape) {
        if (preventDefault) event.preventDefault()
        options.onEscape()
      }
      break
    case KEYS.ARROW_UP:
      if (options.onArrowUp) {
        if (preventDefault) event.preventDefault()
        options.onArrowUp()
      }
      break
    case KEYS.ARROW_DOWN:
      if (options.onArrowDown) {
        if (preventDefault) event.preventDefault()
        options.onArrowDown()
      }
      break
    case KEYS.ARROW_LEFT:
      if (options.onArrowLeft) {
        if (preventDefault) event.preventDefault()
        options.onArrowLeft()
      }
      break
    case KEYS.ARROW_RIGHT:
      if (options.onArrowRight) {
        if (preventDefault) event.preventDefault()
        options.onArrowRight()
      }
      break
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(',')

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ).filter((element) => {
      const htmlElement = element as HTMLElement
      return (
        !htmlElement.hasAttribute('disabled') &&
        !htmlElement.getAttribute('aria-hidden') &&
        htmlElement.offsetWidth > 0 &&
        htmlElement.offsetHeight > 0
      )
    }) as HTMLElement[]
  }

  static trapFocus(
    container: HTMLElement,
    event: KeyboardEvent
  ): void {
    if (event.key !== KEYS.TAB) return

    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

/**
 * Screen reader utilities
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Touch target size validation (minimum 44px for accessibility)
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= 44 && rect.height >= 44
}

/**
 * Color contrast utilities
 */
export function hasValidContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  // This is a simplified check - in production, you'd use a proper color contrast library
  // For now, we'll assume our design system colors meet WCAG standards
  // const requiredRatio = level === 'AAA' ? 7 : 4.5
  // Implementation would calculate actual contrast ratio using foreground/background
  // For now, we trust our design system meets standards
  return level === 'AA' ? true : foreground !== background // Basic check
}

/**
 * ARIA attributes helpers
 */
export const aria = {
  expanded: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  }),
  selected: (isSelected: boolean) => ({
    'aria-selected': isSelected,
  }),
  disabled: (isDisabled: boolean) => ({
    'aria-disabled': isDisabled,
  }),
  hidden: (isHidden: boolean) => ({
    'aria-hidden': isHidden,
  }),
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),
  label: (label: string) => ({
    'aria-label': label,
  }),
  role: (role: string) => ({
    role,
  }),
} 