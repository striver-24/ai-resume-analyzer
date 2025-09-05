import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar"
import ResumeCard from "~/components/ResumeCard";
import Footer from "~/components/Footer";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StackResume.ai" },
    { name: "description", content: "Smart Feedback for your Dream Job!" },
  ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    // Home should be publicly viewable; do not force-redirect to /auth.
    // Users can still sign in from the Navbar and will be redirected back here.
    // Removed auth guard to allow showing sample content to signed-out users.
    useEffect(() => {
        // no-op
    },  []);

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            try {
                const items = (await kv.list('resume:*', true)) as KVItem[];
                const parsedResumes = (items || []).map((item) => {
                    try {
                        const v = (item as any).value;
                        if (!v) return null;
                        return typeof v === 'string' ? (JSON.parse(v) as Resume) : (v as Resume);
                    } catch (e) {
                        console.warn('Failed to parse resume item', item, e);
                        return null;
                    }
                }).filter(Boolean) as Resume[];
                console.log("parsedResumes", parsedResumes);
                setResumes(parsedResumes);
            } catch (e) {
                console.error('Failed to load resumes', e);
                setResumes([]);
            } finally {
                setLoadingResumes(false);
            }
        };
        loadResumes();
    }, []);

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />


      <section className="main-section">
          <div className="page-heading py-16">
              <h1>Crack your dream job using AI</h1>
              {!loadingResumes && resumes?.length === 0 ? (
                  <h2>No resumes found. Upload your resume to get feedback.</h2>
              ):(
                  <h2>Review your Submissions and check AI-Powered Feedback.</h2>
              )}
              <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                  Upload Resume
              </Link>
          </div>

          {loadingResumes && (
              <div className="flex flex-col items-center justify-center">
                  <img src="/images/resume-scan-2.gif" className="w-[200px]xs"/>
              </div>
          )}

          {!loadingResumes && resumes.length > 0 && (
              <div className="resumes-section">
                  {resumes.map((resume) => (
                      <ResumeCard key={resume.id} resume={resume} />
                  ))}
              </div>
          )}

          {!loadingResumes && resumes.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10 gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <img src="/images/resume_01.png" alt="Sample resume 1" className="rounded-xl shadow-sm max-w-[260px]"/>
                      <img src="/images/resume_02.png" alt="Sample resume 2" className="rounded-xl shadow-sm max-w-[260px]"/>
                      <img src="/images/resume_03.png" alt="Sample resume 3" className="rounded-xl shadow-sm max-w-[260px]"/>
                  </div>
              </div>
          )}
      </section>

      <Footer />
  </main>;
}
