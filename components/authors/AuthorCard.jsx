import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Calendar, ArrowRight, Shield, Eye, FileText } from "lucide-react"

export default function AuthorCard({ author }) {
    return (
        <Card className="blog-card overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-transparent hover:border-blue-500/30">
            <CardHeader className="pb-4 relative">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="relative">
                        {/* Gradient glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                        {author.profilePictureUrl ? (
                            <div className="relative">
                                <Image
                                    src={author.profilePictureUrl}
                                    alt={`${author.name}'s profile picture`}
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover ring-4 ring-white/50 dark:ring-gray-700/50 group-hover:ring-blue-500/50 transition-all duration-300 relative z-10"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-700/50 group-hover:ring-blue-500/50 transition-all duration-300 relative z-10">
                                <UserIcon className="h-10 w-10 text-white" />
                            </div>
                        )}
                        {author.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800 z-20">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 truncate">
                            <Link
                                href={`/author/${author.username || author._id}`}
                                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300"
                            >
                                {author.name}
                            </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge
                                variant={author.role === 'admin' ? 'default' : 'secondary'}
                                className={author.role === 'admin'
                                    ? 'text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600/50'
                                    : 'text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30'}
                            >
                                {author.role === 'admin' ? '⚡ Admin' : '✍️ Author'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {author.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {author.bio}
                    </p>
                )}

                {/* Enhanced stats with gradient backgrounds */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-800 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                                {author.postCount}
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {author.postCount === 1 ? 'Post' : 'Posts'}
                        </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 border border-purple-200 dark:border-purple-800 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
                                {author.totalViews > 999 ? `${(author.totalViews / 1000).toFixed(1)}k` : author.totalViews}
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {author.totalViews === 1 ? 'View' : 'Views'}
                        </div>
                    </div>
                </div>

                {author.latestPost && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>
                            Last post: {new Date(author.latestPost).toLocaleDateString()}
                        </span>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                    asChild
                >
                    <Link
                        href={`/author/${author.username || author._id}`}
                        aria-label={`View ${author.name}'s profile`}
                    >
                        View Profile
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
