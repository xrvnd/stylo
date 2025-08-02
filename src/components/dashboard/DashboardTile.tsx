import { cn } from '@/lib/utils'

type TileProps = {
  title: string;
  count: number;
  icon: React.ElementType;
  className?: string;
  active?: boolean;
}

export function DashboardTile({ title, count, icon: Icon, className, active }: TileProps) {
  return (
    <div
      className={cn(
        // Base Styling: Clean, spacious, with a top border accent
        'relative rounded-xl border-t-4 bg-white p-6 shadow-md transition-all duration-300 ease-in-out',
        // Pronounced Hover Effects for excellent UX
        'hover:scale-[1.03] hover:shadow-xl',
        // Active State: Add a subtle background color and make the shadow stronger
        {
          'scale-[1.03] shadow-xl': active,
        },
        className // For passing in the border color and active background color
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-500">{title}</h3>
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <p className="mt-2 text-5xl font-bold text-gray-800">{count}</p>
    </div>
  )
}