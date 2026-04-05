import { createElement } from 'react'
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll.js'
import { classNames } from '../../utils/classNames.js'

export default function Reveal({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  threshold,
}) {
  const { ref, isVisible } = useRevealOnScroll({ threshold })

  return createElement(
    Component,
    {
      ref,
      className: classNames(
        'transform-gpu transition-all duration-700 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className,
      ),
      style: { transitionDelay: `${delay}ms` },
    },
    children,
  )
}
