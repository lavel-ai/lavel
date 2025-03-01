import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { Edit, Trash2, Users, Briefcase, Building, MoreHorizontal } from 'lucide-react';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { TeamCardProps } from '../../my-firm/types';

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  // Find the leader of the team
  const leader = team.members.find((member: any) => member.isLeadLawyer);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border border-border h-[180px] flex flex-col">
      {/* Colored header strip */}
      <div className="h-1 bg-gradient-to-r from-primary to-primary/80 w-full"></div>
      
      <CardHeader className="pb-1 pt-2.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold line-clamp-1">{team.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(team.id)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(team.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-1 px-3">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-1.5">
            {/* Team metadata */}
            <div className="flex flex-wrap gap-1">
              {team.practiceArea && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-0 h-4 px-1.5">
                  <Briefcase className="h-2.5 w-2.5 mr-1" />
                  {team.practiceArea}
                </Badge>
              )}
              {team.department && (
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted text-xs py-0 h-4 px-1.5">
                  <Building className="h-2.5 w-2.5 mr-1" />
                  {team.department}
                </Badge>
              )}
            </div>
            
            {/* Team description */}
            <div>
              {team.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{team.description}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">No description</p>
              )}
            </div>
            
            {/* Team leader */}
            {leader && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Team Leader</p>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                      {leader.name.charAt(0)}{leader.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{leader.name} {leader.lastName}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Team members */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs text-muted-foreground">Team Members</p>
              <Badge variant="outline" className="text-xs py-0 h-4 px-1.5">
                <Users className="h-2.5 w-2.5 mr-1" />
                {team.members.length}
              </Badge>
            </div>
            
            <div className="flex -space-x-1 overflow-hidden">
              {team.members.slice(0, 5).map((member: any) => (
                <Avatar key={member.id} className="border-2 border-background h-5 w-5">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[8px]">
                    {member.name.charAt(0)}{member.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.members.length > 5 && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[8px] font-medium border-2 border-background">
                  +{team.members.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

