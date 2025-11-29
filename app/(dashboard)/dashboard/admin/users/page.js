"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Users,
  Crown,
  UserPlus,
  UserMinus,
  Search,
  Mail,
  Calendar,
  Shield,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [showDemoteDialog, setShowDemoteDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [stats, setStats] = useState({
    adminCount: 0,
    maxAdmins: 3,
    canPromoteMore: true
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [status, session, router])

  // Set page title
  useEffect(() => {
    document.title = "User Management | Multigyan"
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setStats({
          adminCount: data.adminCount || 0,
          maxAdmins: data.maxAdmins || 3,
          canPromoteMore: data.canPromoteMore || false
        })
      } else {
        toast.error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  async function handleUserAction(userId, action) {
    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchUsers()
        setShowPromoteDialog(false)
        setShowDemoteDialog(false)
        setShowDeactivateDialog(false)
        setSelectedUser(null)
      } else {
        toast.error(data.error || `Failed to ${action} user`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    } finally {
      setActionLoading(false)
    }
  }

  function openPromoteDialog(user) {
    setSelectedUser(user)
    setShowPromoteDialog(true)
  }

  function openDemoteDialog(user) {
    setSelectedUser(user)
    setShowDemoteDialog(true)
  }

  function openDeactivateDialog(user) {
    setSelectedUser(user)
    setShowDeactivateDialog(true)
  }

  function getRoleBadge(role) {
    if (role === 'admin') {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg transition-shadow text-white">
          <Crown className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="hover:border-primary/50 transition-colors">
        <User className="h-3 w-3 mr-1" />
        Author
      </Badge>
    )
  }

  function getStatusBadge(isActive) {
    if (isActive) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-red-500 text-red-700">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  if (status === 'loading' || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-transparent to-purple/5 rounded-lg -z-10"></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">User Management</span>
        </h1>
        <p className="text-muted-foreground/80">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{users.length}</div>
            <p className="text-xs text-muted-foreground/80">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Crown className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              {stats.adminCount} / {stats.maxAdmins}
            </div>
            <p className="text-xs text-muted-foreground/80">Current admin slots</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-500/30 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              {users.filter(user => user.role === 'author').length}
            </div>
            <p className="text-xs text-muted-foreground/80">Content creators</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Can Promote</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {stats.canPromoteMore ? 'Yes' : 'No'}
            </div>
            <p className="text-xs text-muted-foreground/80">Admin slots available</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user._id} className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.isActive)}
                      {user._id === session.user.id && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user._id !== session.user.id && (
                    <>
                      {user.role === 'author' && stats.canPromoteMore && (
                        <Button
                          size="sm"
                          onClick={() => openPromoteDialog(user)}
                          disabled={actionLoading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                      )}

                      {user.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDemoteDialog(user)}
                          disabled={actionLoading}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Demote
                        </Button>
                      )}

                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeactivateDialog(user)}
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user._id, 'activate')}
                          disabled={actionLoading}
                          className="border-green-500 text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users registered yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Administrator</DialogTitle>
            <DialogDescription>
              Promote {selectedUser?.name} to administrator?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Admins can manage users and content. Only {stats.maxAdmins} admins allowed.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={() => handleUserAction(selectedUser?._id, 'promote')} disabled={actionLoading} className="bg-purple-600">
              {actionLoading ? 'Promoting...' : 'Promote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demote to Author</DialogTitle>
            <DialogDescription>
              Demote {selectedUser?.name} to author role?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDemoteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleUserAction(selectedUser?._id, 'demote')} disabled={actionLoading}>
              {actionLoading ? 'Demoting...' : 'Demote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Deactivate {selectedUser?.name}? They cannot log in until reactivated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleUserAction(selectedUser?._id, 'deactivate')} disabled={actionLoading}>
              {actionLoading ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
