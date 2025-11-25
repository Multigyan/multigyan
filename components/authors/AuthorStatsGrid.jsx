import { Card, CardContent } from "@/components/ui/card"
import { UsersIcon, BookOpen, PenTool, Shield } from "lucide-react"

export default function AuthorStatsGrid({ totalAuthors, totalPosts, totalViews, adminCount }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                        <UsersIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalAuthors}</div>
                    <div className="text-sm text-muted-foreground">Active Authors</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mx-auto mb-4">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalPosts}</div>
                    <div className="text-sm text-muted-foreground">Published Posts</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mx-auto mb-4">
                        <PenTool className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-lg mx-auto mb-4">
                        <Shield className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{adminCount}</div>
                    <div className="text-sm text-muted-foreground">Admin{adminCount !== 1 ? 's' : ''}</div>
                </CardContent>
            </Card>
        </div>
    )
}
