'use client';

import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { TeamMemberBasicInfo } from "@/app/(authenticated)/features/shared/actions/team-members-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";

interface LawyerCardProps {
  lawyer: TeamMemberBasicInfo;
  isSelected: boolean;
  onSelect: (lawyerId: string, role?: 'leader' | 'member') => void;
  disabled?: boolean;
}

export function LawyerCard({ lawyer, isSelected, onSelect, disabled }: LawyerCardProps) {
  return (
    <Card
      className={cn(
        'p-4 flex flex-col space-y-2 transition-colors cursor-pointer',
        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {lawyer.imageUrl && (
            <img
              src={lawyer.imageUrl}
              alt={`${lawyer.name} ${lawyer.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-medium">{lawyer.name} {lawyer.lastName}</h3>
            <p className="text-sm text-muted-foreground">{lawyer.email}</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => !disabled && onSelect(lawyer.id)}
          disabled={disabled}
          className="mt-1"
        />
      </div>
      
      {isSelected && (
        <div className="pt-2">
          <Select
            defaultValue="member"
            onValueChange={(value) => onSelect(lawyer.id, value as 'leader' | 'member')}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leader">Team Leader</SelectItem>
              <SelectItem value="member">Team Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </Card>
  );
} 