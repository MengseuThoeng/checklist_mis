'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Calendar, Database, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, LogOut, User } from 'lucide-react'
import { toast, Toaster } from 'sonner'

type Server = {
  id: number
  name: string
}

type ChecklistEntry = {
  id: number
  date: string
  server: Server
  tableName: string
  insertStatus: boolean | null
  updateStatus: boolean | null
  deleteStatus: boolean | null
  messageError: string | null
  sysType: string | null
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [servers, setServers] = useState<Server[]>([])
  const [entries, setEntries] = useState<ChecklistEntry[]>([])
  const [activeTab, setActiveTab] = useState<string>('all')
  const [editingEntry, setEditingEntry] = useState<ChecklistEntry | null>(null)
  const [formData, setFormData] = useState({
    serverId: '',
    tableName: '',
    insertStatus: null as boolean | null,
    updateStatus: null as boolean | null,
    deleteStatus: null as boolean | null,
    messageError: '',
    sysType: ''
  })

  useEffect(() => {
    fetch('/api/servers')
      .then(res => res.json())
      .then(data => {
        setServers(data)
        if (data.length > 0 && activeTab === 'all') {
          setActiveTab('all')
        }
      })
  }, [activeTab])

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/checklist?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => setEntries(data))
    }
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.serverId || !formData.tableName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.insertStatus && !formData.updateStatus && !formData.deleteStatus) {
      toast.error('Please select at least one operation')
      return
    }
    
    try {
      const url = editingEntry ? `/api/checklist/${editingEntry.id}` : '/api/checklist'
      const method = editingEntry ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          ...formData
        })
      })

      if (response.ok) {
        const updatedEntries = await fetch(`/api/checklist?date=${selectedDate}`)
          .then(res => res.json())
        setEntries(updatedEntries)
        
        toast.success(editingEntry ? 'Entry updated successfully!' : 'Entry added successfully!')
        
        setFormData({
          serverId: '',
          tableName: '',
          insertStatus: null,
          updateStatus: null,
          deleteStatus: null,
          messageError: '',
          sysType: ''
        })
        setEditingEntry(null)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save entry')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.')
      console.error('Error submitting form:', error)
    }
  }

  const handleEdit = (entry: ChecklistEntry) => {
    setEditingEntry(entry)
    setFormData({
      serverId: entry.server.id.toString(),
      tableName: entry.tableName,
      insertStatus: entry.insertStatus,
      updateStatus: entry.updateStatus,
      deleteStatus: entry.deleteStatus,
      messageError: entry.messageError || '',
      sysType: entry.sysType || ''
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    try {
      const response = await fetch(`/api/checklist/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedEntries = await fetch(`/api/checklist?date=${selectedDate}`)
          .then(res => res.json())
        setEntries(updatedEntries)
        toast.success('Entry deleted successfully!')
      } else {
        toast.error('Failed to delete entry')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.')
      console.error('Error deleting entry:', error)
    }
  }

  const getFilteredEntries = () => {
    if (activeTab === 'all') return entries
    return entries.filter(entry => entry.server.id.toString() === activeTab)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const cancelEdit = () => {
    setEditingEntry(null)
    setFormData({
      serverId: '',
      tableName: '',
      insertStatus: null,
      updateStatus: null,
      deleteStatus: null,
      messageError: '',
      sysType: ''
    })
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Database Checklist</h1>
              <p className="text-sm text-muted-foreground">Track your daily database operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{session.user?.name || 'User'}</p>
                <p className="text-muted-foreground text-xs">{session.user?.email}</p>
              </div>
              {session.user?.role === 'admin' && (
                <Badge variant="outline" className="ml-2">Admin</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-gray-50 border-b px-6 py-4 flex-shrink-0">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {editingEntry ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <CardTitle className="text-lg">{editingEntry ? 'Edit Entry' : 'Add New Entry'}</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                <Badge variant="secondary">
                  {entries.length} entries
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
              {/* Server Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Server <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.serverId}
                  onValueChange={(value) => setFormData({...formData, serverId: value})}
                  required
                >
                  <SelectTrigger className={!formData.serverId ? 'border-red-200' : ''}>
                    <SelectValue placeholder="Select server..." />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map(server => (
                      <SelectItem key={server.id} value={server.id.toString()}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Table Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.tableName}
                  onChange={(e) => setFormData({...formData, tableName: e.target.value})}
                  placeholder="e.g., TBL_LOGI_LOGS"
                  className={!formData.tableName.trim() ? 'border-red-200' : ''}
                  required
                />
              </div>

              {/* Operations */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Operations</label>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="insert"
                      checked={formData.insertStatus === true}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, insertStatus: checked ? true : null})
                      }
                    />
                    <label htmlFor="insert" className="text-xs">INSERT</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="update"
                      checked={formData.updateStatus === true}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, updateStatus: checked ? true : null})
                      }
                    />
                    <label htmlFor="update" className="text-xs">UPDATE</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="delete"
                      checked={formData.deleteStatus === true}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, deleteStatus: checked ? true : null})
                      }
                    />
                    <label htmlFor="delete" className="text-xs">DELETE</label>
                  </div>
                </div>
              </div>

              {/* System Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">System Type</label>
                <Input
                  value={formData.sysType}
                  onChange={(e) => setFormData({...formData, sysType: e.target.value})}
                  placeholder="e.g., PROD, TEST"
                />
              </div>

              {/* Error Message */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Error Message</label>
                <Input
                  value={formData.messageError}
                  onChange={(e) => setFormData({...formData, messageError: e.target.value})}
                  placeholder="Any error messages or notes..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-2">
                <Button type="submit" className="w-full">
                  {editingEntry ? 'Update' : 'Add'}
                </Button>
                {editingEntry && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Full Screen Table */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>Entries for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Servers ({entries.length})</TabsTrigger>
                  {servers.map(server => (
                    <TabsTrigger key={server.id} value={server.id.toString()}>
                      {server.name} ({getFilteredEntries().filter(e => e.server.id === server.id).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="border rounded-lg h-full overflow-auto mx-6 mb-6">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 border-b">
                  <TableRow>
                    <TableHead className="w-[120px] font-semibold">Time</TableHead>
                    <TableHead className="w-[140px] font-semibold">Server</TableHead>
                    <TableHead className="w-[200px] font-semibold">Table Name</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">INSERT</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">UPDATE</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">DELETE</TableHead>
                    <TableHead className="w-[100px] font-semibold">System</TableHead>
                    <TableHead className="min-w-[200px] font-semibold">Error Message</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredEntries().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No entries found</h3>
                        <p className="text-sm">Add your first database operation entry using the form above</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredEntries().map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {new Date(entry.date).toLocaleTimeString('en-US', { 
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {entry.server.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.tableName}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.insertStatus === true ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : entry.insertStatus === false ? (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto bg-gray-200 rounded-full" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.updateStatus === true ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : entry.updateStatus === false ? (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto bg-gray-200 rounded-full" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.deleteStatus === true ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : entry.deleteStatus === false ? (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto bg-gray-200 rounded-full" />
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.sysType && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.sysType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          {entry.messageError && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded break-words">
                              {entry.messageError}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
