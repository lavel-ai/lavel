'use client';

import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { useClientForm } from '../../hooks/use-client-form';
import { useClientFormSubmit } from '../../hooks/use-client-form-submit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@repo/design-system/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { ProgressIndicator } from '../../../shared/progress/progress-indicator';
import { GeneralDataTab } from './tabs/general-data-tab';
import { LawFirmDataTab } from './tabs/law-firm-data-tab';
import { ContactInfoTab } from './tabs/contact-info-tab';
import { BillingInfoTab } from './tabs/billing-info-tab';
import { CompletedClientFormData } from '../../validation/schema-factory';
import { useState, useEffect } from 'react';
import { Form } from '@repo/design-system/components/ui/form';
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
  initialData?: CompletedClientFormData;
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
    submitForm,
    isSubmitting
  } = useClientFormSubmit({ 
    onSuccess: () => onOpenChange(false),
    clientId 
  });

  const onSubmit = async (data: CompletedClientFormData) => {
    console.log('Form submission started with data:', data);
    
    try {
      // Log validation state before triggering
      console.log('Form validation state before trigger:', {
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors
      });
      
      // Trigger validation on all fields
      const isValid = await form.trigger(undefined, { shouldFocus: true });
      
      console.log('Form validation result:', isValid);
      console.log('Form errors after validation:', form.formState.errors);
      
      if (!isValid) {
        console.log('Form validation failed, finding first tab with errors');
        // Find the first tab with errors and switch to it
        for (const tab of tabs) {
          const tabStatus = getTabStatus(tab);
          if (tabStatus.hasErrors) {
            console.log(`Switching to tab with errors: ${tab}`);
            setCurrentTab(tab);
            break;
          }
        }
        return;
      }
      
      console.log('Form validation passed, submitting form');
      const success = await submitForm(data);
      console.log('Form submission result:', success);
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      // Continue with form submission even if there are non-critical errors
      const success = await submitForm(data);
      if (success) {
        onOpenChange(false);
      }
    }
  };



  const handleDiscard = async () => {
    // Since we're no longer using temporary clients, 
    // just reset the form and close the dialog
    setDiscardDialogOpen(false);
    form.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    // If we have unsaved changes, ask for confirmation
    if (form.formState.isDirty) {
      setDiscardDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;
  const WrapperHeader = isMobile ? DrawerHeader : DialogHeader;
  const WrapperTitle = isMobile ? DrawerTitle : DialogTitle;

  // Fixed height calculation for the content area
  const contentHeight = isMobile ? "calc(70vh - 200px)" : "550px";

  return (
    <>
      <Wrapper open={open} onOpenChange={onOpenChange}>
        <WrapperContent className="max-h-[90vh] overflow-y-auto">
          <WrapperHeader>
            <WrapperTitle>{mode === 'create' ? 'Create New Client' : 'Edit Client'}</WrapperTitle>
          </WrapperHeader>
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submit event triggered');
                form.handleSubmit(onSubmit)(e);
              }} 
              className="p-4 space-y-4"
            >
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {getTabStatus(tab).hasErrors && ' ⚠️'}
                      {getTabStatus(tab).isComplete && !getTabStatus(tab).hasErrors && ' ✅'}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div>
                  <ProgressIndicator 
                    tabs={tabs.reduce((acc, tab) => {
                      acc[tab] = getTabStatus(tab);
                      return acc;
                    }, {} as Record<string, { isComplete: boolean; hasErrors: boolean }>)} 
                  />
                </div>
                <div className="overflow-y-auto" style={{ height: contentHeight, minHeight: contentHeight }}>
                  <TabsContent value="general" className="m-0">
                    <GeneralDataTab form={form as any} />
                  </TabsContent>
                  <TabsContent value="lawFirm" className="m-0">
                    <LawFirmDataTab form={form as any} />
                  </TabsContent>
                  <TabsContent value="contact" className="m-0">
                    <ContactInfoTab form={form as any} />
                  </TabsContent>
                  <TabsContent value="billing" className="m-0">
                    <BillingInfoTab form={form as any} />
                  </TabsContent>
                </div>
              </Tabs>
              <div className="flex flex-wrap justify-between gap-2 pt-2">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Client' : 'Save Changes'}
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => {
                        console.log('Debug button clicked');
                        // Get current form values
                        const formValues = form.getValues();
                        console.log('Current form values:', formValues);
                        
                        // Force submit the form data directly
                        submitForm(formValues);
                      }}
                    >
                      Debug Submit
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </WrapperContent>
      </Wrapper>

      {/* Discard confirmation dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your changes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}