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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

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
    
    // Form validation with toast notifications
    if (!formData.serverId) {
      toast.error('Please select a server')
      return
    }
    
    if (!formData.tableName.trim()) {
      toast.error('Please enter a table name')
      return
    }
    
    // Check if at least one operation is selected
    if (!formData.insertStatus && !formData.updateStatus && !formData.deleteStatus) {
      toast.error('Please select at least one operation (INSERT, UPDATE, or DELETE)')
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
        
        // Success toast
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

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    try {
      const response = await fetch(`/api/checklist/${entryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedEntries = await fetch(`/api/checklist?date=${selectedDate}`)
          .then(res => res.json())
        setEntries(updatedEntries)
        toast.success('Entry deleted successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete entry')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.')
      console.error('Error deleting entry:', error)
    }
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

  const getStatusIcon = (value: boolean | null) => {
    if (value === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <XCircle className="h-4 w-4 text-gray-300" />
  }

  const getFilteredEntries = () => {
    if (activeTab === 'all') {
      return entries
    }
    return entries.filter(entry => entry.server.id.toString() === activeTab)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Database Checklist</h1>
              <p className="text-muted-foreground">Track your daily database operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{session.user?.name || 'User'}</p>
                <p className="text-muted-foreground">{session.user?.email}</p>
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

        {/* Date Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Date:</label>
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {editingEntry ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  <span>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</span>
                </CardTitle>
                <CardDescription>
                  {editingEntry ? 'Update the database operation entry' : 'Record a new database operation'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Operations Completed <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3 p-3 rounded-md border border-dashed border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="insert"
                          checked={formData.insertStatus === true}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, insertStatus: checked ? true : null})
                          }
                        />
                        <label htmlFor="insert" className="text-sm font-medium">INSERT</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="update"
                          checked={formData.updateStatus === true}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, updateStatus: checked ? true : null})
                          }
                        />
                        <label htmlFor="update" className="text-sm font-medium">UPDATE</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="delete"
                          checked={formData.deleteStatus === true}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, deleteStatus: checked ? true : null})
                          }
                        />
                        <label htmlFor="delete" className="text-sm font-medium">DELETE</label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Select at least one operation</p>
                  </div>

                  {/* Error Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Error Message (if any)</label>
                    <Textarea
                      value={formData.messageError}
                      onChange={(e) => setFormData({...formData, messageError: e.target.value})}
                      placeholder="Describe any errors..."
                      rows={3}
                    />
                  </div>

                  {/* System Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">System Type</label>
                    <Input
                      value={formData.sysType}
                      onChange={(e) => setFormData({...formData, sysType: e.target.value})}
                      placeholder="e.g., ACLAMB"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      {editingEntry ? 'Update Entry' : 'Add Entry'}
                    </Button>
                    {editingEntry && (
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Entries Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Entries for {new Date(selectedDate).toLocaleDateString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all">
                      All ({entries.length})
                    </TabsTrigger>
                    {servers.map(server => {
                      const count = entries.filter(e => e.server.id === server.id).length
                      return (
                        <TabsTrigger key={server.id} value={server.id.toString()}>
                          {server.name} ({count})
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-4">
                    {getFilteredEntries().length === 0 ? (
                      <div className="text-center py-12">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No entries found</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeTab === 'all' 
                            ? 'Add your first database operation entry using the form.'
                            : `No operations recorded for ${servers.find(s => s.id.toString() === activeTab)?.name} on this date.`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {activeTab === 'all' && (
                                <TableHead>Server</TableHead>
                              )}
                              <TableHead>Table</TableHead>
                              <TableHead className="text-center">Insert</TableHead>
                              <TableHead className="text-center">Update</TableHead>
                              <TableHead className="text-center">Delete</TableHead>
                              <TableHead>Error</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredEntries().map((entry) => (
                              <TableRow key={entry.id}>
                                {activeTab === 'all' && (
                                  <TableCell className="font-medium">
                                    <Badge variant="outline">{entry.server.name}</Badge>
                                  </TableCell>
                                )}
                                <TableCell className="font-mono text-sm">
                                  {entry.tableName}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getStatusIcon(entry.insertStatus)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getStatusIcon(entry.updateStatus)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getStatusIcon(entry.deleteStatus)}
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                  {entry.messageError || '-'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {entry.sysType || '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(entry)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(entry.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
