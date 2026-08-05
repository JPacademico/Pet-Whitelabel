import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { HomePage } from '@/features/home/HomePage';

const ShopPage = lazy(() => import('@/features/shop/ShopPage').then((m) => ({ default: m.ShopPage })));
const GroomingPage = lazy(() =>
  import('@/features/grooming/GroomingPage').then((m) => ({ default: m.GroomingPage })),
);
const ClinicPage = lazy(() =>
  import('@/features/clinic/ClinicPage').then((m) => ({ default: m.ClinicPage })),
);
const HotelPage = lazy(() =>
  import('@/features/hotel/HotelPage').then((m) => ({ default: m.HotelPage })),
);
const GalleryPage = lazy(() =>
  import('@/features/gallery/GalleryPage').then((m) => ({ default: m.GalleryPage })),
);
const NotFoundPage = lazy(() =>
  import('@/features/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

// The entire /admin subtree is one chunk, isolated from the public bundle — the public visitor
// never downloads the admin panel's code. See IMPLEMENTATION_PLAN.md §4.1.
const AdminLoginPage = lazy(() =>
  import('@/features/admin/auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/dashboard/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminProductsPage = lazy(() =>
  import('@/features/admin/products/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
);
const AdminBookingsPage = lazy(() =>
  import('@/features/admin/bookings/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })),
);
const AdminCalendarPage = lazy(() =>
  import('@/features/admin/calendar/AdminCalendarPage').then((m) => ({ default: m.AdminCalendarPage })),
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/loja', element: <ShopPage /> },
      { path: '/banho-e-tosa', element: <GroomingPage /> },
      { path: '/clinica', element: <ClinicPage /> },
      { path: '/hotel', element: <HotelPage /> },
      { path: '/galeria', element: <GalleryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'produtos', element: <AdminProductsPage /> },
      { path: 'agendamentos', element: <AdminBookingsPage /> },
      { path: 'calendario', element: <AdminCalendarPage /> },
    ],
  },
]);
