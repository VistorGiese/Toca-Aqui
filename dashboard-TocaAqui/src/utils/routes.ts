import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { DashboardHome } from "../pages/DashboardHome";
import { Users } from "../pages/Users";
import { Establishments } from "../pages/Establishments";
import { Artists } from "../pages/Artists";
import { Bands } from "../pages/Bands";
import { Events } from "../pages/Events";
import { Applications } from "../pages/Applications";
import { Comments } from "../pages/Comments";
import { Reviews } from "../pages/Reviews";
import { Favorites } from "../pages/Favorites";
import { Reports } from "../pages/Reports";
import { Settings } from "../pages/Settings";
import { Login } from "../pages/Login";
import { EstablishmentLayout } from "../pages/establishment/EstablishmentLayout";
import { EstablishmentHome } from "../pages/establishment/EstablishmentHome";
import { Agenda } from "../pages/establishment/Agenda";
import { AvailableArtists } from "../pages/establishment/AvailableArtists";
import { Contracts } from "../pages/establishment/Contracts";
import { Reviews as EstablishmentReviews } from "../pages/establishment/Reviews";
import { Settings as EstablishmentSettings } from "../pages/establishment/Settings";
import {
  RedirectToUsers,
  RedirectToEstablishments,
  RedirectToArtists,
  RedirectToBands,
  RedirectToEvents,
  RedirectToApplications,
  RedirectToComments,
  RedirectToReviews,
  RedirectToFavorites,
  RedirectToReports,
  RedirectToSettings,
} from "../components/RedirectToAdmin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "users", Component: Users },
      { path: "establishments", Component: Establishments },
      { path: "artists", Component: Artists },
      { path: "bands", Component: Bands },
      { path: "events", Component: Events },
      { path: "applications", Component: Applications },
      { path: "comments", Component: Comments },
      { path: "reviews", Component: Reviews },
      { path: "favorites", Component: Favorites },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "/estabelecimento",
    Component: EstablishmentLayout,
    children: [
      { index: true, Component: EstablishmentHome },
      { path: "agenda", Component: Agenda },
      { path: "artistas", Component: AvailableArtists },
      { path: "contratacoes", Component: Contracts },
      { path: "avaliacoes", Component: EstablishmentReviews },
      { path: "configuracoes", Component: EstablishmentSettings },
    ],
  },
  // Redirect old routes to new admin routes
  {
    path: "/users",
    Component: RedirectToUsers,
  },
  {
    path: "/establishments",
    Component: RedirectToEstablishments,
  },
  {
    path: "/artists",
    Component: RedirectToArtists,
  },
  {
    path: "/bands",
    Component: RedirectToBands,
  },
  {
    path: "/events",
    Component: RedirectToEvents,
  },
  {
    path: "/applications",
    Component: RedirectToApplications,
  },
  {
    path: "/comments",
    Component: RedirectToComments,
  },
  {
    path: "/reviews",
    Component: RedirectToReviews,
  },
  {
    path: "/favorites",
    Component: RedirectToFavorites,
  },
  {
    path: "/reports",
    Component: RedirectToReports,
  },
  {
    path: "/settings",
    Component: RedirectToSettings,
  },
]);