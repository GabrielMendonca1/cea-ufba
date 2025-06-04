"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useInfiniteResearchOpportunities,
  ResearchOpportunity,
} from "@/hooks/use-infinite-scroll";
import { ResearchOpportunityCard } from "./research-opportunity-card";
import { ResearchDetailsSheet } from "@/components/research/research-details-sheet";
import {
  InitialLoadingSkeleton,
  LoadingIndicator,
  LoadMoreButton,
  EndOfListMessage,
  EmptyState,
  ErrorState,
} from "./loading-states";
import useAuthUser from "@/hooks/use-auth-user";

/**
 * Research Opportunities List Component
 *
 * This is the main component that displays research opportunities in an infinite scroll format.
 * Now refactored for better separation of concerns and maintainability.
 */
export default function ResearchOpportunitiesList() {
  // State for detailed view functionality
  const [selectedResearch, setSelectedResearch] =
    useState<ResearchOpportunity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { user } = useAuthUser();

  // Use custom hook for infinite scroll logic
  const {
    items,
    loading,
    initialLoading,
    hasMore,
    error,
    loadingRef,
    loadMoreItems,
    retry,
  } = useInfiniteResearchOpportunities();

  /**
   * Handle Research Click
   * Opens the detailed view sheet for a selected research opportunity
   */
  const handleResearchClick = (research: ResearchOpportunity) => {
    if (!user) return;
    setSelectedResearch(research);
    setIsSheetOpen(true);
  };

  /**
   * Handle Apply Click
   * Handles application to a research opportunity
   */
  const handleApplyClick = (
    e: React.MouseEvent,
    research: ResearchOpportunity,
  ) => {
    e.stopPropagation();
    if (!user) return;
    // TODO: Implement application logic
    console.log("Apply to research:", research.id);
  };

  // Show initial loading state
  if (initialLoading) {
    return <InitialLoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Oportunidades de Pesquisa UFBA
        </h1>
        <p className="text-muted-foreground">
          Mostrando {items.length} oportunidades disponíveis
        </p>
      </div>

      {/* Research Opportunities List */}
      <div className="space-y-8">
        {items.map((item, index) => (
          <ResearchOpportunityCard
            key={item.id}
            opportunity={item}
            index={index}
            onCardClick={handleResearchClick}
            onApplyClick={handleApplyClick}
            disabled={!user}
          />
        ))}
      </div>

      {/* Loading and Pagination States */}
      <div ref={loadingRef} className="mt-8">
        {loading && <LoadingIndicator />}

        {!loading && hasMore && items.length > 0 && (
          <LoadMoreButton onLoadMore={loadMoreItems} loading={loading} />
        )}

        {!hasMore && items.length > 0 && <EndOfListMessage />}

        {items.length === 0 && !loading && <EmptyState />}
      </div>

      {/* Research Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedResearch && (
            <ResearchDetailsSheet
              research={selectedResearch}
              onApply={() =>
                handleApplyClick({} as React.MouseEvent, selectedResearch)
              }
              disabled={!user}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
