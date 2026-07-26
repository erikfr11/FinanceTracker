import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { fetchTransactions } from '../../services/transactionService';

interface NoteAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  existingNotes?: string[];
  placeholder?: string;
  className?: string;
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

interface RankedSuggestion {
  note: string;
  count: number;
  isFuzzy: boolean;
}

export default function NoteAutocompleteInput({
  value,
  onChange,
  existingNotes,
  placeholder = 'z.B. Supermarkt Einkauf, Gehalt Juli…',
  className = '',
}: NoteAutocompleteInputProps) {
  const [loadedNotes, setLoadedNotes] = useState<string[]>(existingNotes || []);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch recent notes from backend if not passed as prop
  useEffect(() => {
    if (existingNotes && existingNotes.length > 0) {
      setLoadedNotes(existingNotes);
      return;
    }

    let isMounted = true;
    fetchTransactions({})
      .then((txs) => {
        if (!isMounted) return;
        const notes = txs.map((t) => t.note).filter((n): n is string => !!n && n.trim().length > 0);
        setLoadedNotes(notes);
      })
      .catch(() => {
        // Silent fallback
      });

    return () => {
      isMounted = false;
    };
  }, [existingNotes]);

  // Aggregate frequencies of unique trimmed notes
  const noteFrequencyMap = useMemo(() => {
    const map = new Map<string, { note: string; count: number }>();
    loadedNotes.forEach((n) => {
      const trimmed = n.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { note: trimmed, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [loadedNotes]);

  // Dynamic suggestions matching exact substring & fuzzy Levenshtein for 4+ chars
  const suggestions = useMemo<RankedSuggestion[]>(() => {
    const query = value.trim().toLowerCase();

    // Empty query: show top 6 most frequent notes
    if (!query) {
      return [...noteFrequencyMap]
        .sort((a, b) => b.count - a.count || a.note.localeCompare(b.note, 'de'))
        .slice(0, 6)
        .map((item) => ({ note: item.note, count: item.count, isFuzzy: false }));
    }

    const exactMatches: RankedSuggestion[] = [];
    const fuzzyMatches: RankedSuggestion[] = [];
    const maxFuzzyDist = query.length >= 6 ? 2 : 1;

    for (const item of noteFrequencyMap) {
      const itemLower = item.note.toLowerCase();

      // 1. Substring / Prefix match
      if (itemLower.includes(query)) {
        exactMatches.push({ note: item.note, count: item.count, isFuzzy: false });
        continue;
      }

      // 2. Fuzzy match only if query >= 4 characters
      if (query.length >= 4) {
        // Check full note similarity
        const fullDist = levenshteinDistance(query, itemLower);
        let matchedFuzzy = fullDist <= maxFuzzyDist;

        // Check individual words in the note
        if (!matchedFuzzy) {
          const words = itemLower.split(/\s+/);
          for (const word of words) {
            if (word.length >= 3 && levenshteinDistance(query, word) <= maxFuzzyDist) {
              matchedFuzzy = true;
              break;
            }
          }
        }

        if (matchedFuzzy) {
          fuzzyMatches.push({ note: item.note, count: item.count, isFuzzy: true });
        }
      }
    }

    // Sort exact matches by frequency desc, then alphabetical
    exactMatches.sort((a, b) => b.count - a.count || a.note.localeCompare(b.note, 'de'));
    // Sort fuzzy matches by frequency desc
    fuzzyMatches.sort((a, b) => b.count - a.count || a.note.localeCompare(b.note, 'de'));

    return [...exactMatches, ...fuzzyMatches].slice(0, 8);
  }, [noteFrequencyMap, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (noteText: string) => {
    onChange(noteText);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex].note);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />

      {/* Autocomplete Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[120] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1 animate-in fade-in duration-150">
          <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-dark-400 border-b border-dark-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary-400" />
            Vorschläge aus deinen Transaktionen
          </div>
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={`${item.note}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item.note);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  isHighlighted ? 'bg-primary-600/20 text-white font-medium' : 'text-dark-200 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Clock className="h-3.5 w-3.5 text-dark-400 flex-shrink-0" />
                  <span className="truncate">{item.note}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.isFuzzy && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                      Ähnlich
                    </span>
                  )}
                  <span className="text-[10px] bg-dark-800 text-dark-400 px-1.5 py-0.5 rounded font-mono border border-dark-700">
                    {item.count}x
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
