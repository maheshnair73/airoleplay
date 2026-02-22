
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UploadCloud, Bot, Loader2, FileText, FileQuestion, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { InvokeLLM, UploadFile } from '@/api/integrations';
import { toast } from 'sonner';
import { Document } from '@/api/entities';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RFPAnalysisSchema = {
    type: "object",
    properties: {
        key_requirements: { type: "array", items: { type: "string" }, description: "List the top 5-7 most critical requirements from the RFP." },
        evaluation_criteria: { type: "array", items: { type: "string" }, description: "Identify the criteria the client will use to judge the response." },
        red_flags: { type: "array", items: { type: "string" }, description: "List any potential risks, unclear requirements, or competitive disadvantages." },
        suggested_win_themes: { type: "array", items: { "type": "string" }, description: "Suggest 2-3 key themes or value propositions to emphasize in the response." }
    },
    required: ["key_requirements", "evaluation_criteria", "red_flags", "suggested_win_themes"]
};

const RFPResponseSchema = {
    type: "object",
    properties: {
        executive_summary: { type: "string", description: "A compelling executive summary for the proposal." },
        detailed_responses: { type: "array", items: { type: "object", properties: { requirement: { type: "string" }, response: { type: "string" } } }, description: "A section-by-section response addressing the key requirements." }
    },
    required: ["executive_summary", "detailed_responses"]
};

export default function RFPAssistant() {
    const [file, setFile] = useState(null);
    const [rfpText, setRfpText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file && !rfpText) {
            toast.error("Please upload a file or paste RFP text.");
            return;
        }

        setIsLoading(true);
        setAnalysis(null);
        setResponse(null);

        try {
            let context = rfpText;
            if (file) {
                toast.info("Uploading file...");
                const { file_url } = await UploadFile({ file });
                toast.success("File uploaded. Analyzing...");
                if (!context) {
                     toast.warning("File content extraction is not supported for analysis. Please paste the text from the document. The analysis will proceed based on the file name only.");
                     context = `RFP Document Name: ${file.name}`;
                }
            }

            const analysisPrompt = `Analyze the following RFP content and provide a structured analysis. Content: """${context}"""`;
            const analysisResult = await InvokeLLM({ prompt: analysisPrompt, response_json_schema: RFPAnalysisSchema });
            setAnalysis(analysisResult);
            toast.success("Analysis complete!");

            toast.info("Generating draft response...");
            const responsePrompt = `Based on the following RFP analysis, generate a compelling draft response. Analysis: ${JSON.stringify(analysisResult)}`;
            const responseResult = await InvokeLLM({ prompt: responsePrompt, response_json_schema: RFPResponseSchema });
            setResponse(responseResult);
            toast.success("Draft response generated!");

        } catch (error) {
            console.error("Error during RFP processing:", error);
            toast.error("An error occurred.", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveToEffyDoc = async () => {
        if (!response) {
            toast.error("No response generated to save.");
            return;
        }
        
        setIsSaving(true);
        toast.info("Saving to effyDoc...");

        try {
            let editorContent = `<h1>Executive Summary</h1><p>${response.executive_summary}</p>`;
            editorContent += `<h2>Detailed Responses</h2>`;
            response.detailed_responses.forEach(item => {
                editorContent += `<h3>${item.requirement}</h3><p>${item.response}</p>`;
            });

            const newDocPayload = {
                document_name: `RFP Response for ${file?.name || 'Pasted Text'}`,
                document_type: 'rfp_response',
                content_type: 'rich_text',
                editor_content: editorContent,
                status: 'draft',
            };

            const savedDocument = await Document.create(newDocPayload);
            toast.success("Saved to effyDoc successfully!");
            
            navigate(createPageUrl('CreateDocument', { id: savedDocument.id }));

        } catch (error) {
            console.error("Failed to save to effyDoc:", error);
            toast.error("Failed to save document.", { description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-full">
            {/* Back Button */}
            <div className="mb-4">
                <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                    <Bot className="w-8 h-8 text-blue-600" />
                    AI RFP Assistant
                </h1>
                <p className="text-lg text-slate-500 mt-2">Automate RFP analysis and accelerate your response drafting process.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileQuestion className="w-6 h-6 text-blue-500" />RFP Input</CardTitle>
                        <CardDescription>Upload your RFP document or paste the text content below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <label htmlFor="file-upload" className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors block border-slate-300 hover:border-blue-400">
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileChange} 
                                accept=".pdf,.txt,.doc,.docx"
                            />
                            <UploadCloud className="mx-auto w-12 h-12 text-slate-400 mb-2" />
                            {file ? (
                                <p className="text-slate-700">{file.name}</p>
                            ) : (
                                <p className="text-slate-500">Click to select a file or drag & drop</p>
                            )}
                        </label>
                        <div className="flex items-center gap-4">
                            <hr className="flex-grow" />
                            <span className="text-slate-500 text-sm">OR</span>
                            <hr className="flex-grow" />
                        </div>
                        <Textarea
                            placeholder="Paste the full text of your RFP here..."
                            rows={10}
                            value={rfpText}
                            onChange={(e) => setRfpText(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" />Analyze RFP</>}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Output Section */}
                <div className="space-y-8">
                    {isLoading && !analysis && (
                        <Card className="flex items-center justify-center p-8 shadow-lg">
                             <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-4" />
                             <p className="text-slate-600 text-lg">AI is working its magic...</p>
                        </Card>
                    )}
                    {analysis && (
                        <Card className="shadow-lg animate-in fade-in-50">
                            <CardHeader>
                                <CardTitle>AI Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-slate-700">Key Requirements</h4>
                                    <ul className="list-disc list-inside text-slate-600">
                                        {analysis.key_requirements.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-700">Win Themes</h4>
                                    <ul className="list-disc list-inside text-slate-600">
                                        {analysis.suggested_win_themes.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-700 text-red-600">Red Flags</h4>
                                    <ul className="list-disc list-inside text-red-500">
                                        {analysis.red_flags.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {response && (
                        <Card className="shadow-lg animate-in fade-in-50">
                            <CardHeader>
                                <CardTitle>Generated Response Draft</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <h3>Executive Summary</h3>
                                    <p>{response.executive_summary}</p>
                                    <h3>Detailed Responses</h3>
                                    {response.detailed_responses.map((item, i) => (
                                        <div key={i}>
                                            <h4>{item.requirement}</h4>
                                            <p>{item.response}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveToEffyDoc} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700">
                                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" />Save to effyDoc</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
