import { type SVGProps } from 'react';
import {
  Dog,
  Cat,
  Bone,
  PawPrint,
  Fish,
  Bird,
  Rabbit,
  Turtle,
  Syringe,
  Stethoscope,
  Scissors,
  Bath,
  HeartPulse,
  ShoppingBag,
  Utensils,
  Sparkles,
  Home,
  Calendar,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  Search,
  X,
  Check,
  AlertTriangle,
  Image,
  type LucideIcon,
} from 'lucide-react';

// Lucide covers most of the animal/clinic iconography; the few gaps (yarn ball, clippers, collar,
// stylized bone) come from public/sprite.svg. This registry unifies both behind one <Icon name /> API.
const lucideRegistry = {
  dog: Dog,
  cat: Cat,
  bone: Bone,
  paw: PawPrint,
  fish: Fish,
  bird: Bird,
  rabbit: Rabbit,
  turtle: Turtle,
  syringe: Syringe,
  stethoscope: Stethoscope,
  scissors: Scissors,
  bath: Bath,
  heartPulse: HeartPulse,
  shoppingBag: ShoppingBag,
  food: Utensils,
  sparkles: Sparkles,
  home: Home,
  calendar: Calendar,
  clock: Clock,
  phone: Phone,
  mapPin: MapPin,
  whatsapp: MessageCircle,
  search: Search,
  close: X,
  check: Check,
  warning: AlertTriangle,
  image: Image,
} satisfies Record<string, LucideIcon>;

const spriteRegistry = {
  yarn: 'yarn',
  clippers: 'clippers',
  collar: 'collar',
  boneTreat: 'bone-treat',
  social: 'social',
} as const;

export type IconName = keyof typeof lucideRegistry | keyof typeof spriteRegistry;

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  if (name in lucideRegistry) {
    const LucideComponent = lucideRegistry[name as keyof typeof lucideRegistry];
    return <LucideComponent aria-hidden="true" {...props} />;
  }

  const symbolId = spriteRegistry[name as keyof typeof spriteRegistry];
  return (
    <svg aria-hidden="true" {...props}>
      <use href={`/sprite.svg#${symbolId}`} />
    </svg>
  );
}
