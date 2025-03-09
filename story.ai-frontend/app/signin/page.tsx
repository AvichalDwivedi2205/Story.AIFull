import AuthForm from "@/components/AuthForm";

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        <div className="flex flex-col items-center justify-center h-screen">
        <AuthForm type="signin" />
        </div>
    </div>
  );
}