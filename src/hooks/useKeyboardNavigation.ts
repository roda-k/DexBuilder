import { useEffect, RefObject } from 'react';

// The null typing on inputRef allows for the inputRef in SearchBar to not conflict typings even if redundant.
// no better solution for now

interface KeyboardNavigationOptions {
  inputRef: RefObject<HTMLInputElement | null>;
  query?: string;
  onClear?: () => void;
  enableGlobalShortcut?: boolean;
  preventIn?: string[];
}

/**
 * Hook to handle keyboard navigation for search components
 */
const useKeyboardNavigation = ({
  inputRef,
  query = '',
  onClear,
  enableGlobalShortcut = true,
  preventIn = ['INPUT', 'TEXTAREA', 'SELECT'],
}: KeyboardNavigationOptions): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global focus shortcut (/)
      if (enableGlobalShortcut && 
          e.key === '/' && 
          !preventIn.includes(document.activeElement?.tagName || '')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Clear search with Escape when focused in search field
      if (e.key === 'Escape' && 
          document.activeElement === inputRef.current && 
          query && 
          onClear) {
        e.preventDefault();
        onClear();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef, query, onClear, enableGlobalShortcut, preventIn]);
};

export default useKeyboardNavigation;