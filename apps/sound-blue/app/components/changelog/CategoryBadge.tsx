type CategoryType = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated' | 'security';

interface CategoryBadgeProps {
  type: CategoryType;
  label: string;
}

const categoryStyles: Record<CategoryType, string> = {
  added: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  fixed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  removed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  deprecated: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  security: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export function CategoryBadge({ type, label }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyles[type]}`}
    >
      {label}
    </span>
  );
}
