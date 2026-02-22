
import React, { useState, useEffect, useRef } from 'react';
import { Document, DocumentView } from '@/api/entities';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { Loader2, Mail, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce'; // Added import

export default function DocumentPublicView() {
    const [doc, setDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGate, setShowGate] = useState(false);
    const [viewerEmail, setViewerEmail] = useState('');
    const [viewerName, setViewerName] = useState('');
    const viewIdRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const sessionDurationRef = useRef(0); // Added state

    // Added debounced callback for updating the current page view
    const updateCurrentPage = useDebouncedCallback(async (pageNumber) => {
        if (viewIdRef.current) {
            try {
                await DocumentView.update(viewIdRef.current, { currently_viewing_page_number: pageNumber });
            } catch (err) {
                console.error("Failed to update current page:", err);
            }
        }
    }, 500); // Debounce for 500ms to avoid excessive updates

    // Added function to end the viewing session and update its duration
    const endViewingSession = async () => {
        if (viewIdRef.current) {
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
            sessionDurationRef.current = duration; // Store duration for potential future use or logging
            try {
                await DocumentView.update(viewIdRef.current, { 
                    is_currently_viewing: false,
                    session_duration_seconds: duration,
                    currently_viewing_page_number: null, // Reset current page when session ends
                });
                viewIdRef.current = null; // Prevent multiple updates for the same session
            } catch (err) {
                // This might fail if the browser is closing, so we just log the error
                console.error("Error ending view session:", err);
            }
        }
    };

    useEffect(() => {
        const fetchDocument = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const publicId = urlParams.get('id');
            const emailFromUrl = urlParams.get('email');

            if (!publicId) {
                setError('No document ID provided.');
                setIsLoading(false);
                return;
            }

            try {
                const results = await Document.filter({ public_id: publicId });
                if (results.length === 0) {
                    setError('Document not found.');
                } else {
                    const documentData = results[0];
                    setDoc(documentData);
                    
                    // Logic updated: If no email in URL and document requires email, show gate.
                    // Otherwise, start session, using 'anonymous@example.com' if no email is provided.
                    if (!emailFromUrl && documentData.require_email) {
                        setShowGate(true);
                    } else {
                        await startViewingSession(documentData, emailFromUrl || 'anonymous@example.com');
                    }
                }
            } catch (err) {
                setError('Failed to load document.');
                console.error(err);
            }
            setIsLoading(false);
        };

        fetchDocument();

        // Use 'pagehide' for better reliability on mobile and modern browsers for ending sessions
        window.addEventListener('pagehide', endViewingSession);

        return () => {
            window.removeEventListener('pagehide', endViewingSession);
            // Ensure session is ended on component unmount (e.g., navigating away in a SPA)
            endViewingSession(); 
        };
    }, []);

    const startViewingSession = async (documentData, email, name = '') => {
        // Ensure we have an email before proceeding (anonymous email is also considered valid here)
        if (!email) {
            toast.error("Cannot start viewing session without an email address.");
            setShowGate(true); // Re-show the gate if something went wrong
            return;
        }

        try {
            setShowGate(false);
            // Only set viewerEmail state if it's not the anonymous placeholder, otherwise clear it.
            if (email !== 'anonymous@example.com') {
                setViewerEmail(email);
            } else {
                setViewerEmail(''); // Clear viewerEmail state if we're proceeding anonymously
            }
            setViewerName(name); // Set viewerName state, it will be empty if not provided

            const { id } = await DocumentView.create({
                document_id: documentData.id,
                document_details: {
                    document_name: documentData.document_name,
                    created_by: documentData.created_by,
                },
                viewer_email: email, // This is the actual email to log (can be anonymous)
                viewer_name: name || 'Unnamed Viewer', // Use provided name or default to 'Unnamed Viewer'
                is_currently_viewing: true,
            });
            viewIdRef.current = id;
            startTimeRef.current = Date.now();
            console.log(`Started viewing session ${id} for ${email}`);
        } catch (err) {
            toast.error("Could not log your view. Please try again.");
            console.error("Failed to start session:", err);
            // If session failed and email was required, potentially re-show the gate
            if (documentData.require_email && (email === '' || email === 'anonymous@example.com')) {
                 setShowGate(true); 
            }
        }
    };
    
    const handleGateSubmit = (e) => {
        e.preventDefault();
        if (doc && viewerEmail) {
            startViewingSession(doc, viewerEmail, viewerName);
        } else {
            toast.error("Please enter your email address to continue.");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {isLoading && (
                <div className="h-screen w-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            )}
            
            {error && !isLoading && (
                <div className="h-screen w-full flex items-center justify-center text-red-500 font-semibold">
                    {error}
                </div>
            )}

            {showGate && !isLoading && !error && doc && (
                <div className="h-screen w-full flex items-center justify-center bg-slate-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold text-center mb-2">Access Document</h2>
                        <p className="text-center text-slate-600 mb-6">Please enter your details to view "{doc.document_name}"</p>
                        <form onSubmit={handleGateSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="viewer-name" className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        id="viewer-name"
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={viewerName} 
                                        onChange={(e) => setViewerName(e.target.value)} 
                                        className="pl-9" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="viewer-email" className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        id="viewer-email"
                                        type="email" 
                                        placeholder="you@company.com" 
                                        value={viewerEmail} 
                                        onChange={(e) => setViewerEmail(e.target.value)} 
                                        className="pl-9" 
                                        required 
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Continue to Document</Button>
                        </form>
                    </div>
                </div>
            )}
            
            {doc && !showGate && !isLoading && (
                <DocumentViewer 
                    fileUrl={doc.file_url} // Changed prop from 'document' to 'fileUrl'
                    onPageChange={updateCurrentPage} 
                />
            )}
        </div>
    );
}
