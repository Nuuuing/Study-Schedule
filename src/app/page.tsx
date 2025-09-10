'use client'

import { MainLayout, AuthGuard } from "@/components"
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