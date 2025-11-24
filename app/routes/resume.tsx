import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router";
import {useApiStore} from "~/lib/api";
import ATS from "~/components/ATS";
import MockInterview from "~/components/MockInterview";
import ImprovementsDropdown from "~/components/ImprovementsDropdown";
import ATSOptimizedResume from "~/components/ATSOptimizedResume";
// import CreateMarkdownResumeButton from "~/components/CreateMarkdownResumeButton"; // Temporarily disabled
import Footer from "~/components/Footer";

export const meta =() => ([
    { title: 'AI Resume Builder | Review'},
    {name: 'description', content: "Detailed overview of your Resume."},
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = useApiStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [jobTitle, setJobTitle] = useState<string>("");
    const [jobDescription, setJobDescription] = useState<string>("");
    const [resumePath, setResumePath] = useState<string>("");
    const [imagePath, setImagePath] = useState<string>("");
    const navigate = useNavigate();

    // Console log for developer credit
    useEffect(() => {
        console.log('%c Made by Deivyansh Singh ', 'background: #4F46E5; color: white; font-size: 16px; padding: 10px; border-radius: 5px; font-weight: bold;');
    }, []);

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            setJobTitle(data.jobTitle || "");
            setJobDescription(data.jobDescription || "");
            setResumePath(data.resumePath || "");
            setImagePath(data.imagePath || "");
            console.log({ resumeUrl, imageUrl, feedback: data.feedback, jobTitle: data.jobTitle, jobDescription: data.jobDescription });
        }

        loadResume();
    }, [id])


    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5"/>
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
                            <a href={resumeUrl} target="blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <div className="flex flex-col gap-4 mb-4">
                        <div>
                            <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                        </div>
                        {/* Create Resume Feature - Temporarily Disabled */}
                        {/* {feedback && id && resumePath && (
                            <div className="flex gap-2">
                                <CreateMarkdownResumeButton 
                                    resumeId={id} 
                                    resumePath={resumePath}
                                />
                                <Link 
                                    to="/editor/new"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Start Fresh Resume
                                </Link>
                            </div>
                        )} */}
                    </div>
                    {feedback ? (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-1000">
                            <ATS score={feedback.ATS.score || 0} />
                            
                            {/* ATS Optimized Resume Section */}
                            {id && resumePath && (
                                <ATSOptimizedResume 
                                    resumeId={id} 
                                    feedback={feedback}
                                    resumePath={resumePath}
                                />
                            )}
                            
                            <ImprovementsDropdown feedback={feedback} />
                            {feedback.mockInterview?.questions?.length ? (
                              <MockInterview questions={feedback.mockInterview.questions} jobTitle={jobTitle} />
                            ) : null}
                        </div>
                    ):(
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
            <Footer />
        </main>
    )
}

export default Resume;