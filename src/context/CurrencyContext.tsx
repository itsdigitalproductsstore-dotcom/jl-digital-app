"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "OMR" | "SAR" | "USD" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInOMR: number) => number;
  getCurrencySymbol: () => string;
}

const exchangeRates: Record<Currency, number> = {
  OMR: 1,
  SAR: 9.75,
  USD: 2.6,
  AED: 9.75,
};

const currencySymbols: Record<Currency, string> = {
  OMR: "ر.ع",
  SAR: "ر.س",
  USD: "$",
  AED: "د.إ",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("OMR");

  useEffect(() => {
    const saved = localStorage.getItem("jl-currency") as Currency;
    if (saved && exchangeRates[saved]) {
      setCurrency(saved);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("jl-currency", newCurrency);
  };

  const convertPrice = (priceInOMR: number): number => {
    return Math.round(priceInOMR * exchangeRates[currency]);
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency];
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        convertPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}

export const currencies: { code: Currency; name: string; symbol: string }[] = [
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
];
