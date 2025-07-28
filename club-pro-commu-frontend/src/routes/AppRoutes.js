import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PlayerSearchPage from '../pages/PlayerSearchPage';
import ClubSearchPage from '../pages/ClubSearchPage';
import PlayerProfilePage from '../pages/PlayerProfilePage';
import ClubProfilePage from '../pages/ClubProfilePage';
import DiscussionsPage from '../pages/DiscussionsPage';
import CompetitionPage from '../pages/CompetitionPage';
import CompetitionListPage from '../pages/CompetitionListPage';
import CompetitionDetailPage from '../pages/CompetitionDetailPage';
import MesCompetitionsPage from '../pages/MesCompetitionsPage';
import CreateClubPage from '../pages/CreateClubPage';
import CreatePlayerPage from '../pages/CreatePlayerPage';
import MyProfilePage from '../pages/MyProfilePage';
import MyClubsPage from '../pages/MyClubsPage';
import InvitationsPage from '../pages/InvitationsPage';
import NotificationsPage from '../pages/NotificationsPage';
import ErrorPage from '../pages/ErrorPage';
import PlayerRecommendationsPage from '../pages/PlayerRecommendationsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Routes pour les joueurs */}
      <Route path="/recherche-joueur" element={<PlayerSearchPage />} />
      <Route path="/joueurs" element={<PlayerSearchPage />} />
      <Route path="/player/:id" element={<PlayerProfilePage />} />
      <Route path="/joueur/:id" element={<PlayerProfilePage />} />
      <Route path="/recommandations" element={<PlayerRecommendationsPage />} />
      
      {/* Routes pour les clubs */}
      <Route path="/clubs" element={<ClubSearchPage />} />
      <Route path="/club/:id" element={<ClubProfilePage />} />
      <Route path="/creer-club" element={<CreateClubPage />} />
      
      {/* Routes pour les compétitions */}
      <Route path="/competitions" element={<CompetitionListPage />} />
      <Route path="/competitions/creer" element={<CompetitionPage />} />
      <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
      <Route path="/mes-competitions" element={<MesCompetitionsPage />} />
      <Route path="/competition" element={<CompetitionPage />} />
      
      {/* Routes pour le profil utilisateur */}
      <Route path="/mon-profil" element={<MyProfilePage />} />
      <Route path="/compte" element={<MyProfilePage />} />
      <Route path="/mes-clubs" element={<MyClubsPage />} />
      <Route path="/creer-joueur" element={<CreatePlayerPage />} />
      
      {/* Routes pour les invitations et notifications */}
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      
      {/* Routes pour les discussions */}
      <Route path="/discussions" element={<DiscussionsPage />} />
      
      {/* Route d'erreur */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
} 