// 'use client';

// import { useTodayTasks } from '@/app/hook/src/tasks';
// import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
// import { ListTodo, AlertCircle, Circle, CheckCircle2 } from 'lucide-react';
// import { cn } from '@repo/design-system/lib/utils';

// interface TaskItemProps {
//   title: string;
//   priority: string;
//   isOverdue?: boolean;
// }

// function TaskItem({ title, priority, isOverdue }: TaskItemProps) {
//   return (
//     <div className={cn(
//       "flex items-center gap-2 py-1",
//       isOverdue && "text-destructive"
//     )}>
//       <Circle className="h-4 w-4 hover:hidden" />
//       <CheckCircle2 className="hidden h-4 w-4 hover:block hover:cursor-pointer" />
//       <span className="flex-1 text-sm">{title}</span>
//       {priority === 'high' && (
//         <span className="h-2 w-2 rounded-full bg-destructive" />
//       )}
//     </div>
//   );
// }

// export function TasksKPI() {
//   const { data, isLoading, error } = useTodayTasks();

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Today</CardTitle>
//           <ListTodo className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-sm">Loading tasks...</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Today</CardTitle>
//           <ListTodo className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-sm text-destructive">Failed to load tasks</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">Today</CardTitle>
//         <ListTodo className="h-4 w-4 text-muted-foreground" />
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {data && data.totalOverdue > 0 && (
//             <div>
//               <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 Overdue
//               </div>
//               <div className="space-y-1">
//                 {data.overdueTasks.map(task => (
//                   <TaskItem
//                     key={task.id}
//                     title={task.title}
//                     priority={task.priority}
//                     isOverdue
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
          
//           <div>
//             <div className="mb-2 flex items-center gap-2 text-sm font-medium">
//               <ListTodo className="h-4 w-4" />
//               Today ({data?.totalToday ?? 0})
//             </div>
//             <div className="space-y-1">
//               {data?.todayTasks.map(task => (
//                 <TaskItem
//                   key={task.id}
//                   title={task.title}
//                   priority={task.priority}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// } 