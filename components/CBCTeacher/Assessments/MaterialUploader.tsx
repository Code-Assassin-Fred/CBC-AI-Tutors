'use client';

import React, { useCallback, useRef, useState } from 'react';
import { UploadedMaterial } from '@/types/assessment';

interface MaterialUploaderProps {
    materials: UploadedMaterial[];
    isUploading: boolean;
    uploadProgress: number;
    onUpload: (file: File) => Promise<UploadedMaterial | null>;
    onRemove: (materialId: string) => void;
    disabled?: boolean;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
    pdf: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L18.5 10H13V2.5zM6 20V4h5v7h7v9H6z" />
            <path d="M8.5 14.5v3h1v-1h.5a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1.5zm1 .75h.5v.5h-.5v-.5zm4-0.75v3h1.5a1.25 1.25 0 0 0 0-2.5h-.5v-.5h-1zm1 1.25h.5a.25.25 0 0 1 0 .5h-.5v-.5z" />
        </svg>
    ),
    doc: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L18.5 10H13V2.5zM6 20V4h5v7h7v9H6z" />
            <path d="M8 13h8v1H8v-1zm0 2h8v1H8v-1zm0 2h5v1H8v-1z" />
        </svg>
    ),
    ppt: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L18.5 10H13V2.5zM6 20V4h5v7h7v9H6z" />
            <rect x="8" y="12" width="8" height="6" rx="1" />
        </svg>
    ),
    txt: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L18.5 10H13V2.5zM6 20V4h5v7h7v9H6z" />
            <path d="M8 13h8v1H8v-1zm0 2h8v1H8v-1zm0 2h4v1H8v-1z" />
        </svg>
    ),
    other: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L18.5 10H13V2.5zM6 20V4h5v7h7v9H6z" />
        </svg>
    ),
};

const FILE_TYPE_COLORS: Record<string, string> = {
    pdf: 'text-red-400',
    doc: 'text-blue-400',
    ppt: 'text-orange-400',
    txt: 'text-gray-400',
    other: 'text-white/50',
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MaterialUploader({
    materials,
    isUploading,
    uploadProgress,
    onUpload,
    onRemove,
    disabled = false,
}: MaterialUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            await onUpload(files[i]);
        }
    }, [onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!disabled && !isUploading) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [disabled, isUploading, handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !isUploading) {
            setIsDragOver(true);
        }
    }, [disabled, isUploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                    ${isDragOver
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-white/20 hover:border-white/40 bg-[#0b0f12]'
                    }
                    ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={disabled || isUploading}
                />

                <div className="flex flex-col items-center gap-3">
                    {isUploading ? (
                        <>
                            <svg className="w-12 h-12 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div className="w-48">
                                <div className="text-white/60 text-sm mb-2">Uploading... {uploadProgress}%</div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="text-white/80 font-medium">
                                    Drop files here or <span className="text-cyan-400">browse</span>
                                </p>
                                <p className="text-white/40 text-sm mt-1">
                                    PDF, DOC, DOCX, PPT, PPTX, TXT (max 50MB)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Uploaded Files List */}
            {materials.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white/60">
                        Uploaded Materials ({materials.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {materials.map((material) => (
                            <div
                                key={material.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-black border border-white/10 group"
                            >
                                <div className={FILE_TYPE_COLORS[material.type] || FILE_TYPE_COLORS.other}>
                                    {FILE_TYPE_ICONS[material.type] || FILE_TYPE_ICONS.other}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/90 text-sm font-medium truncate">
                                        {material.name}
                                    </p>
                                    <p className="text-white/40 text-xs">
                                        {formatFileSize(material.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRemove(material.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    disabled={disabled}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
