import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';

interface FirmDetailsProps {
  firmName: string;
  ownerName: string;
  email: string;
  address: string;
  phone: string;
}

export function FirmDetails({
  firmName,
  ownerName,
  email,
  address,
  phone
}: FirmDetailsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h3 className="text-xl font-semibold">{firmName}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Owner:</span>
              <span>{ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{email}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Address:</span>
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Phone:</span>
              <span>{phone}</span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Manage your firm details and client information in this section.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 