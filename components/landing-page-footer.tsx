export default function LandingPageFooter() {
  return (
    <footer className=" bg-gray-900 text-gray-400">
      <div className="border-t border-gray-500/10 max-w-5xl mx-auto">
        <div className="flex items-center justify-center p-4">
          <p className="text-gray-650">{`©${new Date().getFullYear()} Fora Cities Inc.`}</p>
        </div>
      </div>
    </footer>
  );
}
