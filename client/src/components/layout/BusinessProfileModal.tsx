import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Check, 
  Briefcase, 
  ShoppingBag, 
  Stethoscope, 
  UtensilsCrossed, 
  Car, 
  GraduationCap, 
  TrendingUp, 
  Laptop,
  Sparkles,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { Workspace, BusinessSectorId } from '../../types';
import { BUSINESS_SECTORS, ALL_SECTOR_KEYS } from '../../services/industryPacks';
import { workspaceApi } from '../../services/api';

interface BusinessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onSaveWorkspace: (updated: Partial<Workspace>) => void;
}

export const BusinessProfileModal: React.FC<BusinessProfileModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onSaveWorkspace,
}) => {
  const [selectedSector, setSelectedSector] = useState<Exclude<BusinessSectorId, 'ALL'>>(
    (workspace.industry as any) || 'EDUCATION'
  );
  const [businessName, setBusinessName] = useState(
    workspace.businessName || workspace.name || 'Prakash Institute Kota'
  );
  const [customerTerm, setCustomerTerm] = useState(
    workspace.customerTerm || BUSINESS_SECTORS[selectedSector]?.customerTermPlural || 'Customers'
  );

  if (!isOpen) return null;

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-rose-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-orange-600" />;
      case 'Car': return <Car className="w-5 h-5 text-blue-600" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-cyan-600" />;
      case 'Laptop': return <Laptop className="w-5 h-5 text-purple-600" />;
      case 'Tv': return <Tv className="w-5 h-5 text-pink-600" />;
      default: return <Briefcase className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleSelectSector = (sectorKey: Exclude<BusinessSectorId, 'ALL'>) => {
    setSelectedSector(sectorKey);
    const config = BUSINESS_SECTORS[sectorKey];
    if (config) {
      setCustomerTerm(config.customerTermPlural);
    }
  };

  const handleApplyPresetName = (name: string) => {
    setBusinessName(name);
  };

  const handleSave = async () => {
    const updatedSector = selectedSector;
    const nameToSave = businessName.trim() || 'My Business';
    const termToSave = customerTerm.trim() || 'Customers';

    try {
      await workspaceApi.updateIndustry(updatedSector, {
        businessName: nameToSave,
        customerTerm: termToSave,
      });
    } catch (e: any) {
      console.warn('Workspace industry API update notice:', e?.message);
    }

    onSaveWorkspace({
      name: nameToSave,
      businessName: nameToSave,
      industry: updatedSector,
      category: updatedSector,
      customerTerm: termToSave,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                Business Sector & Workspace Profile
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Multi-Industry
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Choose your business sector. Templates, customer terminology, and audience targeting will adapt automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 py-3 overflow-y-auto custom-scrollbar flex-1">
          {/* Business Name Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Business / Company Brand Name *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. LuxeCart Store, CarePoint Clinics, Skyline Realty"
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => handleApplyPresetName(BUSINESS_SECTORS[selectedSector].sampleBrandName)}
                className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold whitespace-nowrap border border-slate-200 cursor-pointer"
                title="Fill sample name for selected industry"
              >
                Sample Name
              </button>
            </div>
          </div>

          {/* Business Sector Grid (All 9 Market Sectors) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
              <span>Select Your Market Business Sector *</span>
              <span className="text-[10px] text-slate-400 font-normal">Equal support for all industries</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ALL_SECTOR_KEYS.map(key => {
                const config = BUSINESS_SECTORS[key];
                const isSelected = selectedSector === key;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectSector(key)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                        {getSectorIcon(config.iconName)}
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 font-['Outfit'] mt-1">
                        {config.shortName}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {config.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
                      Term: {config.customerTermPlural}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Terminology & Dynamic Adaptation Preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Audience Terminology & Tags
              </span>
              <span className="text-[10px] text-slate-500">
                Active: <strong className="text-indigo-600">{BUSINESS_SECTORS[selectedSector].label}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Audience Plural Term:</label>
                <input
                  type="text"
                  value={customerTerm}
                  onChange={e => setCustomerTerm(e.target.value)}
                  placeholder="e.g. Customers, Patients, Buyers, Students"
                  className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Recommended Industry Tags:</label>
                <div className="flex flex-wrap gap-1">
                  {BUSINESS_SECTORS[selectedSector].recommendedTags.slice(0, 4).map(t => (
                    <span key={t} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              AutoMask automatically personalizes Meta templates, interactive buttons, and broadcast audience filters for {BUSINESS_SECTORS[selectedSector].label}.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Apply Business Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
