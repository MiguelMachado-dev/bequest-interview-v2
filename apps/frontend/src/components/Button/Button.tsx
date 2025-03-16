import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const getVariantClasses = (variant: ButtonProps['variant'] = 'default') => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline:
      'border border-muted bg-background text-foreground hover:bg-muted/20 hover:text-foreground',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    ghost: 'text-foreground hover:bg-muted/20 hover:text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  return `${baseClasses} ${variantClasses[variant]}`;
};

const getSizeClasses = (size: ButtonProps['size'] = 'default') => {
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return sizeClasses[size];
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const classes = `${getVariantClasses(variant)} ${getSizeClasses(
      size
    )} ${className}`.trim();

    return <Comp className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
