'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function Analytics() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                Analytics
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track your thread performance and engagement metrics.
              </p>
            </header>

            <main className="space-y-12">
              <div className="max-w-2xl mx-auto">
                <div className="bg-muted/50 border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    Analytics features coming soon. Track your thread performance, engagement rates, and more.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}