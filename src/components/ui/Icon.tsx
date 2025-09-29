// Budget Douala - Composant Icon avec Heroicons
// Icônes centralisées pour remplacer les emojis et caractères ASCII

import {
  // Finances
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  
  // Actions
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  
  // Navigation
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  
  // Catégories
  HomeIcon,
  TruckIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  HeartIcon,
  FilmIcon,
  EllipsisHorizontalIcon,
  
  // États
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  
  // Interface
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

// Types d'icônes disponibles
export type IconName = 
  // Finances
  | 'currency' | 'banknotes' | 'credit-card' | 'chart'
  // Actions  
  | 'plus' | 'minus' | 'pencil' | 'trash' | 'check' | 'x-mark'
  // Navigation
  | 'arrow-right' | 'arrow-left' | 'arrow-path'
  // Catégories
  | 'home' | 'truck' | 'shopping-bag' | 'phone' | 'heart' | 'film' | 'ellipsis'
  // États
  | 'warning' | 'info' | 'success' | 'error'
  // Interface
  | 'settings' | 'eye' | 'eye-slash'

interface IconProps {
  name: IconName
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

// Mapping des noms vers les composants Heroicons
const iconMap = {
  // Finances
  'currency': CurrencyDollarIcon,
  'banknotes': BanknotesIcon,
  'credit-card': CreditCardIcon,
  'chart': ChartBarIcon,
  
  // Actions
  'plus': PlusIcon,
  'minus': MinusIcon,
  'pencil': PencilIcon,
  'trash': TrashIcon,
  'check': CheckIcon,
  'x-mark': XMarkIcon,
  
  // Navigation
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-path': ArrowPathIcon,
  
  // Catégories
  'home': HomeIcon,
  'truck': TruckIcon,
  'shopping-bag': ShoppingBagIcon,
  'phone': DevicePhoneMobileIcon,
  'heart': HeartIcon,
  'film': FilmIcon,
  'ellipsis': EllipsisHorizontalIcon,
  
  // États
  'warning': ExclamationTriangleIcon,
  'info': InformationCircleIcon,
  'success': CheckCircleIcon,
  'error': XCircleIcon,
  
  // Interface
  'settings': Cog6ToothIcon,
  'eye': EyeIcon,
  'eye-slash': EyeSlashIcon
}

// Classes de taille
const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

export default function Icon({ name, className = '', size = 'md' }: IconProps) {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}

// Export des icônes par catégorie pour faciliter l'usage
export const FinanceIcons = {
  salary: 'currency' as const,
  rent: 'home' as const,
  transport: 'truck' as const,
  food: 'shopping-bag' as const,
  data: 'phone' as const,
  health: 'heart' as const,
  leisure: 'film' as const,
  other: 'ellipsis' as const,
  savings: 'banknotes' as const
}

export const ActionIcons = {
  add: 'plus' as const,
  edit: 'pencil' as const,
  delete: 'trash' as const,
  save: 'check' as const,
  cancel: 'x-mark' as const,
  reset: 'arrow-path' as const,
  next: 'arrow-right' as const,
  back: 'arrow-left' as const
}

export const StatusIcons = {
  success: 'success' as const,
  error: 'error' as const,
  warning: 'warning' as const,
  info: 'info' as const
}
