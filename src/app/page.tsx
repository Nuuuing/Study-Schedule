'use client'

import { MainLayout } from "@/components/Layout"
import { AuthGuard } from "@/components/auth"
import { MainContainer } from "@/container"

export default function Main() {
    return (
        <AuthGuard>
            <MainLayout>
                <MainContainer />
            </MainLayout>
        </AuthGuard>
    )
}