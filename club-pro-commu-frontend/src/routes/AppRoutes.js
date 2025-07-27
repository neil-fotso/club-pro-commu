import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PlayerSearchPage from '../pages/PlayerSearchPage';
import ClubSearchPage from '../pages/ClubSearchPage';
import PlayerProfilePage from '../pages/PlayerProfilePage';
import ClubProfilePage from '../pages/ClubProfilePage';
import AccountPage from '../pages/AccountPage';
import DiscussionsPage from '../pages/DiscussionsPage';
import CompetitionPage from '../pages/CompetitionPage';
import CreateClubPage from '../pages/CreateClubPage';
import CreatePlayerPage from '../pages/CreatePlayerPage';
import MyProfilePage from '../pages/MyProfilePage';
import MyClubsPage from '../pages/MyClubsPage';
import ErrorPage from '../pages/ErrorPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/joueurs" element={<PlayerSearchPage />} />
      <Route path="/clubs" element={<ClubSearchPage />} />
      <Route path="/joueur/:id" element={<PlayerProfilePage />} />
      <Route path="/club/:id" element={<ClubProfilePage />} />
      <Route path="/compte" element={<MyProfilePage />} />
      <Route path="/discussions" element={<DiscussionsPage />} />
      <Route path="/competition" element={<CompetitionPage />} />
      <Route path="/creer-club" element={<CreateClubPage />} />
      <Route path="/creer-joueur" element={<CreatePlayerPage />} />
      <Route path="/mon-profil" element={<MyProfilePage />} />
      <Route path="/mes-clubs" element={<MyClubsPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
} 