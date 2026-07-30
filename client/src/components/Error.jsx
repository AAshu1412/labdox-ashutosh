import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <h1 className="text-8xl font-extrabold text-orange-600">404</h1>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-gray-500 text-sm max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition"
        >
          Return Home
        </Link>
        <Link
          to="/login"
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
