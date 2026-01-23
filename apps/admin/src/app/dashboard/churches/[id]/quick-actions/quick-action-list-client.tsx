'use client';

import { useState } from 'react';
import { ChurchQuickAction } from '@seedfy/shared';
import { deleteQuickAction, toggleQuickActionStatus } from '../../../../../actions/quick-actions';
import { Plus, Edit, Trash2, ExternalLink, Smartphone, Copy, Check, Power } from 'lucide-react';
import { QuickActionForm } from './quick-action-form';

export function QuickActionListClient({ 
  churchId, 
  initialActions 
}: { 
  churchId: string; 
  initialActions: ChurchQuickAction[] 
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ChurchQuickAction | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (action: ChurchQuickAction) => {
    setEditingAction(action);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingAction(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this action?')) {
      await deleteQuickAction(id, churchId);
    }
  };

  const handleToggleStatus = async (action: ChurchQuickAction) => {
    await toggleQuickActionStatus(action.id!, churchId, action.is_enabled);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Quick Action
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium">
              <th className="px-6 py-4 w-16 text-center">Order</th>
              <th className="px-6 py-4">Type / Label</th>
              <th className="px-6 py-4">URL</th>
              <th className="px-6 py-4 text-center">Mode</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialActions.map((action) => (
              <tr key={action.id} className={`hover:bg-gray-50/50 transition-colors ${!action.is_enabled ? 'opacity-60 bg-gray-50' : ''}`}>
                <td className="px-6 py-4 text-center font-mono text-sm text-gray-500">
                  {action.sort_order}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{action.label}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{action.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <span className="text-sm text-gray-600 truncate">{action.url}</span>
                    <button 
                      onClick={() => handleCopy(action.url, action.id!)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                      title="Copy URL"
                    >
                      {copiedId === action.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {action.open_mode === 'in_app' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                      <Smartphone className="w-3 h-3" /> In App
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                      <ExternalLink className="w-3 h-3" /> External
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(action)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      action.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        action.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(action)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(action.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialActions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No quick actions found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <QuickActionForm
        churchId={churchId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        action={editingAction}
      />
    </>
  );
}
