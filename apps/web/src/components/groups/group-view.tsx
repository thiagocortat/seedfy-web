'use client';

import { Group, GroupMember, User } from '@seedfy/shared';
import { GroupMembersList } from '@/components/groups/group-members-list';
import { InviteUserForm } from '@/components/groups/invite-user-form';
import { Users, Settings } from 'lucide-react';
import { useState } from 'react';

interface GroupViewProps {
  group: Group;
  members: (GroupMember & { users: User })[];
  currentUserRole: 'owner' | 'admin' | 'member';
}

export function GroupView({ group, members, currentUserRole }: GroupViewProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'admin'>('members');
  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'members'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}
            `}
          >
            <Users className="w-4 h-4" />
            Membros
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === 'admin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}
              `}
            >
              <Settings className="w-4 h-4" />
              Gestão
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'members' && (
        <GroupMembersList members={members} />
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          <InviteUserForm groupId={group.id!} />
          
          {/* Future: Pending Requests List for this group specifically could go here */}
          {/* For now, we direct them to the Inbox for requests management */}
        </div>
      )}
    </div>
  );
}
