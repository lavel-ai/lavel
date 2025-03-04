// apps/app/app/(authenticated)/my-firm/page.tsx
'use client';

import { PracticeAreaFormSimplified } from '@/app/(authenticated)/features/practice-area/components/practice-area-form';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';

export default function MyFirmPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Firm</h1>
      </div>
      
      <Tabs defaultValue="practice-areas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="practice-areas">Practice Areas</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="practice-areas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Practice Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Create and manage practice areas for your law firm. Practice areas help categorize your legal services.
                </p>
                
                {/* Practice Area Form for Testing */}
                <div className="mt-6">
                  <PracticeAreaFormSimplified />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Practice Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section would typically display existing practice areas.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Department management would go here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firm Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Firm settings would go here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}