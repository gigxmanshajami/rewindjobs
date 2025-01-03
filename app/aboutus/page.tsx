// pages/about.js
// @ts-nocheck
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl">
          About Us
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We are on a mission to serve aspirants who are serving notice or have
          been laid off, helping them reach their destination. With our
          innovative AI technology and services, we help you achieve{" "}
          <span className="font-semibold text-gray-800">5X more interviews </span> 
          and stay ahead in your job search.
        </p>
        <div className="mt-8">
          {/* <img
            src="/team-collaboration.svg"
            alt="Team collaboration"
            className="mx-auto w-full max-w-md"
          /> */}
        </div>
        <p className="mt-8 text-lg text-gray-600">
          <span className="font-semibold text-gray-800">Rewindjobs.com</span> is one of 
          the most admired job portals for laid-off and notice-serving technocrats. 
          We are here to empower you with the tools and opportunities to succeed in your 
          career journey.
        </p>
      </div>
    </div>
  );
}
