import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AvailabilityPill } from '../common/AvailabilityPill';
import { ShieldCheck, Star, MapPin, Briefcase, IndianRupee, ArrowRight } from 'lucide-react';

export interface WorkerCardProps {
  worker: {
    _id: string;
    workerId: string;
    fullName: string;
    maskedPhone?: string;
    avatarUrl?: string;
    primarySkill?: {
      _id: string;
      name: string;
      nameMl: string;
    };
    secondarySkills?: Array<{
      _id: string;
      name: string;
      nameMl: string;
    }>;
    experienceYears: number;
    dailyWageMin: number;
    dailyWageMax: number;
    locality: string;
    district: string;
    availability: {
      status: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
      availableFor: 'TODAY' | 'TOMORROW' | 'CUSTOM_DATE';
    };
    completedJobsCount: number;
    averageRating: number;
    totalReviews: number;
    verificationStatus?: string;
  };
  onRequestClick: (worker: WorkerCardProps['worker']) => void;
  onViewProfileClick?: (workerId: string) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onRequestClick,
  onViewProfileClick,
}) => {
  const { language, t } = useLanguage();

  const isVerified = worker.verificationStatus === 'VERIFIED';
  const skillName =
    language === 'ml' && worker.primarySkill?.nameMl
      ? worker.primarySkill.nameMl
      : worker.primarySkill?.name || 'General Worker';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Avatar, Name, Verification, Availability */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
              {worker.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition">
                  {worker.fullName}
                </h3>
                {isVerified && (
                  <span
                    title="Government ID Verified"
                    className="inline-flex items-center text-blue-600"
                  >
                    <ShieldCheck className="w-4 h-4 fill-blue-50 text-blue-600" />
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-brand-600">
                {skillName}
              </p>
            </div>
          </div>
          <AvailabilityPill
            status={worker.availability.status}
            availableFor={worker.availability.availableFor}
            size="sm"
          />
        </div>

        {/* Rating and Experience Summary */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 py-2 border-y border-slate-100 my-3">
          <div className="flex items-center space-x-1 font-bold text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}</span>
            <span className="text-slate-400 font-normal">({worker.totalReviews})</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{worker.experienceYears} {t('years')}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="font-semibold text-slate-800">{worker.completedJobsCount}</span>{' '}
            <span>jobs</span>
          </div>
        </div>

        {/* Wage Range & Locality */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('dailyWage')}:</span>
            <span className="font-bold text-slate-900 text-sm flex items-center">
              ₹{worker.dailyWageMin} - ₹{worker.dailyWageMax}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Within 5 km of {worker.locality}, {worker.district}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onViewProfileClick && onViewProfileClick(worker.workerId)}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition text-center"
        >
          View Profile
        </button>
        <button
          onClick={() => onRequestClick(worker)}
          disabled={worker.availability.status === 'NOT_AVAILABLE'}
          className={`w-full py-2 px-3 text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1 ${
            worker.availability.status === 'NOT_AVAILABLE'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
          }`}
        >
          <span>{t('requestWorker')}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
