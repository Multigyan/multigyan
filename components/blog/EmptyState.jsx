import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                {Icon && <Icon className="h-16 w-16 text-muted-foreground mb-4" />}
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
                {action}
            </CardContent>
        </Card>
    )
}
