import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface AvailabilityPillProps {
  status: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
  availableFor?: 'TODAY' | 'TOMORROW' | 'CUSTOM_DATE';
  customDate?: string | Date;
  size?: 'sm' | 'md' | 'lg';
}

export const AvailabilityPill: React.FC<AvailabilityPillProps> = ({
  status,
  availableFor = 'TODAY',
  size = 'md',
}) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  };

  if (status === 'AVAILABLE') {
    const text =
      availableFor === 'TODAY'
        ? language === 'ml'
          ? 'ഇന്ന് ലഭ്യമാണ്'
          : 'Available Today'
        : availableFor === 'TOMORROW'
        ? language === 'ml'
          ? 'നാളെ ലഭ്യമാണ്'
          : 'Available Tomorrow'
        : language === 'ml'
        ? 'ലഭ്യമാണ്'
        : 'Available';

    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{text}</span>
      </span>
    );
  }

  if (status === 'BUSY') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>{language === 'ml' ? 'പണിയിലാണ്' : 'Currently Busy'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses[size]}`}
    >
      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
      <span>{language === 'ml' ? 'ലഭ്യമല്ല' : 'Not Available'}</span>
    </span>
  );
};
