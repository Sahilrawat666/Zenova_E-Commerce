import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email.");
      }

      setSubmitted(true);

      toast.success(data.message || "Password reset link sent to your email.");
    } catch (error) {
      console.error("Forgot password error:", error);

      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f0] px-6 py-16">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#81776e] transition-colors hover:text-[#b08d57]"
        >
          <FiArrowLeft size={16} />
          Back to Login
        </Link>

        {/* Card */}
        <div className="mt-8 border border-[#ddd5cc] bg-white p-7 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center bg-[#f8f5f0] text-[#b08d57]">
            <FiMail size={22} />
          </div>

          <p className="mt-7 text-xs uppercase tracking-[0.3em] text-[#b08d57]">
            Account Recovery
          </p>

          <h1 className="mt-3 text-3xl font-light tracking-tight text-[#302923]">
            Forgot Password?
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#81776e]">
            Enter the email address associated with your Zenova account and
            we'll send you a link to reset your password.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="email"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#81776e]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full border border-[#d8d0c8] bg-[#fdfcfb] px-4 py-3.5 text-sm text-[#302923] outline-none transition focus:border-[#b08d57]"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full bg-[#241c18] py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-[#b8afa7]"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="mt-8 border border-[#e5ddd4] bg-[#f8f5f0] p-5">
              <p className="text-sm leading-6 text-[#6f665e]">
                If an account exists for{" "}
                <span className="font-medium text-[#302923]">{email}</span>,
                we've sent a password reset link to that email address.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="mt-4 text-sm font-medium text-[#302923] transition-colors hover:text-[#b08d57]"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-7 border-t border-[#e5ddd4] pt-6 text-center">
            <p className="text-sm text-[#81776e]">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-[#302923] hover:text-[#b08d57]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#a49b92]">
          Secure account recovery · ZENOVA
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;
