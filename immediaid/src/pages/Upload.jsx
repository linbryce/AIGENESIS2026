import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import UploadZone from '../components/upload/UploadZone';
import DataPreviewTable from '../components/upload/DataPreviewTable';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, UploadCloud, Shield } from 'lucide-react';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { columns: [], rows: [] };
  const columns = lines[0].split(',').map(c => c.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    columns.forEach((col, i) => { obj[col] = vals[i]?.trim() || ''; });
    return obj;
  });
  return { columns, rows };
}

export default function Upload() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const role = user?.role;
  const isInventoryManager = role === 'inventory_manager' || role === 'admin';
  const isOnsitePersonnel = role === 'onsite_personnel' || role === 'admin';

  const handleFileSelect = async (f) => {
    setFile(f);
    setStatus(null);
    setMessage('');
    setPreview(null);
    if (!f) return;
    const text = await f.text();
    setPreview(parseCSV(text));
  };

  const handleUpload = async () => {
    if (!file || !preview) return;
    setStatus('loading');

    const { rows, columns } = preview;
    const isWarehouseFile = columns.includes('warehouse_id') && columns.includes('food_units');
    const isDemandFile = columns.includes('location_id') && columns.includes('food_needed');

    if (!isWarehouseFile && !isDemandFile) {
      setStatus('error');
      setMessage('Unrecognized CSV format. Please upload a valid warehouse or demand point file.');
      return;
    }
    if (isWarehouseFile && !isInventoryManager) {
      setStatus('error');
      setMessage('You do not have permission to upload warehouse data.');
      return;
    }
    if (isDemandFile && !isOnsitePersonnel) {
      setStatus('error');
      setMessage('You do not have permission to upload demand point data.');
      return;
    }

    try {
      const Entity = isWarehouseFile ? base44.entities.Warehouse : base44.entities.DemandPoint;
      const mapped = rows.map(r => {
        const obj = {};
        Object.entries(r).forEach(([k, v]) => {
          obj[k] = isNaN(v) || v === '' ? v : Number(v);
        });
        return obj;
      });
      await Entity.bulkCreate(mapped);
      setStatus('success');
      setMessage(`Successfully uploaded ${rows.length} ${isWarehouseFile ? 'warehouse' : 'demand point'} records.`);
      setFile(null);
      setPreview(null);
    } catch (e) {
      setStatus('error');
      setMessage('Upload failed. Please check your file format and try again.');
    }
  };

  const allowedTypes = [];
  if (isInventoryManager) allowedTypes.push('Warehouse Inventory CSV');
  if (isOnsitePersonnel && !isInventoryManager) allowedTypes.push('Demand Points CSV');
  if (role === 'admin') allowedTypes.push('Demand Points CSV');

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Upload Data</h1>
          <p className="text-muted-foreground text-sm mt-1">Import CSV files to update logistics data</p>
        </div>

        {/* Role badge */}
        {user && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-semibold text-foreground capitalize">{user.full_name}</p>
              <p className="text-xs text-primary font-medium capitalize">{role?.replace('_', ' ') || 'User'}</p>
            </div>
          </div>
        )}

        {/* Allowed uploads info */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">You can upload</p>
          {allowedTypes.length > 0 ? (
            <ul className="space-y-1">
              {allowedTypes.map(t => (
                <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upload permissions assigned to your role.</p>
          )}
        </div>

        {/* Upload zone */}
        <UploadZone
          onFileSelect={handleFileSelect}
          label="Drop your CSV file here"
        />

        {/* Preview */}
        {preview && preview.rows.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <span className="text-xs text-muted-foreground">{preview.rows.length} rows · {preview.columns.length} columns</span>
            </div>
            <DataPreviewTable rows={preview.rows} columns={preview.columns} />
          </div>
        )}

        {/* Submit */}
        {file && preview && (
          <Button
            onClick={handleUpload}
            disabled={status === 'loading'}
            className="w-full mt-5 rounded-xl h-12 text-sm font-semibold"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><UploadCloud className="w-4 h-4 mr-2" /> Upload {preview.rows.length} Records</>
            )}
          </Button>
        )}

        {/* Status message */}
        {status === 'success' && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 font-medium">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}