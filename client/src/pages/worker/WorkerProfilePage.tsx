import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  HardHat,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Save,
  MapPin,
  IndianRupee,
  Briefcase,
  FileText,
  Upload,
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, t } = useLanguage();

  const [skills, setSkills] = useState<any[]>([]);
  const [primarySkillId, setPrimarySkillId] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [dailyWageMin, setDailyWageMin] = useState<number>(900);
  const [dailyWageMax, setDailyWageMax] = useState<number>(1200);
  const [locality, setLocality] = useState<string>('Kottakkal');
  const [district, setDistrict] = useState<string>('Malappuram');
  const [bio, setBio] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>(['Malayalam']);

  // Verification Form State
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [docType, setDocType] = useState<string>('AADHAAR');
  const [docNumber, setDocNumber] = useState<string>('');
  const [docUrl, setDocUrl] = useState<string>('https://example.com/docs/aadhaar_proof.pdf');

  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    api.get('/skills').then((res) => setSkills(res.data.data.skills));
    api.get('/workers/profile/me').then((res) => {
      const p = res.data.data.profile;
      if (p) {
        setPrimarySkillId(p.primarySkillId?._id || p.primarySkillId || '');
        setExperienceYears(p.experienceYears || 3);
        setDailyWageMin(p.dailyWageMin || 900);
        setDailyWageMax(p.dailyWageMax || 1200);
        setLocality(p.locality || 'Kottakkal');
        setDistrict(p.district || 'Malappuram');
        setBio(p.bio || '');
        if (p.languages?.length) setLanguages(p.languages);
      }
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.put('/workers/profile', {
        primarySkillId,
        experienceYears,
        dailyWageMin,
        dailyWageMax,
        locality,
        district,
        bio,
        languages,
      });

      setSuccessMsg('Profile updated successfully! / പ്രൊഫൈൽ സേവ് ചെയ്തു');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/verifications/submit', {
        documentType: docType,
        documentNumberMasked: docNumber,
        documentFileUrl: docUrl,
      });

      await refreshUser();
      setShowVerifyModal(false);
      setSuccessMsg('Verification document submitted. Admin will review within 24 hours.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit verification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              user?.verificationStatus === 'VERIFIED'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Identity Verification Status
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  user?.verificationStatus === 'VERIFIED'
                    ? 'bg-blue-100 text-blue-800'
                    : user?.verificationStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {user?.verificationStatus || 'NOT_VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.verificationStatus === 'VERIFIED'
                  ? 'Your profile proudly displays the Verified Worker badge ✓.'
                  : 'Submit Government ID proof (Aadhaar / Voter ID) for trust verification.'}
              </p>
            </div>
          </div>

          {user?.verificationStatus !== 'VERIFIED' && (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Submit ID Proof</span>
            </button>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Worker Skills &amp; Wage Details
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Primary Skill */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Trade / തൊഴിൽ *
              </label>
              <select
                required
                value={primarySkillId}
                onChange={(e) => setPrimarySkillId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select your main trade</option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.nameMl})
                  </option>
                ))}
              </select>
            </div>

            {/* Experience and Wage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Daily Wage (₹) *
                </label>
                <input
                  type="number"
                  min={100}
                  required
                  value={dailyWageMin}
                  onChange={(e) => setDailyWageMin(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maximum Daily Wage (₹) *
                </label>
                <input
                  type="number"
                  min={100}
                  required
                  value={dailyWageMax}
                  onChange={(e) => setDailyWageMax(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Locality / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kottakkal"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Malappuram">Malappuram (മലപ്പുറം)</option>
                  <option value="Kozhikode">Kozhikode (കോഴിക്കോട്)</option>
                  <option value="Palakkad">Palakkad (പാലക്കാട്)</option>
                  <option value="Thrissur">Thrissur (തൃശ്ശൂർ)</option>
                  <option value="Ernakulam">Ernakulam (എറണാകുളം)</option>
                </select>
              </div>
            </div>

            {/* Bio / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio &amp; Work Description
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 8 years experienced mason in residential house construction, compound wall plastering, and concrete work."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Worker Profile'}</span>
            </button>
          </form>
        </div>

        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Submit Government ID for Verification
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Your document number is masked and never exposed to the public.
              </p>

              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    <option value="AADHAAR">Aadhaar Card (ആധാർ കാർഡ്)</option>
                    <option value="VOTER_ID">Voter ID (തിരിച്ചറിയൽ കാർഡ്)</option>
                    <option value="DRIVING_LICENSE">Driving License (ഡ്രൈവിംഗ് ലൈസൻസ്)</option>
                    <option value="LABOUR_CARD">Kerala Labour Welfare Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Masked ID Number (e.g. XXXX-XXXX-1234)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="XXXX-XXXX-1234"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document File Reference URL
                  </label>
                  <input
                    type="text"
                    required
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="w-1/3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-2/3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                  >
                    Submit for Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
