import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import { Edit, Trash2, Briefcase, Users, MoreHorizontal, Star } from "lucide-react";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { LawyerCardProps } from "../../my-firm/types";

export function LawyerCard({ lawyer, onEdit, onDelete }: LawyerCardProps) {
  // Determine if the lawyer is a lead lawyer
  const isLeadLawyer = lawyer.isLeadLawyer;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border border-border h-[180px] flex flex-col">
      {/* Colored header strip */}
      <div className={`h-1 w-full ${isLeadLawyer ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-primary to-primary/80'}`}></div>
      
      <CardHeader className="pb-1 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-7 w-7 border border-muted">
              <AvatarFallback className={`${isLeadLawyer ? 'bg-amber-50 text-amber-700' : 'bg-primary/10 text-primary'} text-[10px]`}>
                {`${lawyer.name[0]}${lawyer.lastName ? lawyer.lastName[0] : ''}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-xs line-clamp-1">{`${lawyer.name} ${lawyer.lastName || ''}`}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                {isLeadLawyer ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1 py-0 h-3.5">
                    <Star className="h-2 w-2 mr-0.5 fill-amber-500 text-amber-500" />
                    Lead Lawyer
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-primary/5 text-primary/80 border-primary/20 text-[10px] px-1 py-0 h-3.5">
                    Lawyer
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lawyer.id)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Lawyer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(lawyer.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Remove Lawyer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-1 px-3 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Lawyer details */}
          <div className="space-y-1">
            {lawyer.maternalLastName && (
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-muted-foreground">Maternal Last Name:</span>
                <span>{lawyer.maternalLastName}</span>
              </div>
            )}
            
            {lawyer.practiceArea && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 h-4 px-1.5">
                  <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                  {lawyer.practiceArea}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Teams section */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs text-muted-foreground">Team Membership</p>
            <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              {lawyer.teams.length}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {lawyer.teams.length > 0 ? (
              lawyer.teams.map((team, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-muted/50 hover:bg-muted/80 transition-colors text-[10px] py-0 h-4"
                >
                  {team.name}
                </Badge>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground italic">No teams assigned</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
