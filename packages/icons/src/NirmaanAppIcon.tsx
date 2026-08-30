import React from 'react';
import { NirmaanIcon } from './NirmaanIcon';

export interface NirmaanAppIconProps {
  size?: number;
}

export const NirmaanAppIcon: React.FC<NirmaanAppIconProps> = ({ size = 64 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-2xl bg-gradient-to-br from-[#0F111A] via-[#161926] to-[#090A0F] p-[2px] shadow-xl ring-1 ring-white/10 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#635BFF]/20 via-transparent to-[#22D3EE]/20" />
      <NirmaanIcon size={size * 0.65} variant="gradient" />
    </div>
  );
};
