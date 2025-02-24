import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { TeamCardProps } from '../../my-firm/types';

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(team.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(team.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground">
            {team.members.length} {team.members.length === 1 ? 'Lawyer' : 'Lawyers'}
          </div>
          <div className="flex -space-x-2">
            {team.members.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="border-2 border-background">
                <AvatarImage src="/placeholder-avatar.png" alt={member.name} />
                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 5 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
                +{team.members.length - 5}
              </div>
            )}
          </div>
          {team.practiceArea && (
            <div className="text-sm text-muted-foreground">
              Practice Area: {team.practiceArea}
            </div>
          )}
          {team.department && (
            <div className="text-sm text-muted-foreground">
              Department: {team.department}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

