import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';

interface PersonFormProps {
  control: any;
  register: any;
  errors: any;
  tempClientId: string | null;
}

const PersonForm: React.FC<PersonFormProps> = ({
  control,
  register,
  errors,
  tempClientId,
}) => (
  <>
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombres</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="parentLastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Apellido Paterno</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="maternalLastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Apellido Materno</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="maternalLastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Apellido Materno</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default PersonForm;
