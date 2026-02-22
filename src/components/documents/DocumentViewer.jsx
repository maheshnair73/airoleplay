import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function DocumentViewer({ fileUrl, onPageChange }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const containerRef = useRef(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }
    
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newScale = (containerWidth - 40) / 800;
                setScale(Math.min(Math.max(newScale, 0.5), 2));
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (onPageChange) {
            onPageChange(pageNumber);
        }
    }, [pageNumber, onPageChange]);

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

    const zoomIn = () => setScale(s => Math.min(s + 0.1, 3));
    const zoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col items-center bg-slate-200 overflow-auto py-8">
            <div className="sticky top-2 z-10 bg-slate-800 text-white rounded-full shadow-lg p-2 flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium">
                    Page {pageNumber} of {numPages || '...'}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                    <ChevronRight className="w-5 h-5" />
                </Button>
                <div className="w-px h-6 bg-slate-600 mx-2"></div>
                <Button variant="ghost" size="icon" onClick={zoomOut}>
                    <ZoomOut className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                <Button variant="ghost" size="icon" onClick={zoomIn}>
                    <ZoomIn className="w-5 h-5" />
                </Button>
            </div>
            
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="flex flex-col items-center justify-center p-8 text-slate-600">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="mt-4">Loading document...</p>
                    </div>
                }
                error={
                    <div className="flex flex-col items-center justify-center p-8 text-red-500">
                        <p>Failed to load PDF file.</p>
                    </div>
                }
                className="pdf-document"
            >
                <Page
                    key={`page_${pageNumber}`}
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    className="pdf-page relative shadow-xl"
                    loading={
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    }
                />
            </Document>
        </div>
    );
}