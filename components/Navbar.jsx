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
import { Search, Menu, X, PenTool, BookOpen, Users, Home, User, Settings, LogOut, Shield, LayoutDashboard, Wrench, ChefHat, Bookmark } from "lucide-react"
import NotificationBell from "@/components/notifications/NotificationBell"
import { cn } from "@/lib/utils"
import { prefetchOnHover } from "@/lib/prefetch"

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

  const isActiveLink = (path) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* ✅ ACCESSIBILITY: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-lg"
      >
        Skip to main content
      </a>

      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          {/* ✅ IMPROVED: Better mobile header height and spacing */}
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* ✅ IMPROVED: Better mobile logo sizing */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 scale-in">
              <div className="brand-logo">
                <Image
                  src="/Multigyan_Logo.png"
                  alt="Multigyan Logo"
                  width={120}
                  height={32}
                  className="w-28 sm:w-32 md:w-36 lg:w-40 h-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList className="flex items-center">
                  <NavigationMenuItem>
                    <Link
                      href="/"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink('/') && pathname === '/' && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        "h-10 px-4 py-2 transition-all hover:scale-105",
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-105",
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-105",
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

                  {/* 🎨 NEW: DIY Link */}
                  <NavigationMenuItem>
                    <Link
                      href="/diy"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink('/diy') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      DIY
                    </Link>
                  </NavigationMenuItem>

                  {/* 🍳 NEW: Recipe Link */}
                  <NavigationMenuItem>
                    <Link
                      href="/recipe"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink('/recipe') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <ChefHat className="mr-2 h-4 w-4" />
                      Recipes
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href="/authors"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
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
              <form onSubmit={handleSearch} role="search" aria-label="Search blog posts" className="relative w-64 ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search blog posts"
                  className="pl-10 transition-all focus:w-72"
                />
              </form>
            </div>

            {/* Auth Section - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {status === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  {/* 🔖 NEW: Bookmarks Link */}
                  <Button
                    variant={isActiveLink('/bookmarks') ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="transition-all hover:scale-105"
                  >
                    <Link href="/bookmarks">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Bookmarks
                    </Link>
                  </Button>

                  <NotificationBell />

                  <Button
                    variant={isActiveLink('/dashboard') ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="transition-all hover:scale-105"
                  >
                    <Link
                      href="/dashboard"
                      {...prefetchOnHover('/api/users/dashboard/stats')}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-11 w-11 rounded-full transition-all hover:scale-110">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={session.user.profilePictureUrl} alt={session.user.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getInitials(session.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 scale-in" align="end" forceMount>
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
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/bookmarks">
                          <Bookmark className="mr-2 h-4 w-4" />
                          My Bookmarks
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/dashboard"
                          {...prefetchOnHover('/api/users/dashboard/stats')}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/dashboard/admin">
                              <Shield className="mr-2 h-4 w-4" />
                              Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" asChild className="transition-all hover:scale-105">
                    <Link href="/login">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="transition-all hover:scale-105 hover:shadow-lg">
                    <Link href="/register">
                      <PenTool className="mr-2 h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* ✅ IMPROVED: Mobile Menu Button with better touch targets */}
            <div className="flex items-center space-x-2 md:hidden">
              {session && (
                <NotificationBell />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="transition-all hover:scale-110 h-12 w-12"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* ✅ IMPROVED: Mobile Navigation with smooth animations */}
          {isOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t slide-in">
              <div className="flex flex-col space-y-4">
                {/* ✅ IMPROVED: Mobile Search with better spacing */}
                <form onSubmit={handleSearch} role="search" aria-label="Search blog posts" className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search blog posts"
                    className="pl-10 h-12 text-base"
                  />
                </form>

                {/* ✅ IMPROVED: Mobile Navigation Links with better touch targets (min 44px) */}
                <Link
                  href="/"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/') && pathname === '/' && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/blog"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/blog') && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>All Posts</span>
                </Link>

                <Link
                  href="/categories"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/categories') && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Categories</span>
                </Link>

                {/* 🎨 NEW: DIY Link - Mobile */}
                <Link
                  href="/diy"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/diy') && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Wrench className="h-5 w-5" />
                  <span>DIY Tutorials</span>
                </Link>

                {/* 🍳 NEW: Recipe Link - Mobile */}
                <Link
                  href="/recipe"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/recipe') && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <ChefHat className="h-5 w-5" />
                  <span>Recipes</span>
                </Link>

                <Link
                  href="/authors"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md hover:bg-accent transition-all hover:scale-105 min-h-[44px]",
                    isActiveLink('/authors') && "bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Authors</span>
                </Link>

                {/* ✅ IMPROVED: Mobile Auth Section with better spacing */}
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
                        variant={isActiveLink('/bookmarks') ? "default" : "ghost"}
                        asChild
                        className="justify-start h-12 text-base"
                      >
                        <Link href="/bookmarks" onClick={() => setIsOpen(false)}>
                          <Bookmark className="mr-3 h-5 w-5" />
                          My Bookmarks
                        </Link>
                      </Button>

                      <Button
                        variant={isActiveLink('/dashboard') ? "default" : "ghost"}
                        asChild
                        className="justify-start h-12 text-base"
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          {...prefetchOnHover('/api/users/dashboard/stats')}
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5" />
                          Dashboard
                        </Link>
                      </Button>

                      <Button variant="ghost" asChild className="justify-start h-12 text-base">
                        <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
                          <User className="mr-3 h-5 w-5" />
                          Profile
                        </Link>
                      </Button>

                      <Button variant="ghost" asChild className="justify-start h-12 text-base">
                        <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                          <Settings className="mr-3 h-5 w-5" />
                          Settings
                        </Link>
                      </Button>

                      {session.user.role === 'admin' && (
                        <Button variant="ghost" asChild className="justify-start h-12 text-base">
                          <Link href="/dashboard/admin" onClick={() => setIsOpen(false)}>
                            <Shield className="mr-3 h-5 w-5" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}

                      <Button variant="ghost" onClick={handleSignOut} className="justify-start h-12 text-base">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="h-12 text-base">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <User className="mr-3 h-5 w-5" />
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="h-12 text-base">
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <PenTool className="mr-3 h-5 w-5" />
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
    </>
  )
}
