// 'use client';

// import { createContext, useContext } from 'react';

// type TenantContextType = {
//   organizationId: string | null; // Allow null for now
//   projectId: string | null;      // Allow null for now
//   // Other tenant-specific info
// }

// const TenantContext = createContext<TenantContextType | null>(null);

// function useTenantInfo(): TenantContextType {
//   // In a real app, this would fetch tenant info, e.g., from an API
//   // For now, return placeholder values
//   return {
//     organizationId: 'PLACEHOLDER_ORG_ID',
//     projectId: 'PLACEHOLDER_PROJECT_ID',
//   };
// }

// export function TenantProvider({ children }) {
//   // Get tenant info from session/api
//   const tenantInfo = useTenantInfo();

//   return (
//     <TenantContext.Provider value={tenantInfo}>
//       {children}
//     </TenantContext.Provider>
//   );
// }

// // Hook for components to access tenant info
// export function useTenant() {
//   const context = useContext(TenantContext);
//   if (!context) {
//     throw new Error('useTenant must be used within TenantProvider');
//   }
//   return context;
// } 