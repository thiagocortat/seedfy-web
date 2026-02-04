import { User, GroupMember } from '@seedfy/shared';
import { User as UserIcon, Shield } from 'lucide-react';

interface GroupMembersListProps {
  members: (GroupMember & { users: User })[];
}

export function GroupMembersList({ members }: GroupMembersListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-semibold text-gray-900">Membros ({members.length})</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <div key={member.user_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
              {member.users.photo_url ? (
                <img 
                  src={member.users.photo_url} 
                  alt={member.users.name || 'Usuário'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {member.users.name || 'Usuário sem nome'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {member.role === 'owner' ? 'Administrador' : 'Membro'}
              </p>
            </div>

            {member.role === 'owner' && (
              <div className="bg-blue-50 text-blue-700 p-1.5 rounded-full" title="Administrador">
                <Shield className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
