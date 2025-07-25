/**
 * Enhanced Live Scoring Initialization
 * Handles proper initialization of the enhanced live scoring system
 */

(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedLiveScoring);
    } else {
        initEnhancedLiveScoring();
    }

    function initEnhancedLiveScoring() {
        // Check if we're on the admin dashboard
        if (!document.getElementById('liveScoringContent')) {
            return;
        }

        // Override the loadSectionData method to handle enhanced live scoring
        if (window.adminDashboard && window.adminDashboard.loadSectionData) {
            const originalLoadSectionData = window.adminDashboard.loadSectionData.bind(window.adminDashboard);
            
            window.adminDashboard.loadSectionData = async function(sectionName) {
                if (sectionName === 'live-scoring') {
                    try {
                        // Initialize enhanced live scoring if not already done
                        if (!window.adminLiveScoring || typeof window.adminLiveScoring.loadLiveMatches !== 'function') {
                            console.log('Initializing Enhanced Live Scoring...');
                            window.adminLiveScoring = new EnhancedLiveScoring();
                        } else {
                            console.log('Refreshing Live Scoring data...');
                            await window.adminLiveScoring.loadLiveMatches();
                        }
                    } catch (error) {
                        console.error('Error initializing live scoring:', error);
                        // Fallback: try to call original method
                        await originalLoadSectionData(sectionName);
                    }
                } else {
                    // Call original method for other sections
                    await originalLoadSectionData(sectionName);
                }
            };
        }

        // Initialize enhanced live scoring immediately if live scoring section is visible
        const liveScoringSection = document.getElementById('live-scoring-section');
        if (liveScoringSection && liveScoringSection.classList.contains('active')) {
            try {
                if (!window.adminLiveScoring) {
                    console.log('Auto-initializing Enhanced Live Scoring for active section...');
                    window.adminLiveScoring = new EnhancedLiveScoring();
                }
            } catch (error) {
                console.error('Error auto-initializing live scoring:', error);
            }
        }
    }
})();