import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      toast.success(data.message || "Password reset successfully.");

      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);

      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f0] px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#81776e] transition-colors hover:text-[#b08d57]"
        >
          <FiArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="mt-8 border border-[#ddd5cc] bg-white p-7 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center bg-[#f8f5f0] text-[#b08d57]">
            <FiLock size={21} />
          </div>

          <p className="mt-7 text-xs uppercase tracking-[0.3em] text-[#b08d57]">
            Account Security
          </p>

          <h1 className="mt-3 text-3xl font-light tracking-tight text-[#302923]">
            Reset Password
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#81776e]">
            Create a new password for your Zenova account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#81776e]"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full border border-[#d8d0c8] bg-[#fdfcfb] px-4 py-3.5 text-sm text-[#302923] outline-none transition focus:border-[#b08d57]"
              />
            </div>

            {/* Confirm Password */}
            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#81776e]"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full border border-[#d8d0c8] bg-[#fdfcfb] px-4 py-3.5 text-sm text-[#302923] outline-none transition focus:border-[#b08d57]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-[#241c18] py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-[#b8afa7]"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e5ddd4] pt-6 text-center">
            <p className="text-sm text-[#81776e]">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-[#302923] transition-colors hover:text-[#b08d57]"
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

export default ResetPassword;
