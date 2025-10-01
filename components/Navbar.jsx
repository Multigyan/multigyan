"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, PenTool, BookOpen, Users, Home, User, Settings, LogOut, Shield, LayoutDashboard } from "lucide-react"
import NotificationBell from "@/components/notifications/NotificationBell"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  // Helper function to check if link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="brand-logo">
              <Image
                src="/Multigyan_Logo.png"
                alt="Multigyan Logo"
                width={150}
                height={40}
                className="w-40 sm:w-30 h-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center">
                {/* Home - Simplified without NavigationMenuLink */}
                <NavigationMenuItem>
                  <Link 
                    href="/"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActiveLink('/') && pathname === '/' && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </NavigationMenuItem>

                {/* Blog - With Icon and Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "h-10 px-4 py-2",
                      (isActiveLink('/blog') || isActiveLink('/categories')) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Blog
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <Link 
                        href="/blog" 
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          isActiveLink('/blog') && "bg-accent/50"
                        )}
                      >
                        <div className="text-sm font-medium leading-none flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          All Posts
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse all published blog posts
                        </p>
                      </Link>
                      <Link 
                        href="/categories" 
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          isActiveLink('/categories') && "bg-accent/50"
                        )}
                      >
                        <div className="text-sm font-medium leading-none flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Categories
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Explore posts by category
                        </p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Authors - Simplified without NavigationMenuLink */}
                <NavigationMenuItem>
                  <Link 
                    href="/authors"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActiveLink('/authors') && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Authors
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-64 ml-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* Desktop Notification Bell */}
                <NotificationBell />
                
                <Button 
                  variant={isActiveLink('/dashboard') ? "default" : "ghost"} 
                  size="sm" 
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.profilePictureUrl} alt={session.user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {session.user.role === 'admin' ? (
                            <>
                              <Shield className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">Admin</span>
                            </>
                          ) : (
                            <>
                              <PenTool className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Author</span>
                            </>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <PenTool className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Notification */}
          <div className="flex items-center space-x-2 md:hidden">
            {session && (
              <NotificationBell />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </form>

              {/* Mobile Navigation Links */}
              <Link 
                href="/" 
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent",
                  isActiveLink('/') && pathname === '/' && "bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              <Link 
                href="/blog" 
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent",
                  isActiveLink('/blog') && "bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>All Posts</span>
              </Link>
              
              <Link 
                href="/categories" 
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent",
                  isActiveLink('/categories') && "bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Categories</span>
              </Link>
              
              <Link 
                href="/authors" 
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent",
                  isActiveLink('/authors') && "bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>Authors</span>
              </Link>

              {/* Mobile Auth Section */}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {session ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {session.user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">Admin</span>
                          </>
                        ) : (
                          <>
                            <PenTool className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Author</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant={isActiveLink('/dashboard') ? "default" : "ghost"} 
                      asChild 
                      className="justify-start"
                    >
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                    
                    {session.user.role === 'admin' && (
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/dashboard/admin" onClick={() => setIsOpen(false)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <PenTool className="mr-2 h-4 w-4" />
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
