import React, { useEffect, useRef } from 'react';

export default function PDFPage({ pdfDoc, pageNum, zoom }) {
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!pdfDoc) return;

        let isCancelled = false;
        
        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: zoom });
                
                const canvas = canvasRef.current;
                const textLayer = textLayerRef.current;
                const container = containerRef.current;
                
                if (!canvas || !textLayer || !container || isCancelled) return;
                
                // Set canvas dimensions
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                if (isCancelled) return;

                // Render text layer
                const textContent = await page.getTextContent();
                
                // The `renderTextLayer` utility function is from the pdf.js library
                window.pdfjsLib.renderTextLayer({
                    textContentSource: textContent,
                    container: textLayer,
                    viewport: viewport,
                    textDivs: []
                });
            } catch (error) {
                console.error(`Failed to render page ${pageNum}`, error);
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
        };
    }, [pdfDoc, pageNum, zoom]);

    return (
        <div ref={containerRef} className="pdf-page-container" data-page-number={pageNum}>
            <canvas ref={canvasRef}></canvas>
            <div ref={textLayerRef} className="textLayer"></div>
        </div>
    );
}