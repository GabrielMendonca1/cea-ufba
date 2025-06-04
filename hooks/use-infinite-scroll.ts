import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

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
  const [items, setItems] = useState<ResearchOpportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
  }, [currentPage, loading, hasMore, supabase]);

  // Load initial items
  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      loadMoreItems();
    }
  }, [items.length, loading, error]);

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
    setItems([]);
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