import { createElement } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { classNames } from '../../utils/classNames.js'

const variants = {
  brand:
    'border border-brand-900 bg-brand-900 text-white hover:bg-brand-800 hover:border-brand-800',
  light:
    'border border-brand-200 bg-white text-brand-900 hover:-translate-y-0.5 hover:shadow-soft',
  outline:
    'border border-brand-200 bg-transparent text-brand-900 hover:bg-brand-50',
  ghost:
    'border border-white/20 bg-white/10 text-white hover:bg-white/20',
}

const sizes = {
  md: 'px-5 py-3 text-sm sm:px-6',
  lg: 'px-6 py-4 text-sm sm:px-7',
}

export default function PrimaryButton({
  children,
  className = '',
  icon: Icon = ArrowRight,
  showIcon = false,
  size = 'md',
  to,
  href,
  variant = 'brand',
  ...props
}) {
  const sharedClassName = classNames(
    'inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  )

  const content = (
    <>
      <span>{children}</span>
      {showIcon && Icon ? createElement(Icon, { className: 'size-4' }) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={sharedClassName} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={sharedClassName} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button className={sharedClassName} {...props}>
      {content}
    </button>
  )
}
