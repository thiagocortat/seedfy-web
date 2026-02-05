import { ChurchQuickAction } from '@seedfy/shared';
import { 
  Heart, 
  Calendar, 
  Globe, 
  MessageCircle, 
  Youtube, 
  Instagram, 
  ExternalLink 
} from 'lucide-react';

interface QuickActionsProps {
  actions: ChurchQuickAction[];
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'donate': return Heart;
    case 'events': return Calendar;
    case 'website': return Globe;
    case 'whatsapp': return MessageCircle;
    case 'youtube': return Youtube;
    case 'instagram': return Instagram;
    default: return ExternalLink;
  }
};

const getActionColor = (type: string) => {
  switch (type) {
    case 'donate': return 'text-red-500 bg-red-50 hover:bg-red-100';
    case 'whatsapp': return 'text-green-500 bg-green-50 hover:bg-green-100';
    case 'youtube': return 'text-red-600 bg-red-50 hover:bg-red-100';
    case 'instagram': return 'text-pink-600 bg-pink-50 hover:bg-pink-100';
    default: return 'text-primary bg-primary/5 hover:bg-primary/10';
  }
};

export function QuickActions({ actions }: QuickActionsProps) {
  if (!actions.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
      {actions.map((action) => {
        const Icon = getActionIcon(action.type);
        const colorClass = getActionColor(action.type);
        const isExternal = action.open_mode === 'external';

        return (
          <a
            key={action.id}
            href={action.url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border border-transparent hover:border-border ${colorClass}`}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center line-clamp-2">
              {action.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
