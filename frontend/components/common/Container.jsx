import { createElement } from 'react'
import { classNames } from '../../utils/classNames.js'

export default function Container({
  as: Component = 'div',
  className = '',
  children,
}) {
  return createElement(
    Component,
    {
      className: classNames(
        'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
        className,
      ),
    },
    children,
  )
}
