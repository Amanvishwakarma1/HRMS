import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

function ReceiptUpload({ onUploadSuccess, onUploadClear, existingReceiptId = null }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptId, setReceiptId] = useState(existingReceiptId);
  const [fileUrl, setFileUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size (< 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size allowed is 10MB.');
      return;
    }

    // Validate type (PDF, PNG, JPG, JPEG)
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      setError('Invalid file format. Only PDF, PNG, JPG, and JPEG are supported.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setLoading(true);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const response = await axios.post('/api/expenses/upload', {
          filename: selectedFile.name,
          base64Data: base64Data,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        });

        if (response.data.success) {
          const uploadedReceipt = response.data.data;
          setReceiptId(uploadedReceipt.id);
          setFileUrl(uploadedReceipt.fileUrl);
          onUploadSuccess(uploadedReceipt.id);
        } else {
          setError(response.data.message || 'Upload failed.');
        }
      } catch (err) {
        console.error('Receipt upload error:', err);
        setError(err.response?.data?.message || 'Failed to upload receipt to server.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleClear = async () => {
    if (receiptId) {
      try {
        await axios.delete(`/api/expenses/receipt/${receiptId}`);
      } catch (err) {
        console.error('Failed to delete receipt from server:', err);
      }
    }
    setFile(null);
    setReceiptId(null);
    setFileUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadClear();
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-700">Receipt Attachment</label>
      
      {!file && !receiptId && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/30 hover:bg-sky-50/50 transition-all duration-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group"
        >
          <Upload className="w-8 h-8 text-sky-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-medium text-slate-600">Click to upload receipt</span>
          <span className="text-xs text-slate-400">PDF, PNG, JPG, or JPEG up to 10MB</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>
      )}

      {loading && (
        <div className="border border-sky-100 bg-sky-50/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file?.name}</span>
              <span className="text-xs text-slate-400">Uploading to server...</span>
            </div>
          </div>
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && receiptId && (
        <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{file?.name || 'receipt_attached'}</span>
              <a 
                href={`${import.meta.env.VITE_ENVIRONMENT === 'production' ? '' : 'http://localhost:5000'}${fileUrl}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-sky-600 hover:text-sky-800 hover:underline font-medium"
              >
                View uploaded receipt
              </a>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ReceiptUpload;