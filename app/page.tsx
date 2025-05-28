import ResearchOpportunitiesList from "@/components/infinite-scroll-list";

/**
 * Home Page Component
 * 
 * This is the main landing page of the application that displays
 * a list of research opportunities in an infinite scroll format.
 * 
 * Core functionality:
 * - Displays research opportunities from the database
 * - Implements infinite scrolling for better performance
 * - Serves as the primary entry point for users
 */
export default async function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        {/* Main research opportunities infinite scroll component */}
        <ResearchOpportunitiesList />
      </main>
    </>
  );
}
