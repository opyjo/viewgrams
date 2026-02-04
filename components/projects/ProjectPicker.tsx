'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { LIST_PROJECTS } from '@/graphql/projectQueries';
import { ListProjectsResult } from '@/types/project';
import ProjectManagementModal from './ProjectManagementModal';
import { FolderOpen, Plus, ChevronDown, Loader2 } from 'lucide-react';

interface ProjectPickerProps {
  selectedProjectId: string | null | undefined;
  onSelectProject: (projectId: string | null) => void;
  disabled?: boolean;
}

export default function ProjectPicker({
  selectedProjectId,
  onSelectProject,
  disabled = false,
}: ProjectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, loading, refetch } = useQuery<ListProjectsResult>(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  const projects = data?.listProjects?.items || [];
  const selectedProject = projects.find((p) => p.projectId === selectedProjectId);

  const handleSelect = (projectId: string | null) => {
    onSelectProject(projectId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  return (
    <>
      <div className="relative">
        <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
          Project
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className="w-full flex items-center justify-between px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {loading ? (
              <Loader2 size={16} className="animate-spin flex-shrink-0" />
            ) : selectedProject ? (
              <>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedProject.color || '#3b82f6' }}
                />
                <span className="text-sm truncate">{selectedProject.name}</span>
              </>
            ) : (
              <>
                <FolderOpen size={16} className="flex-shrink-0 text-slate-400" />
                <span className="text-sm text-slate-400">Uncategorized</span>
              </>
            )}
          </div>
          <ChevronDown size={16} className="flex-shrink-0 text-slate-400" />
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FolderOpen size={16} className="text-slate-400" />
                <span>Uncategorized</span>
              </button>

              {projects.length > 0 && (
                <div className="border-t border-slate-200 mt-1 pt-1">
                  {projects.map((project) => (
                    <button
                      key={project.projectId}
                      type="button"
                      onClick={() => handleSelect(project.projectId)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      />
                      <span className="truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-200 mt-1"
              >
                <Plus size={16} />
                <span>Create new project</span>
              </button>
            </div>
          </>
        )}
      </div>

      <ProjectManagementModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
