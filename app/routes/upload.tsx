import { type FormEvent, useEffect, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import Footer from "~/components/Footer";
import {useApiStore} from "~/lib/api";
import {Link, useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = useApiStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [progressSteps, setProgressSteps] = useState<{
        step: string;
        status: 'pending' | 'processing' | 'completed' | 'error';
    }[]>([]);

    // Console log for developer credit
    useEffect(() => {
        console.log('%c Made by Deivyansh Singh ', 'background: #4F46E5; color: white; font-size: 16px; padding: 10px; border-radius: 5px; font-weight: bold;');
    }, []);

    // Require authentication for upload
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=' + encodeURIComponent('/upload'));
        }
    }, [auth.isAuthenticated, isLoading, navigate]);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setProgressSteps([
            { step: 'Converting PDF to image', status: 'pending' },
            { step: 'Uploading files', status: 'pending' },
            { step: 'Extracting text', status: 'pending' },
            { step: 'AI Analysis (parallel)', status: 'pending' },
            { step: 'Finalizing', status: 'pending' },
        ]);

        const updateStep = (stepIndex: number, status: 'processing' | 'completed' | 'error') => {
            setProgressSteps(prev => prev.map((s, i) => 
                i === stepIndex ? { ...s, status } : s
            ));
        };

        // Performance monitoring
        const startTime = performance.now();
        const timings: { [key: string]: number } = {};

        try {
            // Step 1: Convert PDF to image first (required for subsequent operations)
            updateStep(0, 'processing');
            setStatusText('Converting PDF to image...');
            const step1Start = performance.now();
            const imageFile = await convertPdfToImage(file);
            timings['pdf_conversion'] = performance.now() - step1Start;
            
            if(!imageFile.file) {
                updateStep(0, 'error');
                setIsProcessing(false);
                return setStatusText(`Error: Failed to convert PDF to image${imageFile.error ? ` – ${imageFile.error}` : ''}`);
            }
            updateStep(0, 'completed');

            // Step 2: Upload both files in parallel
            updateStep(1, 'processing');
            setStatusText('Uploading files in parallel (PDF + Image)...');
            const step2Start = performance.now();
            const [uploadedFile, uploadedImage] = await Promise.all([
                fs.upload([file]),
                fs.upload([imageFile.file])
            ]);
            timings['parallel_uploads'] = performance.now() - step2Start;

            if(!uploadedFile) {
                updateStep(1, 'error');
                setIsProcessing(false);
                return setStatusText('Error: Failed to upload PDF file');
            }
            if(!uploadedImage) {
                updateStep(1, 'error');
                setIsProcessing(false);
                return setStatusText('Error: Failed to upload image file');
            }
            updateStep(1, 'completed');

            // Step 3: Prepare initial data and extract text
            updateStep(2, 'processing');
            setStatusText('Preparing data & extracting text...');
            const step3Start = performance.now();
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }

            // Save initial data and extract text in parallel
            const [, resumeText] = await Promise.all([
                kv.set(`resume:${uuid}`, JSON.stringify(data)),
                ai.img2txt(uploadedImage.path)
            ]);
            timings['text_extraction'] = performance.now() - step3Start;

            if (!resumeText) {
                updateStep(2, 'error');
                setIsProcessing(false);
                return setStatusText('Error: Failed to extract text from resume');
            }
            updateStep(2, 'completed');

            // Step 4: Run analysis and markdown conversion in parallel
            updateStep(3, 'processing');
            setStatusText('Running AI analysis & markdown conversion in parallel...');
            const step4Start = performance.now();
            const [feedbackResponse, markdownText] = await Promise.all([
                ai.feedback(
                    resumeText,
                    prepareInstructions({ jobTitle, jobDescription })
                ),
                ai.convertToMarkdown(resumeText)
            ]);
            timings['parallel_ai_analysis'] = performance.now() - step4Start;

            if(!feedbackResponse) {
                updateStep(3, 'error');
                setIsProcessing(false);
                return setStatusText('Error: Failed to analyze resume');
            }
            updateStep(3, 'completed');

            // The feedback API returns { success: true, feedback: "..." }, not an AIResponse
            const feedbackText = typeof feedbackResponse === 'string' 
                ? feedbackResponse 
                : (feedbackResponse as any).feedback || JSON.stringify(feedbackResponse);

            // Store all results in parallel
            const storagePromises = [
                kv.set(`resume:${uuid}:text`, resumeText)
            ];
            
            if (markdownText) {
                storagePromises.push(kv.set(`resume:${uuid}:markdown`, markdownText));
            }
            
            await Promise.all(storagePromises);

            // Step 5: Parse and validate AI response
            updateStep(4, 'processing');
            setStatusText('Processing AI response...');

            // Safely parse LLM output which may include code fences or extra text
            const safeParseJSON = (raw: string): any | null => {
                if (!raw) {
                    console.error('safeParseJSON: Empty or null input');
                    return null;
                }
                
                let s = raw.trim();
                
                // Log original length for diagnostics
                console.log(`📝 AI Response length: ${raw.length} characters`);
                
                // Remove markdown code fences - handle various formats
                // Match: ```json\n ... \n``` or ```\n ... \n``` or ``` ... ```
                s = s.replace(/^```(?:json)?[\r\n]+/i, '');  // Remove opening fence with newline
                s = s.replace(/[\r\n]+```\s*$/i, '');        // Remove closing fence with newline
                s = s.replace(/^```(?:json)?\s*/i, '');      // Remove opening fence with space
                s = s.replace(/\s*```\s*$/i, '');            // Remove closing fence with space
                s = s.trim();
                
                // Find first JSON object or array via bracket matching
                const startIdx = (() => {
                    const obj = s.indexOf('{');
                    const arr = s.indexOf('[');
                    if (obj === -1) return arr;
                    if (arr === -1) return obj;
                    return Math.min(obj, arr);
                })();
                
                if (startIdx < 0) {
                    console.error('❌ No JSON object or array found');
                    console.error('Content preview:', s.substring(0, 300));
                    return null;
                }
                
                const openChar = s[startIdx];
                const closeChar = openChar === '{' ? '}' : ']';
                let depth = 0;
                let endIdx = -1;
                let inString = false;
                let escapeNext = false;
                
                for (let i = startIdx; i < s.length; i++) {
                    const ch = s[i];
                    
                    // Handle escape sequences
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (ch === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    // Handle strings
                    if (ch === '"') {
                        inString = !inString;
                        continue;
                    }
                    
                    // Only count brackets outside of strings
                    if (!inString) {
                        if (ch === openChar) depth++;
                        else if (ch === closeChar) depth--;
                        
                        if (depth === 0) {
                            endIdx = i + 1;
                            break;
                        }
                    }
                }
                
                if (endIdx === -1) {
                    console.error('❌ No matching closing bracket found');
                    console.error('📊 Debug info:', {
                        totalLength: s.length,
                        startIdx,
                        finalDepth: depth,
                        inString,
                        openChar,
                        closeChar
                    });
                    console.error('🔍 Content sample (first 1000 chars):');
                    console.error(s.substring(0, 1000));
                    console.error('🔍 Content sample (last 500 chars):');
                    console.error(s.substring(Math.max(0, s.length - 500)));
                    
                    // Try to recover: if response seems truncated, suggest retry
                    console.warn('⚠️ Response appears truncated or incomplete. This may be due to:');
                    console.warn('  - AI model output limit reached');
                    console.warn('  - Network interruption');
                    console.warn('  - Server timeout');
                    
                    return null;
                }
                
                const candidate = s.slice(startIdx, endIdx);
                console.log(`✅ Extracted JSON candidate (${candidate.length} chars)`);
                
                try {
                    const parsed = JSON.parse(candidate);
                    console.log('✅ JSON parsed successfully');
                    return parsed;
                } catch (e) {
                    console.error('❌ Failed to parse AI JSON');
                    console.error('Error:', e);
                    console.error('Candidate JSON (first 800 chars):');
                    console.error(candidate.substring(0, 800));
                    console.error('Candidate JSON (last 200 chars):');
                    console.error(candidate.substring(Math.max(0, candidate.length - 200)));
                    
                    // Try to identify common JSON errors
                    if (e instanceof SyntaxError) {
                        const msg = e.message;
                        if (msg.includes('Unexpected token')) {
                            console.error('💡 Hint: Check for unescaped characters or invalid syntax');
                        } else if (msg.includes('Unexpected end')) {
                            console.error('💡 Hint: JSON appears truncated - missing closing brackets');
                        }
                    }
                    
                    return null;
                }
            };

            const parsed = safeParseJSON(feedbackText);
            if (!parsed) {
                setStatusText('Error: Received malformed analysis from AI. Please try again.');
                // Preserve raw for debugging
                await kv.set(`resume:${uuid}:raw`, feedbackText);
                setIsProcessing(false);
                return;
            }

            // Step 6: Save final results and redirect
            data.feedback = parsed;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            updateStep(4, 'completed');
            
            // Calculate total time and log performance metrics
            const totalTime = performance.now() - startTime;
            timings['total'] = totalTime;
            console.log('📊 Performance Metrics:', {
                total: `${(totalTime / 1000).toFixed(2)}s`,
                breakdown: {
                    pdf_conversion: `${(timings.pdf_conversion / 1000).toFixed(2)}s`,
                    parallel_uploads: `${(timings.parallel_uploads / 1000).toFixed(2)}s`,
                    text_extraction: `${(timings.text_extraction / 1000).toFixed(2)}s`,
                    parallel_ai_analysis: `${(timings.parallel_ai_analysis / 1000).toFixed(2)}s`,
                }
            });
            
            setStatusText('Analysis Complete! Redirecting...');
            console.log(data);
            
            // Small delay to show completion before redirect
            setTimeout(() => navigate(`/resume/${uuid}`), 500);

        } catch (error) {
            console.error('Analysis error:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
            <Navbar />

            <section className="main-section flex-1">
                <div className="page-heading py-16">
                    <h1>AI Resume Analysis</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            
                            {/* Progress Steps */}
                            <div className="mt-8 mb-6 max-w-2xl mx-auto">
                                <div className="space-y-3">
                                    {progressSteps.map((step, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                                step.status === 'completed' ? 'bg-green-500 text-white' :
                                                step.status === 'processing' ? 'bg-blue-500 text-white animate-pulse' :
                                                step.status === 'error' ? 'bg-red-500 text-white' :
                                                'bg-gray-300 text-gray-600'
                                            }`}>
                                                {step.status === 'completed' ? '✓' :
                                                 step.status === 'error' ? '✗' :
                                                 index + 1}
                                            </div>
                                            <div className={`flex-1 text-left ${
                                                step.status === 'completed' ? 'text-green-600 font-medium' :
                                                step.status === 'processing' ? 'text-blue-600 font-semibold' :
                                                step.status === 'error' ? 'text-red-600 font-medium' :
                                                'text-gray-500'
                                            }`}>
                                                {step.step}
                                                {step.status === 'processing' && (
                                                    <span className="ml-2 inline-block">
                                                        <svg className="animate-spin h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <img src="/images/resume-scan.gif" className="w-full max-w-md mx-auto" />
                        </>
                    ) : (
                        <>
                            <h2>Upload your resume for instant ATS scoring and AI-powered feedback</h2>
                            <p className="text-gray-600 mt-2">
                                Want to create a new resume instead? <Link to="/editor/new" className="text-blue-600 hover:underline font-semibold">Use our Resume Editor →</Link>
                            </p>
                        </>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    )
}
export default Upload