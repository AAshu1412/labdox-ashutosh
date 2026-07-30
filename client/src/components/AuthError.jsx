import { useSearchParams, Link } from "react-router-dom";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("error");

  const getErrorMessage = () => {
    switch (errorType) {
      case "access_denied":
        return "Access Denied: Only career@labdox.com is authorized to access the Admin Panel.";
      case "use_admin_login":
        return "Admin Email Detected: Please use the 'Admin Google Login' button instead.";
      case "token_failed":
        return "Failed to retrieve access token from Google. Please try again.";
      case "no_email":
        return "Google did not provide an email address.";
      default:
        return "Google authentication encountered an error. Please try again.";
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
        ✕
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
      <p className="text-gray-600 text-sm bg-red-50 border border-red-200 p-4 rounded-xl">
        {getErrorMessage()}
      </p>

      <div className="pt-4 flex justify-center gap-4">
        <Link
          to="/login"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
