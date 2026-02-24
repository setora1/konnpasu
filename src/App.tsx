/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { TournamentView } from './pages/TournamentView';
import { MatchInput } from './pages/MatchInput';
import { useStore } from './store';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { currentUserRole } = useStore();
  if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/admin/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/tournament/:id" element={<TournamentView />} />
        <Route path="/match/:tournamentId/:matchId" element={<MatchInput />} />
      </Routes>
    </BrowserRouter>
  );
}
