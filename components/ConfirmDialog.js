import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

/**
 * Confirmation Dialog Component
 * 
 * Reusable confirmation dialog for destructive actions
 * Prevents accidental deletions and provides clear warnings
 * 
 * Usage:
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user? This action cannot be undone."
 *   confirmText="Delete"
 *   variant="destructive"
 * />
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Continue",
    cancelText = "Cancel",
    variant = "default", // "default" | "destructive"
    loading = false
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === "destructive" && (
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        )}
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        disabled={loading}
                        className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
                    >
                        {loading ? "Processing..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

/**
 * Bulk Action Confirmation Dialog
 * 
 * Specialized confirmation for bulk operations
 */
export function BulkConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    action,
    count,
    itemType = "items",
    loading = false
}) {
    const actionText = {
        delete: "Delete",
        approve: "Approve",
        reject: "Reject",
        archive: "Archive"
    }

    const descriptions = {
        delete: `Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`,
        approve: `Are you sure you want to approve ${count} ${itemType}?`,
        reject: `Are you sure you want to reject ${count} ${itemType}?`,
        archive: `Are you sure you want to archive ${count} ${itemType}?`
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={`${actionText[action]} ${count} ${itemType}`}
            description={descriptions[action]}
            confirmText={actionText[action]}
            variant={action === "delete" ? "destructive" : "default"}
            loading={loading}
        />
    )
}
