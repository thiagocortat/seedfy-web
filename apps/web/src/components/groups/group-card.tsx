import Link from 'next/link';
import { Group } from '@seedfy/shared';
import { Users, ArrowRight } from 'lucide-react';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link 
      href={`/app/groups/${group.id}`}
      className="group flex items-center bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
        {group.image_url ? (
          <img 
            src={group.image_url} 
            alt={group.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Users className="w-8 h-8" />
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {group.name}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Toque para ver detalhes
        </p>
      </div>

      <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </Link>
  );
}
