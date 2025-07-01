'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Plus, FolderPlus, Building, Tag } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  description: string
  color: string
  icon: string
  created_at: string
}

interface Folder {
  id: string
  name: string
  description: string
  workspace_id: string
  parent_folder_id: string | null
  color: string
  icon: string
  created_at: string
}

interface Tag {
  id: string
  name: string
  color: string
}

interface WorkspaceSelectorProps {
  selectedWorkspace: Workspace | null
  selectedFolder: Folder | null
  selectedTags: Tag[]
  onWorkspaceChange: (workspace: Workspace | null) => void
  onFolderChange: (folder: Folder | null) => void
  onTagsChange: (tags: Tag[]) => void
}

export function WorkspaceSelector({
  selectedWorkspace,
  selectedFolder,
  selectedTags,
  onWorkspaceChange,
  onFolderChange,
  onTagsChange
}: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '', color: '#3b82f6', icon: '📁' })
  const [newFolder, setNewFolder] = useState({ name: '', description: '', color: '#6b7280', icon: '📂' })

  // Load workspaces, folders, and tags
  const loadData = async () => {
    try {
      setLoading(true)
      const [workspacesRes, foldersRes, tagsRes] = await Promise.all([
        fetch('/api/workspaces'),
        fetch('/api/folders'),
        fetch('/api/tags')
      ])

      if (workspacesRes.ok) {
        const workspacesData = await workspacesRes.json()
        setWorkspaces(workspacesData.workspaces || [])
        
        // Auto-select first workspace if none selected
        if (!selectedWorkspace && workspacesData.workspaces?.length > 0) {
          onWorkspaceChange(workspacesData.workspaces[0])
        }
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json()
        setFolders(foldersData.folders || [])
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData.tags || [])
      }
    } catch (error) {
      console.error('Error loading workspace data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create new workspace
  const createWorkspace = async () => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkspace)
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateWorkspaceOpen(false)
        setNewWorkspace({ name: '', description: '', color: '#3b82f6', icon: '📁' })
        loadData()
        onWorkspaceChange(data.workspace)
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
    }
  }

  // Create new folder
  const createFolder = async () => {
    if (!selectedWorkspace) {
      return
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFolder,
          workspace_id: selectedWorkspace.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateFolderOpen(false)
        setNewFolder({ name: '', description: '', color: '#6b7280', icon: '📂' })
        loadData()
        onFolderChange(data.folder)
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  // Toggle tag selection
  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id)
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter folders by selected workspace
  const workspaceFolders = folders.filter(folder => 
    folder.workspace_id === selectedWorkspace?.id && !folder.parent_folder_id
  )

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Workspace</h3>
        </div>
        <p className="text-sm text-gray-300">Organize your customer personas</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workspace Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Workspace</label>
          <div className="flex space-x-2">
            <select 
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedWorkspace?.id || ''} 
              onChange={(e) => {
                const workspace = workspaces.find(w => w.id === e.target.value)
                onWorkspaceChange(workspace || null)
                onFolderChange(null) // Reset folder when workspace changes
              }}
            >
              <option value="">Select workspace</option>
              {workspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.icon} {workspace.name}
                </option>
              ))}
            </select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreateWorkspaceOpen(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Folder Selection */}
        {selectedWorkspace && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Folder</label>
            <div className="flex space-x-2">
              <select 
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFolder?.id || ''} 
                onChange={(e) => {
                  const folder = folders.find(f => f.id === e.target.value)
                  onFolderChange(folder || null)
                }}
              >
                <option value="">No folder</option>
                {workspaceFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tags Selection */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-blue-400" />
            <label className="text-sm font-medium text-gray-200">Tags</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = selectedTags.some(t => t.id === tag.id)
              return (
                <button
                  key={tag.id}
                  className={`px-2 py-1 text-xs rounded-full border transition-all hover:scale-105 ${
                    isSelected 
                      ? 'text-white border-transparent' 
                      : 'bg-transparent border-current'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: isSelected ? 'white' : tag.color
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Current Selection Summary */}
        {(selectedWorkspace || selectedFolder || selectedTags.length > 0) && (
          <div className="pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-300 space-y-1">
              {selectedWorkspace && (
                <div className="flex items-center space-x-2">
                  <span>{selectedWorkspace.icon}</span>
                  <span className="text-white">{selectedWorkspace.name}</span>
                </div>
              )}
              {selectedFolder && (
                <div className="flex items-center space-x-2 ml-4">
                  <span>{selectedFolder.icon}</span>
                  <span className="text-white">{selectedFolder.name}</span>
                </div>
              )}
              {selectedTags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <span>{selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Workspace Modal */}
        {isCreateWorkspaceOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Create Workspace</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">Name</label>
                  <Input
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Marketing Campaigns"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">Description</label>
                  <Input
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">Icon</label>
                    <Input
                      value={newWorkspace.icon}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="📁"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">Color</label>
                    <Input
                      type="color"
                      value={newWorkspace.color}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, color: e.target.value }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateWorkspaceOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button onClick={createWorkspace} disabled={!newWorkspace.name}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {isCreateFolderOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Create Folder</h3>
              <p className="text-sm text-gray-300 mb-4">Create a new folder in {selectedWorkspace?.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">Name</label>
                  <Input
                    value={newFolder.name}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Enterprise Customers"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">Description</label>
                  <Input
                    value={newFolder.description}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">Icon</label>
                    <Input
                      value={newFolder.icon}
                      onChange={(e) => setNewFolder(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="📂"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">Color</label>
                    <Input
                      type="color"
                      value={newFolder.color}
                      onChange={(e) => setNewFolder(prev => ({ ...prev, color: e.target.value }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button onClick={createFolder} disabled={!newFolder.name}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 