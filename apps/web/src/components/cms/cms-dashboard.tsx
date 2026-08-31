'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CmsCollection,
  CmsEntry,
  CmsEntryStatus,
  ProjectDto,
  CreateCollectionDto,
  CreateEntryDto,
} from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  useToast,
} from '@nirmaanify/ui';
import {
  FolderPlus,
  Plus,
  Search,
  FileText,
  ShoppingBag,
  Tag,
  Users,
  Edit,
  Trash2,
  Send,
  Archive,
  ExternalLink,
  Code2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { CollectionBuilderModal } from './collection-builder-modal';
import { ContentEditorModal } from './content-editor-modal';
import { useAuth } from '../../context/auth-context';

interface CmsDashboardProps {
  projects: ProjectDto[];
  activeProjectId?: string;
}

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Tag: <Tag className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Folder: <Layers className="h-4 w-4" />,
};

export function CmsDashboard({ projects, activeProjectId }: CmsDashboardProps) {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // CMS Collections State
  const [collections, setCollections] = useState<CmsCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // CMS Entries State
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CmsEntryStatus>('ALL');

  // Modals state
  const [collectionBuilderOpen, setCollectionBuilderOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CmsCollection | null>(null);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CmsEntry | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const selectedCollection = useMemo(() => {
    return collections.find((c) => c.id === selectedCollectionId) || collections[0] || null;
  }, [collections, selectedCollectionId]);

  // Fetch Collections for active project
  useEffect(() => {
    if (!activeProject) return;

    const fetchCollections = async () => {
      setIsLoadingCollections(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/cms/collections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCollections(data);
          if (data.length > 0 && !selectedCollectionId) {
            setSelectedCollectionId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching CMS collections:', err);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [activeProject, selectedCollectionId]);

  // Fetch Entries when selected collection changes
  useEffect(() => {
    if (!activeProject || !selectedCollection) return;

    const fetchEntries = async () => {
      setIsLoadingEntries(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(
          `http://localhost:4000/projects/${activeProject.id}/cms/collections/${selectedCollection.id}/entries?status=${statusFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (err) {
        console.error('Error fetching CMS entries:', err);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    fetchEntries();
  }, [activeProject, selectedCollection, statusFilter]);

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.slug.toLowerCase().includes(q) ||
        JSON.stringify(e.data).toLowerCase().includes(q)
      );
    });
  }, [entries, statusFilter, searchQuery]);

  // Save Collection Handler
  const handleSaveCollection = async (dto: CreateCollectionDto) => {
    const token = localStorage.getItem('auth_token');
    const url = editingCollection
      ? `http://localhost:4000/projects/${activeProject.id}/cms/collections/${editingCollection.id}`
      : `http://localhost:4000/projects/${activeProject.id}/cms/collections`;

    const method = editingCollection ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to save collection');
    }

    const saved = await res.json();
    if (editingCollection) {
      setCollections(collections.map((c) => (c.id === saved.id ? saved : c)));
    } else {
      setCollections([...collections, saved]);
      setSelectedCollectionId(saved.id);
    }
  };

  // Delete Collection
  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection and all its content?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:4000/projects/${activeProject.id}/cms/collections/${collectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = collections.filter((c) => c.id !== collectionId);
      setCollections(updated);
      if (updated.length > 0) setSelectedCollectionId(updated[0].id);
      toast({ title: 'Collection Deleted', description: 'Removed collection schema.', type: 'info' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete collection.', type: 'error' });
    }
  };

  // Save Entry Handler
  const handleSaveEntry = async (dto: CreateEntryDto) => {
    const token = localStorage.getItem('auth_token');
    const url = editingEntry
      ? `http://localhost:4000/projects/${activeProject.id}/cms/entries/${editingEntry.id}`
      : `http://localhost:4000/projects/${activeProject.id}/cms/collections/${selectedCollection.id}/entries`;

    const method = editingEntry ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to save entry');
    }

    const saved = await res.json();
    if (editingEntry) {
      setEntries(entries.map((e) => (e.id === saved.id ? saved : e)));
    } else {
      setEntries([saved, ...entries]);
    }
  };

  // Quick Action: Publish Entry
  const handlePublishEntry = async (entry: CmsEntry) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/cms/entries/${entry.id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updated = await res.json();
        setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
        toast({ title: 'Published Live! 🚀', description: `Entry "${entry.slug}" is now published.`, type: 'success' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not publish entry.', type: 'error' });
    }
  };

  // Quick Action: Archive Entry
  const handleArchiveEntry = async (entry: CmsEntry) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/cms/entries/${entry.id}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updated = await res.json();
        setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
        toast({ title: 'Archived', description: `Moved entry to archive.`, type: 'info' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not archive entry.', type: 'error' });
    }
  };

  // Quick Action: Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to permanently delete this entry?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:4000/projects/${activeProject.id}/cms/entries/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntries(entries.filter((e) => e.id !== entryId));
      toast({ title: 'Entry Deleted', description: 'Removed entry from collection.', type: 'info' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete entry.', type: 'error' });
    }
  };

  const handleCopyPublicApiUrl = () => {
    if (!activeProject || !selectedCollection) return;
    const url = `http://localhost:4000/cms/public/${activeProject.slug}/${selectedCollection.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
    toast({ title: 'API Endpoint Copied', description: url, type: 'info' });
  };

  if (!activeProject) {
    return (
      <Card className="p-12 text-center space-y-3">
        <Layers className="h-10 w-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-base">No Active Projects</h4>
        <p className="text-xs text-slate-400">Create a project first to use the headless CMS engine.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header: Project Selector & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#24293D]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#635BFF]" />
            <span>Dynamic CMS & Headless Content Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build custom collection schemas, manage content lifecycles, and bind live data to website components.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#161926] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#24293D]">
            <span className="text-[11px] font-semibold text-slate-400">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#635BFF] focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="default"
            leftIcon={<FolderPlus className="h-4 w-4" />}
            onClick={() => {
              setEditingCollection(null);
              setCollectionBuilderOpen(true);
            }}
          >
            New Collection
          </Button>
        </div>
      </div>

      {/* Main CMS Split Workspace: Collections Nav + Entries Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Collections List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Collections ({collections.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {collections.map((col) => {
              const isSelected = selectedCollection?.id === col.id;
              const iconElement = COLLECTION_ICONS[col.icon || 'Folder'] || <Layers className="h-4 w-4" />;

              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group border ${
                    isSelected
                      ? 'bg-[#635BFF]/10 border-[#635BFF] text-[#635BFF] font-bold shadow-sm'
                      : 'bg-white dark:bg-[#161926] border-slate-200/80 dark:border-[#24293D] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#635BFF] text-white' : 'bg-slate-100 dark:bg-[#0E121E] text-slate-400'}`}>
                      {iconElement}
                    </div>
                    <div className="truncate">
                      <span className="text-xs block truncate">{col.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">/{col.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCollection(col);
                        setCollectionBuilderOpen(true);
                      }}
                      className="p-1 hover:bg-black/10 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Edit Schema"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(col.id);
                      }}
                      className="p-1 hover:bg-rose-500 hover:text-white rounded text-slate-400"
                      title="Delete Collection"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Content Entries Explorer & Table */}
        <div className="lg:col-span-3 space-y-4">
          {selectedCollection ? (
            <Card className="p-5 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#24293D]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedCollection.name}</h3>
                    <Badge variant="indigo" size="sm">/{selectedCollection.slug}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCollection.description || `Managing entries in ${selectedCollection.name}.`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPublicApiUrl}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0E121E] hover:bg-slate-200 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#24293D] transition-colors"
                    title="Copy Public REST Query URL"
                  >
                    {copiedEndpoint ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>API Endpoint</span>
                  </button>

                  <Button
                    size="sm"
                    variant="default"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditingEntry(null);
                      setContentEditorOpen(true);
                    }}
                  >
                    New Entry
                  </Button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {(['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        statusFilter === st
                          ? 'bg-[#635BFF] text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#161926]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entries Table */}
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-[#24293D] rounded-xl">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                  <h5 className="font-bold text-xs">No Content Entries Found</h5>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Create the first entry in this collection or adjust your status filter.
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    leftIcon={<Plus className="h-3 w-3" />}
                    onClick={() => {
                      setEditingEntry(null);
                      setContentEditorOpen(true);
                    }}
                  >
                    Create Entry
                  </Button>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#24293D]">
                  {filteredEntries.map((entry) => {
                    const primaryTitle =
                      entry.data.title ||
                      entry.data.name ||
                      entry.slug;

                    return (
                      <div
                        key={entry.id}
                        className="p-3.5 bg-white dark:bg-[#161926] hover:bg-slate-50 dark:hover:bg-[#1A1E2E] transition-colors flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1 min-w-[200px] flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {primaryTitle}
                            </span>
                            <Badge
                              size="sm"
                              variant={
                                entry.status === 'PUBLISHED'
                                  ? 'cyan'
                                  : entry.status === 'SCHEDULED'
                                  ? 'indigo'
                                  : entry.status === 'ARCHIVED'
                                  ? 'violet'
                                  : 'secondary'
                              }
                              className="text-[9px] uppercase font-mono"
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            Slug: /{entry.slug}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-400 hidden sm:block shrink-0">
                          {entry.publishedAt ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.publishedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="italic">Unpublished</span>
                          )}
                        </div>

                        {/* Row Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {entry.status !== 'PUBLISHED' && (
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => handlePublishEntry(entry)}
                              title="Publish Live"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEntry(entry);
                              setContentEditorOpen(true);
                            }}
                            title="Edit Entry"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {entry.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => handleArchiveEntry(entry)}
                              className="p-1.5 text-slate-400 hover:text-amber-500 rounded hover:bg-slate-100 dark:hover:bg-[#24293D]"
                              title="Archive Entry"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10"
                            title="Delete Entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center space-y-3">
              <Layers className="h-8 w-8 text-slate-400 mx-auto" />
              <h5 className="font-bold text-xs">No Collections Defined</h5>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Create a custom collection or load pre-built starter blueprints.
              </p>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setEditingCollection(null);
                  setCollectionBuilderOpen(true);
                }}
              >
                Create Collection
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* COLLECTION BUILDER MODAL */}
      <CollectionBuilderModal
        isOpen={collectionBuilderOpen}
        onClose={() => {
          setCollectionBuilderOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        initialCollection={editingCollection}
      />

      {/* CONTENT ENTRY EDITOR MODAL */}
      {selectedCollection && (
        <ContentEditorModal
          isOpen={contentEditorOpen}
          onClose={() => {
            setContentEditorOpen(false);
            setEditingEntry(null);
          }}
          onSave={handleSaveEntry}
          collection={selectedCollection}
          initialEntry={editingEntry}
        />
      )}
    </div>
  );
}
