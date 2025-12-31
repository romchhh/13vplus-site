"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

interface SearchSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { type: string; url: string } | null;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const MAX_SEARCH_HISTORY = 10;
const MAX_AUTOCOMPLETE_SUGGESTIONS = 5;

// Get search history from localStorage
function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const history = localStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

// Save search to history
function saveToSearchHistory(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const history = getSearchHistory();
    // Remove duplicates and add to beginning
    const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    const newHistory = [
      { query: query.trim(), timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_SEARCH_HISTORY);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

// Get popular searches (most frequent in history)
function getPopularSearches(searchHistory: Array<{ query: string; timestamp: number }>): string[] {
  const frequency: Record<string, number> = {};
  
  searchHistory.forEach((item) => {
    const query = item.query.toLowerCase();
    frequency[query] = (frequency[query] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([query]) => query);
}

// Clear search history
function clearSearchHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("searchHistory");
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}

export default function SearchSidebar({
  isOpen,
  setIsOpen,
}: SearchSidebarProps) {
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const { products: allProducts, loading } = useProducts();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setSearchHistory(getSearchHistory());
      // Small delay to ensure sidebar is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closing
      setQuery("");
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [isOpen]);

  // Fetch popular products when sidebar opens
  useEffect(() => {
    if (isOpen && !query) {
      async function fetchPopularProducts() {
        try {
          setLoadingPopular(true);
          const response = await fetch("/api/products/top-sale");
          if (response.ok) {
            const data = await response.json();
            // Limit to 6-8 products
            setPopularProducts(data.slice(0, 8));
          }
        } catch (error) {
          console.error("Error fetching popular products:", error);
        } finally {
          setLoadingPopular(false);
        }
      }
      fetchPopularProducts();
    }
  }, [isOpen, query]);

  // Handle click outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate autocomplete suggestions with debounce
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Generate autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) return [];
    
    const lowerQuery = debouncedQuery.toLowerCase();
    const suggestions = new Set<string>();
    
    // Get suggestions from product names (prioritize exact matches)
    const exactMatches: string[] = [];
    const partialMatches: string[] = [];
    
    allProducts.forEach((product) => {
      const name = product.name.toLowerCase();
      if (name.startsWith(lowerQuery)) {
        exactMatches.push(product.name);
      } else if (name.includes(lowerQuery)) {
        partialMatches.push(product.name);
      }
    });
    
    // Add exact matches first
    exactMatches.forEach(match => suggestions.add(match));
    partialMatches.forEach(match => suggestions.add(match));
    
    // Get suggestions from search history
    searchHistory.forEach((item) => {
      if (item.query.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(item.query);
      }
    });
    
    return Array.from(suggestions).slice(0, MAX_AUTOCOMPLETE_SUGGESTIONS);
  }, [debouncedQuery, allProducts, searchHistory]);

  // Sort products by relevance (exact matches first, then partial)
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const exactMatches: Product[] = [];
    const partialMatches: Product[] = [];
    
    allProducts.forEach((product) => {
      const name = product.name.toLowerCase();
      if (name.startsWith(lowerQuery)) {
        exactMatches.push(product);
      } else if (name.includes(lowerQuery)) {
        partialMatches.push(product);
      }
    });
    
    return [...exactMatches, ...partialMatches];
  }, [allProducts, query]);

  // Handle search query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveToSearchHistory(searchQuery);
      setSearchHistory(getSearchHistory());
      setQuery(searchQuery);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedSuggestionIndex >= 0 && autocompleteSuggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(autocompleteSuggestions[selectedSuggestionIndex]);
      } else if (query.trim()) {
        handleSearch(query);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setSelectedSuggestionIndex((prev) =>
        prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  // Clear input
  const handleClearInput = () => {
    setQuery("");
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-black px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const popularSearches = useMemo(() => getPopularSearches(searchHistory), [searchHistory]);

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md bg-stone-100 shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex flex-col p-4 sm:p-6 space-y-6 text-base sm:text-lg">
          {/* Header */}
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold">
            <span>Пошук</span>
            <button
              className="hover:text-[#8C7461] text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative flex items-center">
              {/* Search Icon */}
              <svg
                className="absolute left-3 w-5 h-5 text-stone-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              
          <input
                ref={inputRef}
            type="text"
            value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Введіть запит..."
                className="pl-10 pr-10 py-3 border text-lg rounded w-full focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:border-transparent bg-white text-black border-stone-300 placeholder-stone-500 transition-all"
          />
              
              {/* Clear Button */}
              {query && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label="Очистити"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-stone-300 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200"
              >
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-2.5 transition-colors text-black ${
                      index === selectedSuggestionIndex
                        ? "bg-stone-200"
                        : "hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-stone-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>{highlightText(suggestion, query)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="mt-4">
            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-stone-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                      <div className="h-3 bg-stone-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && query && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="w-16 h-16 text-stone-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-neutral-500 text-lg font-medium mb-2">
                  Нічого не знайдено
                </p>
                <p className="text-neutral-400 text-sm">
                  Спробуйте інший запит або перегляньте популярні товари
                </p>
              </div>
            )}

            {!loading && query && filteredProducts.length > 0 && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-600 font-medium">
                    Знайдено: {filteredProducts.length} {filteredProducts.length === 1 ? "товар" : "товарів"}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                {filteredProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.id}`}
                        onClick={() => {
                          handleSearch(query);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-200 transition-all duration-200 group border border-transparent hover:border-stone-300"
                    >
                        <div className="relative flex-shrink-0">
                      <Image
                        src={getProductImageSrc(product.first_media, "https://placehold.co/64x64")}
                        alt={product.name}
                        width={64}
                        height={64}
                            className="w-16 h-16 object-cover rounded border group-hover:scale-105 transition-transform duration-200"
                      />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-black group-hover:text-[#8C7461] transition-colors">
                            {highlightText(product.name, query)}
                          </span>
                          <span className="text-sm font-semibold text-[#8C7461] mt-0.5">
                            {product.price.toLocaleString()} ₴
                        </span>
                      </div>
                        <svg
                          className="w-5 h-5 text-stone-400 group-hover:text-[#8C7461] transition-colors flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              </>
            )}

            {!query && !loading && (
              <div className="space-y-6">
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-stone-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="text-base sm:text-lg font-semibold text-black">
                          Недавні пошуки
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          clearSearchHistory();
                          setSearchHistory([]);
                        }}
                        className="text-xs text-neutral-500 hover:text-neutral-700 underline transition-colors"
                      >
                        Очистити
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSearch(item.query)}
                          className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm hover:bg-stone-200 hover:border-stone-400 transition-all duration-200 text-black flex items-center gap-1.5"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-stone-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          {item.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg
                        className="w-5 h-5 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <h3 className="text-base sm:text-lg font-semibold text-black">
                        Популярні запити
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSearch(search)}
                          className="px-3 py-1.5 bg-stone-200 border border-stone-300 rounded-lg text-sm hover:bg-stone-300 hover:border-stone-400 transition-all duration-200 text-black flex items-center gap-1.5"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-stone-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-5.834a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5zM11.5 9.5a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-5a1.5 1.5 0 00-1.5-1.5h-1zM16 6v10a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5h-1A1.5 1.5 0 0016 6z" />
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Products */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-black">
                    Люди часто цікавляться
                  </h3>
                  </div>
                  {loadingPopular ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <div className="w-16 h-16 bg-stone-200 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : popularProducts.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {popularProducts.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-200 transition-all duration-200 group border border-transparent hover:border-stone-300"
                          >
                            <div className="relative flex-shrink-0">
                            <Image
                              src={getProductImageSrc(product.first_media, "https://placehold.co/64x64")}
                              alt={product.name}
                              width={64}
                              height={64}
                                className="w-16 h-16 object-cover rounded border group-hover:scale-105 transition-transform duration-200"
                            />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-black group-hover:text-[#8C7461] transition-colors">
                                {product.name}
                              </span>
                              <span className="text-sm font-semibold text-[#8C7461] mt-0.5">
                                {product.price.toLocaleString()} ₴
                              </span>
                            </div>
                            <svg
                              className="w-5 h-5 text-stone-400 group-hover:text-[#8C7461] transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-400 text-sm">
                        Введіть запит для пошуку товарів
                    </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
