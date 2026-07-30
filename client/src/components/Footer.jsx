export default function Footer() {
  return (
    <footer className="bg-orange-600 text-white py-6 border-t border-orange-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm font-medium">
        © {new Date().getFullYear()} Labdox Early Access Waitlist. All rights reserved.
      </div>
    </footer>
  );
}
