import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("routes/_site.tsx", [
    index("routes/home.tsx"),
    route("stays", "routes/stays.tsx"),
    route("stays/:slug", "routes/stay.tsx"),
    route("why-us", "routes/why-us.tsx"),
    route("things-to-do", "routes/things-to-do.tsx"),
    route("things-to-do/:slug", "routes/guide.tsx"),
    route("management", "routes/management.tsx"),
    route("faqs", "routes/faqs.tsx"),
    route("contact", "routes/contact.tsx"),
    route("privacy-policy", "routes/privacy-policy.tsx"),
  ]),

  // Resource routes
  route("media/*", "routes/media.ts"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),

  // Admin: _layout links admin.css and checks Origin on every POST;
  // _authed requires a session for everything except the login page.
  layout("routes/admin/_layout.tsx", [
    ...prefix("admin", [
      route("login", "routes/admin/login.tsx"),
      layout("routes/admin/_authed.tsx", [
        index("routes/admin/overview.tsx"),
        route("logout", "routes/admin/logout.tsx"),
        route("properties", "routes/admin/properties.tsx"),
        route("properties/new", "routes/admin/property-new.tsx"),
        route("properties/:id", "routes/admin/property.tsx", [
          index("routes/admin/property-details.tsx"),
          route("photos", "routes/admin/property-photos.tsx"),
          route("calendar", "routes/admin/property-calendar.tsx"),
        ]),
        route("bookings", "routes/admin/bookings.tsx"),
        route("bookings/:id", "routes/admin/booking.tsx"),
        route("messages", "routes/admin/messages.tsx"),
        route("enquiries", "routes/admin/enquiries.tsx"),
        route("faqs", "routes/admin/faqs.tsx"),
        route("reviews", "routes/admin/reviews.tsx"),
        route("extra-services", "routes/admin/extra-services.tsx"),
        route("guides", "routes/admin/guides.tsx"),
        route("guides/new", "routes/admin/guide-new.tsx"),
        route("guides/preview", "routes/admin/guide-preview.ts"),
        route("guides/:id", "routes/admin/guide.tsx", [
          index("routes/admin/guide-details.tsx"),
          route("photos", "routes/admin/guide-photos.tsx"),
        ]),
        route("settings", "routes/admin/settings.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
