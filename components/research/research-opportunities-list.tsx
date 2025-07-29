"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  useInfiniteResearchOpportunities,
  ResearchOpportunity,
} from "@/hooks/use-infinite-scroll";
import { ResearchOpportunityCard } from "./research-opportunity-card";
import { ResearchDetailsSheet } from "@/components/research/research-details-sheet";
import { ApplicationFormModal } from "./ApplicationFormModal";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import useAuthUser from "@/hooks/use-auth-user";
import { professorLoading } from "@/components/ui/professor-loading";
import {
  LoadingIndicator,
  LoadMoreButton,
  EndOfListMessage,
  EmptyState,
  ErrorState,
} from "@/components/research/loading-states";

export default function ResearchOpportunitiesList() {
  const [selectedResearch, setSelectedResearch] =
    useState<ResearchOpportunity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const { user } = useAuthUser();

  // Use useRealtimeTable for applications to handle optimistic updates
  const [, setApplications] = useRealtimeTable<any>("applications", []);

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

  const handleResearchClick = (research: ResearchOpportunity) => {
    if (!user) return;
    setSelectedResearch(research);
    setIsSheetOpen(true);
  };

  const handleApplyClick = (
    e: React.MouseEvent,
    research: ResearchOpportunity,
  ) => {
    e.stopPropagation();
    if (!user) return;
    setSelectedResearch(research);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = (newApplication: any) => {
    // This callback is used by ApplicationFormModal for optimistic updates
    setApplications((prev: any) => [newApplication, ...prev]);
  };

  // Show initial loading state
  if (initialLoading) {
    return professorLoading();
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
