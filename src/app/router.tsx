import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

import LoginPage from "../modules/auth/pages/LoginPage";
import ResetPasswordPage from "../modules/auth/pages/ResetPasswordPage";
import DashboardPage from "../modules/dashboard/pages/DashboardPage";

import seedClients from "../shared/data/seeds/clients.json";
import seedUsers from "../shared/data/seeds/users.json";

import UserListPage from "../modules/users/pages/UserListPage";
import UserCreatePage from "../modules/users/pages/UserCreatePage";
import UserEditPage from "../modules/users/pages/UserEditPage";
import UserDetailPage from "../modules/users/pages/UserDetailPage";

import ClientListPage from "../modules/clients/pages/ClientListPage";
import ClientDetailPage from "../modules/clients/pages/ClientDetailPage";
import ClientCreatePage from "../modules/clients/pages/ClientCreatePage";
import ClientEditPage from "../modules/clients/pages/ClientEditPage";

import PortfolioListPage from "../modules/portfolio/pages/PortfolioListPage";
import PortfolioCreatePage from "../modules/portfolio/pages/PortfolioCreatePage";
import PortfolioEditPage from "../modules/portfolio/pages/PortfolioEditPage";
import PortfolioDetailPage from "../modules/portfolio/pages/PortfolioDetailPage";

import ProductListPage from "../modules/products/pages/ProductListPage";
import ProductCreatePage from "../modules/products/pages/ProductCreatePage";
import ProductDetailPage from "../modules/products/pages/ProductDetailPage";
import ProductEditPage from "../modules/products/pages/ProductEditPage";

import DataSheetListPage from "../modules/datasheets/pages/DataSheetListPage";
import ProductSheetPage from "../modules/datasheets/pages/ProductSheetPage";
import DataSheetEditPage from "../modules/datasheets/pages/DataSheetEditPage";

import ComplianceDocumentPage from "../shared/pages/ComplianceDocumentPage";

import {
  CatalogRestrictionManagementPage,
  ViewAllCatalogsPage,
} from "../modules/catalog-management";

import { getCurrentUser } from "../shared/data/userStorage";
import { getAllApprovedProducts } from "../shared/data/approvedProductStorage";

const seedInitialData = () => {
  if (!localStorage.getItem("odiseo_clients")) {
    localStorage.setItem("odiseo_clients", JSON.stringify(seedClients));
  }

  if (!localStorage.getItem("odiseo_users")) {
    localStorage.setItem("odiseo_users", JSON.stringify(seedUsers));
  }

  if (!localStorage.getItem("odiseo_approved_products")) {
    localStorage.setItem(
      "odiseo_approved_products",
      JSON.stringify(getAllApprovedProducts())
    );
  }
};

export default function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getCurrentUser())
  );

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(Boolean(user));

    if (user) {
      seedInitialData();
    }
  }, []);

  const handleLogin = () => {
    const user = getCurrentUser();
    setIsAuthenticated(Boolean(user));

    if (user) {
      seedInitialData();
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route
        path="/compliance-document"
        element={<ComplianceDocumentPage />}
      />

      <Route
        path="/"
        element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />

        {/* Clientes */}
        <Route path="clients" element={<ClientListPage />} />
        <Route path="clients/new" element={<ClientCreatePage />} />
        <Route path="clients/:clientCode" element={<ClientDetailPage />} />
        <Route path="clients/:clientCode/edit" element={<ClientEditPage />} />

        {/* Portafolio */}
        <Route path="portfolio" element={<PortfolioListPage />} />
        <Route path="portfolio/new" element={<PortfolioCreatePage />} />
        <Route
          path="portfolio/:portfolioCode"
          element={<PortfolioDetailPage />}
        />
        <Route
          path="portfolio/:portfolioCode/edit"
          element={<PortfolioEditPage />}
        />

        {/* Productos */}
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route
          path="products/:productCode"
          element={<ProductDetailPage />}
        />
        <Route
          path="products/:productCode/edit"
          element={<ProductEditPage />}
        />

        {/* Fichas de Producto */}
        <Route path="datasheets" element={<DataSheetListPage />} />
        <Route path="datasheets/new" element={<ProductSheetPage />} />
        <Route
          path="datasheets/:datasheetId"
          element={<div className="p-4">Detalle de Ficha (Ver)</div>}
        />
        <Route
          path="datasheets/:datasheetId/edit"
          element={<DataSheetEditPage />}
        />

        {/* Usuarios */}
        <Route path="users" element={<UserListPage />} />
        <Route path="users/new" element={<UserCreatePage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        <Route path="users/:userId/edit" element={<UserEditPage />} />

        {/* Catálogos */}
        <Route path="catalogs" element={<CatalogRestrictionManagementPage />} />
        <Route
          path="catalog-management"
          element={<Navigate to="/catalogs" replace />}
        />
        <Route
          path="catalogs/view-all"
          element={<ViewAllCatalogsPage />}
        />

        {/* Rutas temporales del sidebar */}
        <Route path="soporte" element={<div className="p-4">Soporte TI</div>} />
        <Route
          path="configuracion"
          element={<div className="p-4">Configuración</div>}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}