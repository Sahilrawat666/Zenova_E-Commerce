import { Link, useLocation } from "react-router-dom";

function ComingSoon() {
  const location = useLocation();

  const pageName = location.pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ");

  const formattedPageName = pageName
    ? pageName.replace(/\b\w/g, (char) => char.toUpperCase())
    : "This Page";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f5f0] px-6">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b08d57]">
          ZENOVA
        </p>

        <h1 className="mt-5 text-4xl font-light tracking-tight text-[#302923] sm:text-5xl">
          {formattedPageName}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#81776e]">
          We're currently working on this page. It will be available soon.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex items-center justify-center bg-[#241c18] px-6 py-3 text-sm text-white transition-colors hover:bg-[#b08d57]"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default ComingSoon;
