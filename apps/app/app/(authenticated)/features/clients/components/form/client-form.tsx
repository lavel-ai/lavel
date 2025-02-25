'use client';

import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { useClientForm } from '../../hooks/use-client-form';
import { useClientFormSubmit } from '../../hooks/use-client-form-submit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@repo/design-system/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { Loader2, Save, Trash } from 'lucide-react';
import { ProgressIndicator } from '../../../shared/progress/progress-indicator';
import { GeneralDataTab } from './tabs/general-data-tab';
import { LawFirmDataTab } from './tabs/law-firm-data-tab';
import { ContactInfoTab } from './tabs/contact-info-tab';
import { BillingInfoTab } from './tabs/billing-info-tab';
import { ClientFormData } from '../../validation/schemas';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ClientFormData;
  mode?: 'create' | 'edit';
  clientId?: string;
}

export function ClientForm({ 
  open, 
  onOpenChange, 
  initialData, 
  mode = 'create',
  clientId,
}: ClientFormProps) {
  const isMobile = useIsMobile();
  const { form, currentTab, setCurrentTab, tabs, getTabStatus } = useClientForm(initialData);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  
  const { 
    isSubmitting, 
    submitForm, 
     
  } = useClientFormSubmit({ 
    onSuccess: () => onOpenChange(false),
    clientId 
  });

  const onSubmit = async (data: ClientFormData) => {
    const success = await submitForm(data);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleSaveDraft = async () => {
    await saveAsDraft(form.getValues());
  };

  const handleDiscard = async () => {
    const success = await discardDraft();
    if (success) {
      setDiscardDialogOpen(false);
      form.reset();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // If we have unsaved changes and a temporary ID, ask for confirmation
    if (form.formState.isDirty && temporaryClientId) {
      setDiscardDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;
  const WrapperHeader = isMobile ? DrawerHeader : DialogHeader;
  const WrapperTitle = isMobile ? DrawerTitle : DialogTitle;

  return (
    <>
      <Wrapper open={open} onOpenChange={onOpenChange}>
        <WrapperContent className="max-h-[90vh] overflow-y-auto">
          <WrapperHeader>
            <WrapperTitle>{mode === 'create' ? 'Create New Client' : 'Edit Client'}</WrapperTitle>
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
              <div className="mt-4">
                <ProgressIndicator 
                  tabs={tabs.reduce((acc, tab) => {
                    acc[tab] = getTabStatus(tab);
                    return acc;
                  }, {} as Record<string, { isComplete: boolean; hasErrors: boolean }>)} 
                />
              </div>
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
            <div className="mt-6 flex flex-wrap justify-between gap-2">
              <div>
                {mode === 'create' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={isSaving || isSubmitting}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isSaving && <Save className="mr-2 h-4 w-4" />}
                    Save as Draft
                  </Button>
                )}
              </div>
              <div className="flex gap-2 ml-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Client' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </WrapperContent>
      </Wrapper>

      {/* Discard confirmation dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground">
              <Trash className="mr-2 h-4 w-4" />
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}