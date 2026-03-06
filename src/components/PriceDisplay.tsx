"use client";

import { useConfig } from "@/context/ConfigContext";

interface PriceDisplayProps {
  priceInOMR: number;
  className?: string;
  showCurrency?: boolean;
}

export default function PriceDisplay({ priceInOMR, className = "", showCurrency = true }: PriceDisplayProps) {
  const { convertPrice, getCurrencySymbol } = useConfig();
  
  const convertedPrice = convertPrice(priceInOMR);
  
  return (
    <span className={className}>
      {showCurrency && <span className="ml-1 text-sm text-gray-400">{getCurrencySymbol()}</span>}
      <span>{convertedPrice.toLocaleString('ar-SA')}</span>
    </span>
  );
}
