import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ProtectedRoute, GuestRoute, RoleRoute } from "./components/layout/Guards";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Network from "./pages/network/Network";
import Messages from "./pages/messages/Messages";
import AthleteProfile from "./pages/athletes/AthleteProfile";
import AthleteProfileEdit from "./pages/athletes/AthleteProfileEdit";
import AthletePortfolio from "./pages/athletes/AthletePortfolio";
import AthleteDiscovery from "./pages/athletes/AthleteDiscovery";

import OrganizationProfile from "./pages/organizations/OrganizationProfile";
import OrganizationEdit from "./pages/organizations/OrganizationEdit";

import EventsBrowse from "./pages/events/EventsBrowse";
import EventDetail from "./pages/events/EventDetail";
import EventForm from "./pages/events/EventForm";
import OrgEventsManage from "./pages/events/OrgEventsManage";

import MyApplications from "./pages/applications/MyApplications";
import EventApplicationsManage from "./pages/applications/EventApplicationsManage";

import Verification from "./pages/verification/Verification";
import AdminVerifications from "./pages/admin/AdminVerifications";

const ORG_ROLES = ["CLUB", "ACADEMY", "AGENCY"];

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/athletes" element={<AthleteDiscovery />} />
          <Route path="/athletes/:userId" element={<AthleteProfile />} />

          <Route path="/organizations/:id" element={<OrganizationProfile />} />

          <Route path="/events" element={<EventsBrowse />} />
          <Route path="/events/:id" element={<EventDetail />} />
<Route
  path="/network"
  element={<Network />}
/>

<Route
  path="/messages"
  element={<Messages />}
/>
          <Route path="/verification" element={<Verification />} />

          <Route element={<RoleRoute roles={["ATHLETE"]} />}>
            <Route path="/profile" element={<AthleteProfile mine />} />
            <Route path="/profile/edit" element={<AthleteProfileEdit />} />
            <Route path="/profile/portfolio" element={<AthletePortfolio />} />
            <Route path="/applications" element={<MyApplications />} />
          </Route>

          <Route element={<RoleRoute roles={ORG_ROLES} />}>
            <Route path="/organization" element={<OrganizationEdit />} />
            <Route path="/organization/:id/events" element={<OrgEventsManage />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/events/:id/applications" element={<EventApplicationsManage />} />
          </Route>

          <Route element={<RoleRoute roles={["ADMIN"]} />}>
            <Route path="/admin/verifications" element={<AdminVerifications />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

