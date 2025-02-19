import { Control, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { CountryCombobox } from '../comboboxes/countries-combobox';

interface ContactInfoFormProps {
  control: Control<any>;
  index: number;
  remove: (index: number) => void;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  control,
  index,
  remove,
}) => {
  const { getValues } = useFormContext();

  return (
    <div className="border p-4 rounded-md space-y-4">
      <FormField
        control={control}
        name={`contactInfo.${index}.contactName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Contacto</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`contactInfo.${index}.primaryPhone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono Principal</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`contactInfo.${index}.secondaryPhone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono Secundario</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`contactInfo.${index}.email`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`contactInfo.${index}.address.street`}
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
        name={`contactInfo.${index}.address.city`}
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
        name={`contactInfo.${index}.address.state`}
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
        name={`contactInfo.${index}.address.zipCode`}
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
        name={`contactInfo.${index}.address.country`}
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
        name={`contactInfo.${index}.preferredContactMethod`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Método de Contacto Preferido</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="button" onClick={() => remove(index)}>
        Remove Contact
      </Button>
    </div>
  );
};

export default ContactInfoForm; 