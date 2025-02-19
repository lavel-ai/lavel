import { Control, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useEffect } from 'react';
import { CountryCombobox } from '../comboboxes/countries-combobox';

interface BillingInfoFormProps {
  control: Control<any>;
  onAddressChange?: (address: any) => void; // Add onAddressChange prop
}

const BillingInfoForm: React.FC<BillingInfoFormProps> = ({
  control,
  onAddressChange,
}) => {
  const { getValues } = useFormContext(); // Use useFormContext

  // useEffect to call onAddressChange whenever address fields change
  useEffect(() => {
    if (onAddressChange) {
      const address = {
        street: getValues('billingAddress.street'), // Use getValues
        city: getValues('billingAddress.city'),
        state: getValues('billingAddress.state'),
        zipCode: getValues('billingAddress.zipCode'),
        country: getValues('billingAddress.country'),
      };
      onAddressChange(address);
    }
  }, [getValues, onAddressChange]); // Add getValues to the dependency array

  return (
    <>
      <FormField
        control={control}
        name="billingAddress.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Calle</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingAddress.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingAddress.state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingAddress.zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingAddress.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País</FormLabel>
            <FormControl>
              <CountryCombobox />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="taxId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RFC</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo de Facturación</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="paymentTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Términos de Pago</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="preferredCurrency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moneda</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BillingInfoForm; 