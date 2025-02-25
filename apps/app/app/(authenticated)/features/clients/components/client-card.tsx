import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import { MoreHorizontal, Edit, Mail, UserRound, Briefcase, CircleCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Badge } from "@repo/design-system/components/ui/badge";

interface ClientCardProps {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  status: string;
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
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="font-medium text-lg">{name}</h3>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(status)}>
            <CircleCheck className="mr-1 h-3 w-3" />
            {status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>{industry}</span>
          </div>
          {contactPerson && (
            <div className="flex items-center text-sm text-muted-foreground">
              <UserRound className="mr-2 h-4 w-4" />
              <span>{contactPerson}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
