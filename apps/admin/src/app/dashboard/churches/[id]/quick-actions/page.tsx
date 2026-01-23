import { createServiceClient } from '@seedfy/shared/server';
import { Plus, Edit, Trash2, ExternalLink, Smartphone, Copy, Check, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { getQuickActions, deleteQuickAction, toggleQuickActionStatus } from '../../../../../actions/quick-actions';
import { QuickActionForm } from './quick-action-form';
import { QuickActionListClient } from './quick-action-list-client';

export const dynamic = 'force-dynamic';

export default async function QuickActionsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = createServiceClient();

  // Fetch church details
  const { data: church } = await supabase
    .from('churches')
    .select('name')
    .eq('id', params.id)
    .single();

  const actions = await getQuickActions(params.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Actions</h1>
          <p className="text-gray-500 mt-1">{church?.name || 'Carregando...'}</p>
        </div>
      </div>

      <QuickActionListClient 
        churchId={params.id} 
        initialActions={actions || []} 
      />
    </div>
  );
}
