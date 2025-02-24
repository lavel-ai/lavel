import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@repo/design-system/components/ui/badge";
import type { LawyerCardProps } from "../../my-firm/types";

export function LawyerCard({ lawyer, onEdit, onDelete }: LawyerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder-avatar.png" alt={`${lawyer.name} ${lawyer.lastName}`} />
            <AvatarFallback>{`${lawyer.name[0]}${lawyer.lastName[0]}`}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{`${lawyer.name} ${lawyer.lastName}`}</h3>
            <p className="text-sm text-muted-foreground">
              {lawyer.isLeadLawyer ? 'Lead Lawyer' : 'Lawyer'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(lawyer.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(lawyer.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {lawyer.teams.length > 0 && (
            <Badge variant="secondary">{lawyer.teams[0].name}</Badge>
          )}
          {lawyer.practiceArea && (
            <Badge variant="outline">{lawyer.practiceArea}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
