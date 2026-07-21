"use client";

import { useState, useCallback } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/AuthProvider";
import { searchBible } from "@/lib/api";
import { SearchIcon, BookOpenIcon } from "@/components/icons";

const SUGGESTED_SEARCHES = [
  "love", "faith", "hope", "peace", "forgiveness", "wisdom",
];

function BibleSearchContent() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;
    setQuery(q);
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await searchBible(q, { limit: 10 });
      setResults(res);
    } catch (e) {
      console.warn("[bible] search failed:", e);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <AppNavbar avatarUrl={user?.avatarUrl} displayName={user?.displayName} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          {/* Page header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-primary/25">
              <SearchIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Search the Bible</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Find verses by keyword, book name, or topic
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search verses..."
                  autoFocus
                  className="w-full rounded-2xl border border-border bg-surface py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-base"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={searching || !query.trim()}
                aria-label="Search"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-bg text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {searching ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <SearchIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Suggested searches */}
          {!hasSearched && !searching && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTED_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-8 space-y-3">
              {/* Results count */}
              {!searching && (
                <p className="text-sm text-muted-foreground">
                  {results.length > 0
                    ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                    : ''}
                </p>
              )}

              {searching && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <SearchIcon className="h-8 w-8" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">No verses found</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try a different keyword or phrase.
                  </p>
                </div>
              ) : (
                results.map((result, i) => (
                  <div
                    key={result.ref}
                    className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md animate-[fade-in-up_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 text-primary transition-transform group-hover:scale-110">
                        <BookOpenIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold tracking-tight text-primary">
                          {result.ref}
                        </p>
                        <p className="mt-1.5 font-serif text-sm leading-relaxed text-foreground sm:text-base">
                          {result.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Initial empty state */}
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpenIcon className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Start your search</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
                Search for verses by keyword, book name, or topic. Try one of the suggestions above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BibleSearchPage() {
  return (
    <AuthGuard>
      <BibleSearchContent />
    </AuthGuard>
  );
}
