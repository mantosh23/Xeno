import { cn } from '../../utils/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card Component
 * 
 * @returns {JSX.Element}
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardHeader Component
 * 
 * @returns {JSX.Element}
 */
export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  );
}

/**
 * CardTitle Component
 * 
 * @returns {JSX.Element}
 */
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-semibold leading-none tracking-tight text-gray-900', className)}
      {...props}
    />
  );
}

/**
 * CardDescription Component
 * 
 * @returns {JSX.Element}
 */
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
}

/**
 * CardContent Component
 * 
 * @returns {JSX.Element}
 */
export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('', className)} {...props} />;
}

/**
 * CardFooter Component
 * 
 * @returns {JSX.Element}
 */
export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  );
}
