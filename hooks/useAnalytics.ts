/**
 * Custom hook for tracking events in Google Analytics
 */
export const useAnalytics = () => {
  /**
   * Track a page view
   * @param url - The URL of the page
   * @param title - The title of the page
   */
  const trackPageView = (url: string, title: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_location: url,
        page_title: title,
      });
    }
  };

  /**
   * Track a custom event
   * @param action - The action name
   * @param params - Additional parameters
   */
  const trackEvent = (action: string, params: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, params);
    }
  };

  /**
   * Track when a user views a location
   * @param locationId - The ID of the location
   * @param locationName - The name of the location
   */
  const trackLocationView = (locationId: string, locationName: string) => {
    trackEvent('view_location', {
      location_id: locationId,
      location_name: locationName,
    });
  };

  /**
   * Track when a user filters locations
   * @param filterType - The type of filter applied
   * @param filterValue - The value of the filter
   */
  const trackFilter = (filterType: string, filterValue: string) => {
    trackEvent('apply_filter', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  /**
   * Track when a user searches for a location
   * @param searchQuery - The search query
   * @param resultsCount - The number of results
   */
  const trackSearch = (searchQuery: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchQuery,
      results_count: resultsCount,
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackLocationView,
    trackFilter,
    trackSearch,
  };
}; 