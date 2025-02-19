import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@repo/design-system/components/ui/form';
  import { Input } from '@repo/design-system/components/ui/input';

  const CompanyForm: React.FC<{ control: any; register: any }> = ({ control, register }) => (
    <>
      <FormField
        control={control}
        name="name" // Use 'name' for Denominación Social
        render={({ field }) => (
          <FormItem>
            <FormLabel>Denominación Social</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* ... other company-specific fields ... */}
    </>
  );

  export default CompanyForm; 