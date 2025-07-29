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
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';

// Pages privées
import AccountPage from '../pages/AccountPage';
import MyProfilePage from '../pages/MyProfilePage';
import CreatePlayerPage from '../pages/CreatePlayerPage';
import MyClubsPage from '../pages/MyClubsPage';
import CreateClubPage from '../pages/CreateClubPage';
import CompetitionPage from '../pages/CompetitionPage';
import MesCompetitionsPage from '../pages/MesCompetitionsPage';
import InvitationsPage from '../pages/InvitationsPage';
import NotificationsPage from '../pages/NotificationsPage';
import DiscussionsPage from '../pages/DiscussionsPage';
import DataRights from '../components/DataRights';
import APITest from '../components/APITest';

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
      <Route path="/competitions/creer" element={
        <MainLayout>
          <CompetitionPage />
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