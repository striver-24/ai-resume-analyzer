import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar"
import Footer from "~/components/Footer";
import {Link} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StackResume.ai" },
    { name: "description", content: "Smart Feedback for your Dream Job!" },
  ];
}

export default function Home() {
    return <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
      <Navbar />
      <section className="main-section flex-1">
          <div className="page-heading py-16 text-center">
              <h1>Crack your dream job using AI</h1>
              <h2>Upload your resume to get ATS insights and improvement tips.</h2>
              <div className="flex items-center justify-center">
                <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                    Upload Resume
                </Link>
              </div>
          </div>
          <div className="flex flex-col items-center justify-center mt-6 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[860px] px-4">
                  <img src="/images/resume_01.png" alt="Sample resume 1" className="rounded-xl shadow-sm w-full max-w-[500px]"/>
                  <img src="/images/resume_02.png" alt="Sample resume 2" className="rounded-xl shadow-sm w-full max-w-[500px]"/>
                  <img src="/images/resume_03.png" alt="Sample resume 3" className="rounded-xl shadow-sm w-full max-w-[500px]"/>
              </div>
          </div>
      </section>
      <Footer />
  </main>;
}
