import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Calendar, ArrowRight, Shield } from "lucide-react"

export default function AuthorCard({ author }) {
    return (
        <Card className="blog-card overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        {author.profilePictureUrl ? (
                            <Image
                                src={author.profilePictureUrl}
                                alt={`${author.name}'s profile picture`}
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        {author.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Shield className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate">
                            <Link
                                href={`/author/${author.username || author._id}`}
                                className="hover:text-primary transition-colors"
                            >
                                {author.name}
                            </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge
                                variant={author.role === 'admin' ? 'default' : 'secondary'}
                                className="text-xs"
                            >
                                {author.role === 'admin' ? 'Admin' : 'Author'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {author.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {author.bio}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-lg font-semibold text-foreground">
                            {author.postCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {author.postCount === 1 ? 'Post' : 'Posts'}
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground">
                            {author.totalViews.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {author.totalViews === 1 ? 'View' : 'Views'}
                        </div>
                    </div>
                </div>

                {author.latestPost && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                            Last post: {new Date(author.latestPost).toLocaleDateString()}
                        </span>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                >
                    <Link
                        href={`/author/${author.username || author._id}`}
                        aria-label={`View ${author.name}'s profile`}
                    >
                        View Profile
                        <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
