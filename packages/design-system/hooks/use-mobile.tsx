'use client';

import { useMobileContext } from "../providers/mobile";

export function useIsMobile() {
  const { isMobile } = useMobileContext();
  return isMobile;
}
