'use client';

import { useMobile } from '@/hooks/use-mobile';
import { useClientForm } from '../hooks/use-client-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@repo/design-system/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { ProgressIndicator } from './progress-indicator';
import { GeneralDataTab } from './tabs/general-data-tab';
import { LawFirmDataTab } from './tabs/law-firm-data-tab';
import { ContactInfoTab } from './tabs/contact-info-tab';
import { BillingInfoTab } from './tabs/billing-info-tab';

export function ClientForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const isMobile = useMobile();
  const { form, currentTab, setCurrentTab, tabs, getTabStatus, handleSubmit } = useClientForm();

  const onSubmit = (data: ClientFormData) => {
    console.log('Form Submitted:', data);
    // Call server action here (e.g., createClient)
    onOpenChange(false);
  };

  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;
  const WrapperHeader = isMobile ? DrawerHeader : DialogHeader;
  const WrapperTitle = isMobile ? DrawerTitle : DialogTitle;

  return (
    <Wrapper open={open} onOpenChange={onOpenChange}>
      <WrapperContent>
        <WrapperHeader>
          <WrapperTitle>Create New Client</WrapperTitle>
        </WrapperHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {getTabStatus(tab).hasErrors && ' ⚠️'}
                  {getTabStatus(tab).isComplete && !getTabStatus(tab).hasErrors && ' ✅'}
                </TabsTrigger>
              ))}
            </TabsList>
            <ProgressIndicator tabs={tabs} getTabStatus={getTabStatus} />
            <TabsContent value="general">
              <GeneralDataTab form={form} />
            </TabsContent>
            <TabsContent value="lawFirm">
              <LawFirmDataTab form={form} />
            </TabsContent>
            <TabsContent value="contact">
              <ContactInfoTab form={form} />
            </TabsContent>
            <TabsContent value="billing">
              <BillingInfoTab form={form} />
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Client</Button>
          </div>
        </form>
      </WrapperContent>
    </Wrapper>
  );
}