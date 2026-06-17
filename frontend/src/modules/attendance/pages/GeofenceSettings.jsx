import React, { useState, useEffect } from 'react';
import { geofenceService } from '../services/geofenceService';

export const GeofenceSettings = () => {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    geofenceService.fetchOfficeLocation().then(setConfig);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await geofenceService.updateGeofenceSettings(config);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Geofence Boundary Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5">Adjust operational coordinate locks and access validation parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Office Target Alias</label>
          <input
            type="text"
            value={config.officeName}
            onChange={e => setConfig({ ...config, officeName: e.target.value })}
            className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Latitude Pin</label>
            <input
              type="number"
              step="any"
              value={config.lat}
              onChange={e => setConfig({ ...config, lat: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs font-mono border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Longitude Pin</label>
            <input
              type="number"
              step="any"
              value={config.lng}
              onChange={e => setConfig({ ...config, lng: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs font-mono border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Security Threshold Envelope (Meters)</label>
          <input
            type="number"
            value={config.radius}
            onChange={e => setConfig({ ...config, radius: parseInt(e.target.value) || 0 })}
            className="w-full text-xs font-mono border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.99]"
          >
            {saving ? 'Committing Modifications...' : 'Apply Core Configuration Override'}
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold text-center">
            Perimeter updates successfully written to system storage.
          </div>
        )}
      </form>
    </div>
  );
};