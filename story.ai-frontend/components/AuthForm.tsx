"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconBrandGoogle } from "@tabler/icons-react";

export default function AuthForm({ type }: { type: "signup" | "signin" }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoids mismatch between server and client renders

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`${type} form submitted`);
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-2xl p-8 shadow-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <h2 className="font-bold text-2xl text-white mb-2">
        {type === "signup" ? "Create an Account" : "Welcome Back"}
      </h2>
      <p className="text-slate-300 text-sm">
        {type === "signup"
          ? "Sign up to begin your journey with Story.ai."
          : "Sign in to continue your mindful experience."}
      </p>

      <form className="mt-6" onSubmit={handleSubmit}>
        {type === "signup" && (
          <>
            <LabelInputContainer>
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Your username"
                type="text"
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
              />
            </LabelInputContainer>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstname" className="text-slate-300">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  placeholder="First name"
                  type="text"
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname" className="text-slate-300">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  placeholder="Last name"
                  type="text"
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                />
              </LabelInputContainer>
            </div>
          </>
        )}

        {type === "signup" ? (
          <LabelInputContainer>
            <Label htmlFor="email" className="text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              required
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
            />
          </LabelInputContainer>
        ) : (
          <LabelInputContainer>
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              type="text"
              required
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
            />
          </LabelInputContainer>
        )}

        <LabelInputContainer>
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            required
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
          />
        </LabelInputContainer>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-4 rounded-md h-10 font-medium transition-colors"
          type="submit"
        >
          {type === "signup" ? "Create Account" : "Sign In"}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="px-3 text-slate-500 text-sm">or</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button
          className="flex items-center justify-center space-x-2 w-full border border-slate-700 rounded-md h-10 text-slate-300 hover:bg-slate-800/50 transition-colors"
          type="button"
        >
          <IconBrandGoogle className="h-5 w-5 text-blue-400" />
          <span className="text-sm">Continue with Google</span>
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col space-y-2 w-full mb-4">{children}</div>;
};