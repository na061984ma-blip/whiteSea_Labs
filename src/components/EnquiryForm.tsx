import React, { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import type { ApartmentVenture } from '../types/realEstate';

interface EnquiryFormProps {
  ventures: ApartmentVenture[];
  initialVentureId?: string;
  initialFlatNumber?: string;
  compact?: boolean;
  onSubmitted?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  ventures,
  initialVentureId = '',
  initialFlatNumber = '',
  compact = false,
  onSubmitted,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ventureId, setVentureId] = useState(initialVentureId);
  const [flatNumber, setFlatNumber] = useState(initialFlatNumber);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (initialVentureId) setVentureId(initialVentureId);
  }, [initialVentureId]);

  useEffect(() => {
    if (initialFlatNumber) {
      setFlatNumber(initialFlatNumber);
      setMessage((prev) =>
        prev.trim()
          ? prev
          : `I would like to schedule a site visit and request pricing & availability details for Flat ${initialFlatNumber}.`,
      );
    }
  }, [initialFlatNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please include a brief enquiry message.');
      return;
    }

    const selectedVenture = ventures.find((v) => v.id === ventureId);

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          ventureId: ventureId || undefined,
          ventureName: selectedVenture?.name,
          flatNumber: flatNumber.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to submit enquiry. Please review your details.');
      } else {
        setSuccessInfo(
          `Enquiry recorded for ${selectedVenture?.name ?? 'Meridian Estates'}${
            flatNumber ? ` · Flat ${flatNumber}` : ''
          }. Our property advisor will follow up shortly.`,
        );
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        if (!initialFlatNumber) setFlatNumber('');
        onSubmitted?.();
      }
    } catch {
      setError('Network error while submitting enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}
      {successInfo && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <span>{successInfo}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
        <div>
          <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Rao"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98490 00000"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">
            Apartment Venture
          </label>
          <select
            value={ventureId}
            onChange={(e) => setVentureId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
          >
            <option value="">General Advisory</option>
            {ventures.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">
            Flat Number (Optional)
          </label>
          <input
            type="text"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            placeholder="e.g. 201"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#1D2939]/80 mb-1.5">
          Enquiry &amp; Site Visit Notes
        </label>
        <textarea
          rows={compact ? 3 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your preferred BHK configuration, floor level, or preferred visit date..."
          required
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] text-sm text-[#1D2939] focus:outline-none focus:border-[#4A6B53]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] disabled:opacity-60 text-[#FAF8F4] text-sm font-medium transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'Submitting Enquiry...' : 'Submit Property Enquiry'}</span>
      </button>
    </form>
  );
};
