'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_PROJECT } from '@/graphql/projectMutations';
import { LIST_PROJECTS } from '@/graphql/projectQueries';
import { CreateProjectInput } from '@/types/project';
import { Plus, Loader2, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#93c5fd', // blue-300
  '#86efac', // green-300
  '#fde047', // yellow-300
  '#fca5a5', // red-300
  '#c4b5fd', // purple-300
  '#f9a8d4', // pink-300
];

export default function QuickProjectCreate() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [justCreated, setJustCreated] = useState(false);

  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: LIST_PROJECTS }],
    onCompleted: () => {
      setName('');
      setColor(PRESET_COLORS[0]);
      setJustCreated(true);
      setTimeout(() => {
        setJustCreated(false);
        setIsExpanded(false);
      }, 1500);
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const input: CreateProjectInput = {
      name: name.trim(),
      color,
    };

    await createProject({ variables: { input } });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all text-sm font-medium text-slate-700 border border-slate-200"
      >
        <Plus size={16} />
        New Project
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 border border-slate-200 space-y-2">
      {justCreated ? (
        <div className="flex items-center justify-center gap-2 py-3 text-green-600">
          <Check size={18} />
          <span className="text-sm font-medium">Project created!</span>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name..."
            className="w-full px-3 py-1.5 bg-white/80 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            disabled={loading}
            autoFocus
          />

          <div className="flex gap-1.5">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-6 h-6 rounded-full transition-all ${
                  color === presetColor ? 'ring-2 ring-slate-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: presetColor }}
                disabled={loading}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setName('');
              }}
              disabled={loading}
              className="flex-1 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-xs font-medium text-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
