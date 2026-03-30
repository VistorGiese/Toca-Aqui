# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## toca-aqui-critical-fixes — 6 critical bugs blocking TCC presentation (hardcoded IP, no session restore, missing stats columns, wrong gig status filter, empty button handlers, no error boundary)
- **Date:** 2026-03-30
- **Error patterns:** hardcoded IP, ECONNREFUSED, AsyncStorage, session restore, shows_realizados, nota_media, pendente, BrowseEvents, onPress, white screen, ErrorBoundary, migration, Docker, sequelize-config, dotenv
- **Root cause:** (1) api.ts had hardcoded IP 192.168.224.1:3000 breaking all API calls off-dev-machine; (2) AuthContext.loadStoredData() intentionally cleared the stored token instead of restoring it; (3) ArtistProfileModel and EstablishmentProfileModel had no shows_realizados/nota_media columns and ContractService.completeContract() never incremented them; (4) BrowseEvents showed all bookings regardless of status instead of filtering to status=pendente; (5) ShowDetail contact buttons and ApplyConfirmation ellipsis had empty onPress handlers; (6) app.tsx had no ErrorBoundary causing any render error to produce a white screen
- **Fix:** (1) api.ts baseURL uses EXPO_PUBLIC_API_URL env var with localhost fallback; (2) loadStoredData() reads token from AsyncStorage and calls getProfile() to restore state, clears on 401; (3) migration 20240101000031 adds columns, models updated, completeContract() increments counters; (4) BrowseEvents filteredBookings guards on status==="pendente"; (5) empty handlers replaced with contextual Alert messages; (6) ErrorBoundary class component wraps NavigationIndependentTree; also fixed sequelize-config.js dotenv path to resolve relative to config file not cwd
- **Files changed:** TocaAqui/http/api.ts, TocaAqui/contexts/AuthContext.tsx, TocaAqui/screens/artist/BrowseEvents.tsx, TocaAqui/screens/artist/ShowDetail.tsx, TocaAqui/screens/artist/ApplyConfirmation.tsx, TocaAqui/app/app.tsx, backend-TocaAqui/src/models/ArtistProfileModel.ts, backend-TocaAqui/src/models/EstablishmentProfileModel.ts, backend-TocaAqui/src/services/ContractService.ts, backend-TocaAqui/src/migrations/20240101000031-add-stats-to-perfis.js, backend-TocaAqui/src/config/sequelize-config.js
---

