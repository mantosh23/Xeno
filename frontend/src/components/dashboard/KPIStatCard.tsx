import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  growth?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export function KPIStatCard({
  label,
  value,
  growth,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-purple-100',
  iconColor = 'text-purple-600',
  isLoading = false,
}: KPIStatCardProps) {
  return (
    <Card className="min-w-[200px] flex-1">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 mb-4">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-[12px]', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500">{label}</h3>
            {isLoading ? (
              <div className="h-[28px] w-24 skeleton rounded mt-1" />
            ) : (
              <div className="text-[28px] font-bold text-gray-900 mt-1 leading-none">{value}</div>
            )}
          </div>
        </div>
        {growth && (
          <div>
            {isLoading ? (
              <div className="h-5 w-32 skeleton rounded" />
            ) : (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositive ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {growth}
                </span>
                <span className="text-sm text-gray-400 ml-1">vs prev</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
