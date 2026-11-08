import type { ReactNode, SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Tamaño en px (ancho y alto). */
  size?: number;
};

/** Relleno translúcido que da el efecto «duotono» a las formas cerradas. */
const DUO = { fill: 'currentColor', fillOpacity: 0.2 } as const;

/**
 * Crea un icono SVG duotono (trazo + relleno translúcido) que hereda `currentColor`.
 *
 * @param displayName Nombre mostrado en React DevTools.
 * @param body Formas SVG del icono sobre un lienzo de 24×24.
 * @returns Componente de icono con `size` y cualquier prop SVG.
 */
function createIcon(displayName: string, body: ReactNode) {
  const Icon = ({ size = 22, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {body}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const UsersIcon = createIcon('UsersIcon', (
  <>
    <circle cx="9" cy="8" r="3.2" {...DUO} />
    <path d="M3 19.5c0-3.3 2.7-6 6-6s6 2.7 6 6" {...DUO} />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M18.6 13.9c1.5.8 2.4 2.4 2.4 4.6" />
  </>
));

export const StoreIcon = createIcon('StoreIcon', (
  <>
    <path d="M4 9.5 5.6 4h12.8L20 9.5z" {...DUO} />
    <path d="M4 9.5c0 1.3 1.2 2.2 2.67 2.2s2.66-.9 2.66-2.2c0 1.3 1.2 2.2 2.67 2.2s2.66-.9 2.66-2.2c0 1.3 1.2 2.2 2.67 2.2s2.66-.9 2.66-2.2" />
    <path d="M5.5 11.7V20h13v-8.3" />
    <path d="M10 20v-4.5h4V20" />
  </>
));

export const PackageIcon = createIcon('PackageIcon', (
  <>
    <path d="M12 3 20 7.2v9.6L12 21l-8-4.2V7.2z" {...DUO} />
    <path d="m4 7.2 8 4.3 8-4.3M12 11.5V21" />
    <path d="m8 5.1 8 4.3" />
  </>
));

export const StarIcon = createIcon('StarIcon', (
  <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" {...DUO} />
));

export const HourglassIcon = createIcon('HourglassIcon', (
  <>
    <path d="M7.5 3h9c0 4-2.5 5.5-4.5 7.5C10 8.5 7.5 7 7.5 3z" {...DUO} />
    <path d="M9.4 21c.6-2 1.5-3 2.6-4 1.1 1 2 2 2.6 4z" {...DUO} />
    <path d="M6.5 3h11M6.5 21h11M7.5 21c0-4 2.5-5.5 4.5-7.5 2 2 4.5 3.5 4.5 7.5M12 10.5v3" />
  </>
));

export const InboxIcon = createIcon('InboxIcon', (
  <>
    <rect x="3" y="5" width="18" height="14" rx="3.5" {...DUO} />
    <path d="m3.8 7.8 8.2 6 8.2-6" />
  </>
));

export const LayersIcon = createIcon('LayersIcon', (
  <>
    <path d="m12 3 9 5-9 5-9-5z" {...DUO} />
    <path d="m3 12.5 9 5 9-5M3 16.5l9 5 9-5" />
  </>
));

export const CheckIcon = createIcon('CheckIcon', <path d="m5 12.5 4.5 4.5L19 7.5" />);

export const CheckCircleIcon = createIcon('CheckCircleIcon', (
  <>
    <circle cx="12" cy="12" r="9" {...DUO} />
    <path d="m8 12.4 2.8 2.8 5.4-5.7" />
  </>
));

export const XIcon = createIcon('XIcon', <path d="M6 6l12 12M18 6 6 18" />);

export const ArrowRightIcon = createIcon('ArrowRightIcon', <path d="M5 12h14m-6-6 6 6-6 6" />);
