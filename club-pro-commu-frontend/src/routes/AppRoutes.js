import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PlayerSearchPage from '../pages/PlayerSearchPage';
import PlayerProfilePage from '../pages/PlayerProfilePage';
import PlayerRecommendationsPage from '../pages/PlayerRecommendationsPage';
import ClubSearchPage from '../pages/ClubSearchPage';
import ClubProfilePage from '../pages/ClubProfilePage';
import CompetitionListPage from '../pages/CompetitionListPage';
import CompetitionDetailPage from '../pages/CompetitionDetailPage';
import CompetitionMatchesPage from '../pages/CompetitionMatchesPage';
import CompetitionStatsPage from '../pages/CompetitionStatsPage';
import PaymentSimulationPage from '../pages/PaymentSimulationPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';
import RulesPage from '../pages/RulesPage';

// Pages privées
import AccountPage from '../pages/AccountPage';
import MyProfilePage from '../pages/MyProfilePage';
import CreatePlayerPage from '../pages/CreatePlayerPage';
import MyClubsPage from '../pages/MyClubsPage';
import CreateClubPage from '../pages/CreateClubPage';
import CompetitionPage from '../pages/CompetitionPage';
import CreateCompetitionPage from '../pages/CreateCompetitionPage';
import MesCompetitionsPage from '../pages/MesCompetitionsPage';
import InvitationsPage from '../pages/InvitationsPage';
import NotificationsPage from '../pages/NotificationsPage';
import DiscussionsPage from '../pages/DiscussionsPage';
import DataRights from '../components/DataRights';
import APITest from '../components/APITest';
import AdminPage from '../pages/AdminPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import APITestPage from '../pages/APITestPage';
import SecretAdminPage from '../pages/SecretAdminPage';
import CompetitionTestPage from '../pages/CompetitionTestPage';

// Composants
import MainLayout from '../layouts/MainLayout';
import ErrorPage from '../pages/ErrorPage';

export default function AppRoutes() {

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={
        <MainLayout>
          <HomePage />
        </MainLayout>
      } />
      <Route path="/login" element={
        <MainLayout>
          <LoginPage />
        </MainLayout>
      } />
      <Route path="/register" element={
        <MainLayout>
          <RegisterPage />
        </MainLayout>
      } />
      <Route path="/recherche-joueur" element={
        <MainLayout>
          <PlayerSearchPage />
        </MainLayout>
      } />
      <Route path="/player/:id" element={
        <MainLayout>
          <PlayerProfilePage />
        </MainLayout>
      } />
      <Route path="/recommandations" element={
        <MainLayout>
          <PlayerRecommendationsPage />
        </MainLayout>
      } />
      <Route path="/clubs" element={
        <MainLayout>
          <ClubSearchPage />
        </MainLayout>
      } />
      <Route path="/club/:id" element={
        <MainLayout>
          <ClubProfilePage />
        </MainLayout>
      } />
      <Route path="/competitions" element={
        <MainLayout>
          <CompetitionListPage />
        </MainLayout>
      } />
      <Route path="/competition/:id" element={
        <MainLayout>
          <CompetitionDetailPage />
        </MainLayout>
      } />
      <Route path="/competition/:id/matchs" element={
        <MainLayout>
          <CompetitionMatchesPage />
        </MainLayout>
      } />
      <Route path="/competition/:id/paiement/:clubId" element={
        <PaymentSimulationPage />
      } />
      <Route path="/competition/:id/stats" element={
        <MainLayout>
          <CompetitionStatsPage />
        </MainLayout>
      } />
      <Route path="/competitions/creer" element={
        <MainLayout>
          <CreateCompetitionPage />
        </MainLayout>
      } />
      <Route path="/privacy" element={
        <MainLayout>
          <PrivacyPolicyPage />
        </MainLayout>
      } />
      <Route path="/cgu" element={
        <MainLayout>
          <TermsPage />
        </MainLayout>
      } />
      <Route path="/reglement" element={
        <MainLayout>
          <RulesPage />
        </MainLayout>
      } />


      {/* Routes privées */}
      <Route path="/compte" element={
        <MainLayout>
          <AccountPage />
        </MainLayout>
      } />
      <Route path="/mon-profil" element={
        <MainLayout>
          <MyProfilePage />
        </MainLayout>
      } />
      <Route path="/creer-joueur" element={
        <MainLayout>
          <CreatePlayerPage />
        </MainLayout>
      } />
      <Route path="/mes-clubs" element={
        <MainLayout>
          <MyClubsPage />
        </MainLayout>
      } />
      <Route path="/creer-club" element={
        <MainLayout>
          <CreateClubPage />
        </MainLayout>
      } />
      <Route path="/create-club" element={<Navigate to="/creer-club" replace />} />
      <Route path="/creer-competition" element={
        <MainLayout>
          <CompetitionPage />
        </MainLayout>
      } />
      <Route path="/mes-competitions" element={
        <MainLayout>
          <MesCompetitionsPage />
        </MainLayout>
      } />
      <Route path="/invitations" element={
        <MainLayout>
          <InvitationsPage />
        </MainLayout>
      } />
      <Route path="/notifications" element={
        <MainLayout>
          <NotificationsPage />
        </MainLayout>
      } />
      <Route path="/discussions" element={
        <MainLayout>
          <DiscussionsPage />
        </MainLayout>
      } />
      <Route path="/droits-donnees" element={
        <MainLayout>
          <DataRights />
        </MainLayout>
      } />

      {/* Route d'administration (admin uniquement) */}
      <Route path="/admin" element={
        <MainLayout>
          <AdminPage />
        </MainLayout>
      } />

                  {/* Dashboard administrateur */}
            <Route path="/admin/dashboard" element={
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            } />
            
            {/* Test API */}
            <Route path="/api-test" element={
              <MainLayout>
                <APITestPage />
              </MainLayout>
            } />
            
            {/* Page secrète pour créer un admin */}
            <Route path="/secret-admin-creator" element={
              <MainLayout>
                <SecretAdminPage />
              </MainLayout>
            } />
            
            {/* Page de test des compétitions */}
            <Route path="/competition-test" element={
              <MainLayout>
                <CompetitionTestPage />
              </MainLayout>
            } />
            
            {/* Page de test des compétitions */}
            <Route path="/competition-test" element={
              <MainLayout>
                <CompetitionTestPage />
              </MainLayout>
            } />

      {/* Route de test API (temporaire) */}
      <Route path="/test-api" element={
        <MainLayout>
          <APITest />
        </MainLayout>
      } />

      {/* Route d'erreur */}
      <Route path="*" element={
        <MainLayout>
          <ErrorPage />
        </MainLayout>
      } />
    </Routes>
  );
} 