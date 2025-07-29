import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRealtimeTable } from "./useRealtimeTable";

export type ResearchOpportunity = {
  id: string;
  title: string;
  description: string;
  supervisor_id: string | null;
  research_area: string;
  monthly_value: string;
  deadline: string;
  start_date: string;
  duration: string;
  vacancies: number;
  workload: string;
  scholarship_type: string;
  requirements: string[];
  objectives: string[];
  methodology: string;
  expected_results: string[];
  contact_email: string;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

const ITEMS_PER_PAGE = 10;

export function useInfiniteResearchOpportunities() {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Use useRealtimeTable for real-time updates and initial data
  const [items, setItems] = useRealtimeTable<ResearchOpportunity>(
    "research_opportunities",
    [],
    {
      filter: "is_active=eq.true",
      onInsert: (newItem) => {
        // Ensure new items are added to the beginning for chronological order
        setItems((prev) => [newItem, ...prev]);
      },
      onUpdate: (updatedItem) => {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      },
      onDelete: (deletedItem) => {
        setItems((prev) => prev.filter((item) => item.id !== deletedItem.id));
      },
    }
  );

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    try {
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("research_opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(startIndex, endIndex);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setItems(prevItems => {
          const existingIds = new Set(prevItems.map(item => item.id));
          const newItems = data.filter(item => !existingIds.has(item.id));
          // Append new items to the end of the list for infinite scroll
          return [...prevItems, ...newItems];
        });
        setCurrentPage(prev => prev + 1);
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar oportunidades");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [currentPage, loading, hasMore, supabase, setItems]);

  // Initial load of items (only if no items are present from realtime hook)
  useEffect(() => {
    if (items.length === 0 && !loading && !error && initialLoading) {
      loadMoreItems();
    }
  }, [items.length, loading, error, initialLoading, loadMoreItems]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loadMoreItems, hasMore, loading]);

  const retry = () => {
    setError(null);
    setCurrentPage(0);
    setItems([]); // Reset items via useRealtimeTable's setter
    setHasMore(true);
    setInitialLoading(true);
  };

  return {
    items,
    loading,
    initialLoading,
    hasMore,
    error,
    loadingRef,
    loadMoreItems,
    retry
  };
} 