import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import { Edit } from "lucide-react";
import { Badge } from "@repo/design-system/components/ui/badge";

interface ClientCardProps {
  name: string;
  industry: string;
  contactPerson?: string;
  email?: string;
  status?: string;
  onEdit: () => void;
}

export function ClientCard({
  name,
  industry,
  contactPerson,
  email,
  status,
  onEdit,
}: ClientCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{industry}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contactPerson && (
            <div className="text-sm">
              <span className="font-medium">Contact:</span> {contactPerson}
            </div>
          )}
          {email && (
            <div className="text-sm">
              <span className="font-medium">Email:</span> {email}
            </div>
          )}
          {status && (
            <div className="mt-2">
              <Badge variant="outline">{status}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
