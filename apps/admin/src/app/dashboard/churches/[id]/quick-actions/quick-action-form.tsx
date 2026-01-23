'use client';

import { useState } from 'react';
import { ChurchQuickAction } from '@seedfy/shared';
import { createQuickAction, updateQuickAction } from '../../../../../actions/quick-actions';
import { X, Loader2, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';

type Props = {
  churchId: string;
  action?: ChurchQuickAction;
  isOpen: boolean;
  onClose: () => void;
};

const ACTION_TYPES = [
  { value: 'donate', label: 'Donate', helper: '/doar, /doacao' },
  { value: 'events', label: 'Events', helper: '/agenda, /eventos' },
  { value: 'website', label: 'Website', helper: 'https://site.com' },
  { value: 'whatsapp', label: 'WhatsApp', helper: 'Phone number (e.g. 5511999999999)' },
  { value: 'youtube', label: 'YouTube', helper: 'Channel ID or Handle' },
  { value: 'instagram', label: 'Instagram', helper: 'Username' },
];

export function QuickActionForm({ churchId, action, isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [urlInput, setUrlInput] = useState(action?.url || '');

  const [formData, setFormData] = useState<Partial<ChurchQuickAction>>({
    type: action?.type || 'website',
    label: action?.label || '',
    url: action?.url || '',
    open_mode: action?.open_mode || 'in_app',
    sort_order: action?.sort_order || 100,
    is_enabled: action?.is_enabled ?? true,
  });

  // Sync urlInput with formData.url initially if needed, but we manage urlInput separately for helpers
  
  const generateUrl = (type: string, input: string) => {
    if (!input) return '';
    const cleanInput = input.trim();

    switch (type) {
      case 'whatsapp':
        const phone = cleanInput.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      case 'youtube':
        if (cleanInput.startsWith('http')) return cleanInput;
        if (cleanInput.startsWith('@')) return `https://www.youtube.com/${cleanInput}`;
        return `https://www.youtube.com/channel/${cleanInput}`;
      case 'instagram':
        if (cleanInput.startsWith('http')) return cleanInput;
        const username = cleanInput.replace('@', '');
        return `https://www.instagram.com/${username}`;
      case 'website':
      case 'donate':
        if (cleanInput.startsWith('http')) return cleanInput;
        if (cleanInput.startsWith('/')) return `https://...${cleanInput}`; // Just a hint, user needs real domain usually or app handles relative? Requirement says "must start with https://"
        return `https://${cleanInput}`;
      case 'events':
         if (cleanInput.startsWith('http')) return cleanInput;
         if (cleanInput.startsWith('/')) return `https://...${cleanInput}`;
         return `https://${cleanInput}`;
      default:
        return cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`;
    }
  };

  const handleUrlInputChange = (val: string) => {
    setUrlInput(val);
    // Auto-generate preview/final URL for some types if it looks like a helper input
    // But for simplicity, we might just let user type and have a "Generate" button or auto-format on blur?
    // Let's simple auto-format on blur or specific logic.
    // Actually requirement says "URL generator helpers by type inside the form".
    // We'll update the actual formData.url based on this input + type logic
    
    // For raw URL types (website), we just pass through or prepend https
    // For social, we format.
    
    // Let's do real-time update of formData.url based on logic
    let finalUrl = val;
    const type = formData.type || 'website';
    
    // Only apply specific logic if it DOESN'T start with http (assuming user is typing ID/handle)
    if (!val.startsWith('http') && val.length > 0) {
        if (type === 'whatsapp') {
            finalUrl = `https://wa.me/${val.replace(/\D/g, '')}`;
        } else if (type === 'instagram') {
            finalUrl = `https://www.instagram.com/${val.replace('@', '')}`;
        } else if (type === 'youtube') {
             if (val.startsWith('@')) finalUrl = `https://www.youtube.com/${val}`;
             else finalUrl = `https://www.youtube.com/channel/${val}`;
        } else if (type === 'website' || type === 'donate' || type === 'events') {
             // For generic links, we assume they might want to type 'google.com' -> 'https://google.com'
             // BUT if they type '/agenda', we shouldn't force https:// yet unless we know the domain.
             // Requirement 2: "Block saving if url does not start with https://"
             // So we should help them add it.
             if (!val.startsWith('/')) {
                 finalUrl = `https://${val}`;
             }
        }
    }
    
    setFormData(prev => ({ ...prev, url: finalUrl }));
  };

  const handleTypeChange = (type: string) => {
    // Set default open_mode based on type
    const externalTypes = ['donate', 'whatsapp', 'youtube', 'instagram'];
    const defaultMode = externalTypes.includes(type) ? 'external' : 'in_app';
    
    // Suggest sort order
    const typeOrder = {
      donate: 10,
      events: 20,
      website: 30,
      whatsapp: 40,
      youtube: 50,
      instagram: 60,
    };

    setFormData(prev => ({
      ...prev,
      type: type as any,
      open_mode: defaultMode,
      sort_order: (typeOrder as any)[type] || 100,
    }));
    
    // Reset URL input when type changes to avoid confusion? 
    // Or keep it if they are switching similar types. 
    // Let's clear for safety if it was empty or default.
    if (!action) {
        setUrlInput('');
        setFormData(prev => ({ ...prev, url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const dataToSubmit = { ...formData, church_id: churchId };
      let result;

      if (action?.id) {
        result = await updateQuickAction(action.id, churchId, dataToSubmit);
      } else {
        result = await createQuickAction(dataToSubmit);
      }

      if (result?.error) {
        if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setFieldErrors(result.error);
        }
      } else {
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {action ? 'Edit Quick Action' : 'New Quick Action'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={!!action} // Type cannot be changed after creation due to unique constraint logic simplicity
            >
              {ACTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Donate Now"
            />
            {fieldErrors.label && <p className="text-xs text-red-600 mt-1">{fieldErrors.label[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="https://..."
            />
            {fieldErrors.url && <p className="text-xs text-red-600 mt-1">{fieldErrors.url[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Mode</label>
              <select
                value={formData.open_mode}
                onChange={(e) => setFormData({ ...formData, open_mode: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="in_app">In App</option>
                <option value="external">External Browser</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_enabled"
              checked={formData.is_enabled}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_enabled" className="text-sm text-gray-700">Enable this action</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
