"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ListItem {
  id: number;
  text: string;
  imageUrl: string;
  description: string;
}

const mockData: ListItem[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  text: `Course Title ${i + 1}`,
  imageUrl: `https://picsum.photos/seed/${i + 1}/400/200`,
  description: `This is a detailed description for course ${i + 1}. It covers various interesting topics and provides in-depth knowledge. Join us to learn more!`,
}));

const ITEMS_PER_PAGE = 10;

export default function InfiniteScrollList() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const newItems = mockData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      setItems((prevItems) => [...prevItems, ...newItems]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(items.length + newItems.length < mockData.length);
      setLoading(false);
    }, 500);
  }, [loading, hasMore, page, items.length]);

  useEffect(() => {
    loadMoreItems();
  }, [loadMoreItems]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreItems, loading, hasMore]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <ul className="space-y-8">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="md:w-1/3">
              <img
                src={item.imageUrl}
                alt={item.text}
                className="object-cover w-full h-48 md:h-full"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-between md:w-2/3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.text}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  {item.description}
                </p>
              </div>
              <button className="mt-4 self-start bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Inscrever-se
              </button>
            </div>
          </li>
        ))}
      </ul>
      {loading && (
        <p className="text-center py-8 text-gray-600 dark:text-gray-400">
          Loading more courses...
        </p>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center py-8 text-gray-600 dark:text-gray-400">
          You've seen all courses!
        </p>
      )}
      {items.length === 0 && !loading && (
        <p className="text-center py-8 text-gray-600 dark:text-gray-400">
          No courses to display at the moment.
        </p>
      )}
    </div>
  );
} 