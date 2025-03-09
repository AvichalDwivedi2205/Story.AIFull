"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconBrandGoogle } from "@tabler/icons-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }: { type: "signup" | "signin" }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const checkUsernameUnique = async (username: string) => {
    const usernameRef = doc(db, "usernames", username.toLowerCase());
    const usernameSnap = await getDoc(usernameRef);
    return !usernameSnap.exists();
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === "signup") {
        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error("Password must be at least 8 characters with a letter, number, and special character");
        }

        // Check email existence
        const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
        if (signInMethods.length > 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        // Check username uniqueness
        const isUsernameUnique = await checkUsernameUnique(formData.username);
        if (!isUsernameUnique) {
          throw new Error("Username is already taken. Please choose another.");
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Store user data
        await Promise.all([
          setDoc(doc(db, "users", userCredential.user.uid), {
            username: formData.username.toLowerCase(),
            firstName: formData.firstname,
            lastName: formData.lastname || "",
            email: formData.email,
            createdAt: new Date().toISOString(),
            authProvider: "email"
          }),
          setDoc(doc(db, "usernames", formData.username.toLowerCase()), {
            userId: userCredential.user.uid
          })
        ]);

        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        // Handle sign in with email or username
        let email = formData.email;
        if (!formData.email.includes("@")) {
          const usernameDoc = await getDoc(doc(db, "usernames", formData.email.toLowerCase()));
          if (!usernameDoc.exists()) throw new Error("Invalid username or password");
          const userDoc = await getDoc(doc(db, "users", usernameDoc.data().userId));
          email = userDoc.data()?.email;
        }

        await signInWithEmailAndPassword(auth, email, formData.password);
        setSuccess("Signed in successfully! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(error.message || "An error occurred during authentication");
      if (error.message.includes("already registered")) {
        setTimeout(() => router.push("/signin"), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if email already exists with different provider
      const signInMethods = await fetchSignInMethodsForEmail(auth, user.email!);
      if (signInMethods.length > 0 && !signInMethods.includes("google.com")) {
        throw new Error("This email is already registered with a different provider");
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Generate unique username
        let baseUsername = user.displayName?.replace(/\s+/g, "").toLowerCase() || 
                          user.email?.split("@")[0].replace(/[^a-z0-9]/g, "") || 
                          "user";
        let username = baseUsername;
        let suffix = 1;

        while (true) {
          const usernameExists = await checkUsernameUnique(username);
          if (usernameExists) break;
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        // Store user data
        await Promise.all([
          setDoc(doc(db, "users", user.uid), {
            username: username,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
            email: user.email,
            createdAt: new Date().toISOString(),
            authProvider: "google",
            photoURL: user.photoURL
          }),
          setDoc(doc(db, "usernames", username), {
            userId: user.uid
          })
        ]);
      }

      setSuccess("Authentication successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error: any) {
      console.error("Google auth error:", error);
      setError(error.message || "An error occurred during Google authentication");
    } finally {
      setIsLoading(false);
    }
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

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md mt-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-md mt-4 text-sm">
          {success}
        </div>
      )}

      <form className="mt-6" onSubmit={handleEmailAuth}>
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
                value={formData.username}
                onChange={handleChange}
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                disabled={isLoading}
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
                  value={formData.firstname}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                  disabled={isLoading}
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
                  value={formData.lastname}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                  disabled={isLoading}
                />
              </LabelInputContainer>
            </div>
          </>
        )}

        <LabelInputContainer>
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
            disabled={isLoading}
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
            disabled={isLoading}
          />
        </LabelInputContainer>

        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white w-full mt-4 rounded-md h-10 font-medium transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : type === "signup"
            ? "Create Account"
            : "Sign In"}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="px-3 text-slate-500 text-sm">or</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button
          className={`flex items-center justify-center space-x-2 w-full border border-slate-700 rounded-md h-10 text-slate-300 hover:bg-slate-800/50 transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <IconBrandGoogle className="h-5 w-5 text-blue-400" />
          <span className="text-sm">Continue with Google</span>
        </button>

        <p className="text-sm text-slate-400 mt-6 text-center">
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <a href="/signin" className="text-blue-400 hover:underline">
                Sign In
              </a>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-400 hover:underline">
                Sign Up
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col space-y-2 w-full mb-4">{children}</div>;
};