import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.tsx";
import QuestionsImporter from "./pages/QuestionsImporter.tsx";
import UsersManagement from "./pages/UsersManagement.tsx";
import UserEdit from "./pages/UserEdit.tsx";
import ContestsManagement from "./pages/ContestsManagement.tsx";
import ExamDetails from "./pages/ExamDetails.tsx";

import { AuthProvider } from "./contexts/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Login from "./pages/Login.tsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UsersManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UserEdit />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/concursos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContestsManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/importar"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <QuestionsImporter />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/concursos/provas/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ExamDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
