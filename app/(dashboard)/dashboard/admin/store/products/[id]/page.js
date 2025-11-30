"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditProductPage({ params }) {
    const router = useRouter()

    useEffect(() => {
        // Redirect to products list for now
        // TODO: Implement edit functionality
        router.push('/dashboard/admin/store/products')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
    )
}
