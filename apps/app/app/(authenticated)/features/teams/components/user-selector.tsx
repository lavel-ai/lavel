// apps/app/app/(authenticated)/features/teams/components/UserSelector.tsx
'use client';

import { useState } from 'react';
import { Input } from '@repo/design-system/components/ui/input';
import { Card } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';

type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  maternalLastName?: string;
  email: string;
  imageUrl?: string;
};

type UserSelectorProps = {
  users: User[];
  onSelect: (selected: string[]) => void;
};

export function UserSelector({ users, onSelect }: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelect = (userId: string) => {
    const newSelected = selected.includes(userId)
      ? selected.filter((id) => id !== userId)
      : [...selected, userId];
    setSelected(newSelected);
    onSelect(newSelected);
  };

  return (
    <div className="space-y-4 mt-2">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className={cn(
              'p-4 flex flex-col items-center space-y-2 transition-colors',
              selected.includes(user.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            )}
          >
            <img
              src={user.imageUrl || '/default-avatar.png'}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <h3 className="text-sm font-medium">
              {user.firstName} {user.lastName} {user.maternalLastName}
            </h3>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <input
              type="checkbox"
              checked={selected.includes(user.id)}
              onChange={() => handleSelect(user.id)}
              className="mt-2"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}