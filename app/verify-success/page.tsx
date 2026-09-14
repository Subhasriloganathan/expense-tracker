export default function VerifySuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          ✅ Email Verified Successfully!
        </h1>

        <p className="mt-3">
          Your email has been verified successfully.
        </p>

        <a
          href="/login"
          className="inline-block mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}