import { Navigate } from "react-router";

export function RedirectToUsers() {
  return <Navigate to="/admin/users" replace />;
}

export function RedirectToEstablishments() {
  return <Navigate to="/admin/establishments" replace />;
}

export function RedirectToArtists() {
  return <Navigate to="/admin/artists" replace />;
}

export function RedirectToBands() {
  return <Navigate to="/admin/bands" replace />;
}

export function RedirectToEvents() {
  return <Navigate to="/admin/events" replace />;
}

export function RedirectToApplications() {
  return <Navigate to="/admin/applications" replace />;
}

export function RedirectToComments() {
  return <Navigate to="/admin/comments" replace />;
}

export function RedirectToReviews() {
  return <Navigate to="/admin/reviews" replace />;
}

export function RedirectToFavorites() {
  return <Navigate to="/admin/favorites" replace />;
}

export function RedirectToReports() {
  return <Navigate to="/admin/reports" replace />;
}

export function RedirectToSettings() {
  return <Navigate to="/admin/settings" replace />;
}
