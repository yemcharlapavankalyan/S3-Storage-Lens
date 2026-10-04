import React, { useState, useEffect } from 'react';
import { X, Plus, ShieldAlert, Sparkles } from 'lucide-react';
import { getBuckets } from '../../services/bucketService';
import { PolicyStatus, Bucket } from '../../types';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [availableBuckets, setAvailableBuckets] = useState<Bucket[]>([]);
  const [bucketLoadError, setBucketLoadError] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [bucket, setBucket] = useState('');
  const [prefix, setPrefix] = useState('/');
  const [targetClass, setTargetClass] = useState('STANDARD_IA');
  const [transitionDays, setTransitionDays] = useState('30');
  const [expirationDays, setExpirationDays] = useState('');
  const [status, setStatus] = useState<PolicyStatus>('Active');
  const [confirmedApply, setConfirmedApply] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const b = await getBuckets();
        if (b && b.length > 0) {
          setAvailableBuckets(b);
          setBucket(b[0].name);
          setBucketLoadError('');
        } else {
          setAvailableBuckets([]);
          setBucket('');
        }
      } catch (_) {
        setAvailableBuckets([]);
        setBucket('');
        setBucketLoadError('Bucket inventory is unavailable. Reconnect before creating a lifecycle rule.');
      }
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim() || !bucket) return;

    onSubmit({
      policyName: policyName.trim(),
      bucket,
      prefix: prefix.startsWith('/') ? prefix : `/${prefix}`,
      currentClass: 'STANDARD',
      targetClass,
      transitionDays: transitionDays ? parseInt(transitionDays, 10) : null,
      expirationDays: expirationDays ? parseInt(expirationDays, 10) : null,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Create S3 Lifecycle Policy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automate object transitions and expirations (Frontend prototype)
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Policy Name *
                </label>
                <input
                  type="text"
                  required
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Quarterly Analytics Archive"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Bucket *
                  </label>
                  <select
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {!availableBuckets.length && <option value="">{bucketLoadError || 'No buckets returned by AWS discovery'}</option>}
                    {availableBuckets.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prefix Filter *
                  </label>
                  <input
                    type="text"
                    required
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g., /reports/ or /"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transition Storage Class
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="STANDARD_IA">S3 Standard-IA</option>
                    <option value="INTELLIGENT_TIERING">S3 Intelligent-Tiering</option>
                    <option value="GLACIER">S3 Glacier Flexible</option>
                    <option value="DEEP_ARCHIVE">S3 Glacier Deep Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transition Timing (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={transitionDays}
                    onChange={(e) => setTransitionDays(e.target.value)}
                    placeholder="e.g. 30, 90"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expiration Timing (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    placeholder="Optional (e.g. 365)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PolicyStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Review">Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Warning Banner & Explicit Confirmation */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-start gap-2 text-amber-700">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="font-semibold block">Warning: Modifies Live AWS S3 Bucket</strong>
                    <span className="text-[11px] text-slate-600 leading-relaxed block mt-0.5">
                      Submitting this rule will execute a PutBucketLifecycleConfiguration API call against your real AWS account for bucket <strong>{bucket || 'selected bucket'}</strong>.
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 border-t border-amber-500/20 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={confirmedApply}
                    onChange={(e) => setConfirmedApply(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-[11px]">
                    I explicitly confirm applying this lifecycle rule to live AWS S3
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={!confirmedApply || !policyName.trim() || !bucket}
                className={`btn-primary !text-xs !py-2 !px-4 ${
                  !confirmedApply || !policyName.trim() || !bucket ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Apply Lifecycle Rule to AWS
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !text-xs !py-2 !px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
