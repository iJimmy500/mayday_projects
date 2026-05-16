import React from 'react';
import { useLyricGame } from '../hooks/useLyricGame';

import SearchHub from '../components/lyric-finder/SearchHub';
import ControlBar from '../components/lyric-finder/ControlBar';
import LyricView from '../components/lyric-finder/LyricView';
import DashboardModal from '../components/lyric-finder/DashboardModal';
import SyncPlayer from '../components/lyric-finder/SyncPlayer';
import TopNav from '../components/lyric-finder/TopNav';
import ImportBox from '../components/lyric-finder/ImportBox';
import CongratsOverlay from '../components/lyric-finder/CongratsOverlay';
import CrashScreen from '../components/lyric-finder/CrashScreen';

import './LyricFinder.css';

export default function LyricFinder({ artistName, isGlobal }) {
  const { state, actions, refs } = useLyricGame(artistName, isGlobal);

  const {
    currentSong, lyrics, snippet, loading, statusMessage, albumArt, prevAlbumArt,
    guess, gameState, trackUrl, currentTime, parsedLyrics, score, attempts,
    startIndex, history, sessionHistory, currentGuesses, settings, showHistory,
    showRoundGuesses, isSearching, isLandingState, customPlaylist, playlistInfo,
    artistImage, isImporting, importUrl, isCrashed, crashReason, isPlaying, isPlayerReady,
    isYoutubeLoading, correctParts
  } = state;

  const {
    setGuess, setSettings, setShowHistory, setShowRoundGuesses, setIsSearching, 
    setIsImporting, setImportUrl, setIsPlaying, setIsPlayerReady, setCurrentTime,
    handleGuess, giveUp, startNewRound, resetToRandom, fetchArtistPlaylist,
    handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl, handlePlayerError
  } = actions;

  const bgBlur = Math.max(8, 120 - (attempts * 28));
  const bgOpacity = Math.max(0.3, 0.8 - (attempts * 0.12));

  return (
    <div className={`lyric-finder apple-music-style ${loading ? 'am-loading' : ''} ${isSearching ? 'am-searching' : ''}`}>
      <div className="am-background">
        {prevAlbumArt && (
          <div
            className={`am-bg-blur prev ${albumArt ? 'fading' : ''}`}
            style={{ backgroundImage: `url(${prevAlbumArt})`, filter: `blur(${bgBlur}px) scale(1.1)` }}
          />
        )}
        {albumArt && (
          <div
            className="am-bg-blur current"
            style={{ backgroundImage: `url(${albumArt})`, filter: `blur(${bgBlur}px) scale(1.1)` }}
          />
        )}
      </div>

      <div className="am-bg-overlay" style={{ backgroundColor: `rgba(0, 0, 0, ${bgOpacity})`, transition: 'background-color 1.2s ease' }} />

      <TopNav 
        playlistInfo={playlistInfo} 
        customPlaylist={customPlaylist} 
        artistImage={artistImage} 
        onOpenSearch={() => setIsSearching(true)} 
      />

      {isImporting && (
        <ImportBox 
          importUrl={importUrl} 
          onImportUrlChange={setImportUrl} 
          onSubmit={parsePlaylistUrl} 
          onClose={() => setIsImporting(false)} 
        />
      )}

      <SearchHub 
        isOpen={isSearching} 
        isLanding={isLandingState} 
        onClose={() => setIsSearching(false)} 
        onSelectArtist={fetchArtistPlaylist} 
        onSelectGenre={handleSelectGenre} 
        onSelectLocal={handleSelectLocalPlaylist} 
        onImport={parsePlaylistUrl} 
      />

      <LyricView 
        lyrics={lyrics} 
        parsedLyrics={parsedLyrics}
        currentTime={currentTime}
        attempts={attempts} 
        startIndex={startIndex} 
        gameState={gameState} 
        loading={loading} 
        settings={settings} 
        statusMessage={statusMessage} 
      />

      <SyncPlayer
        youtubeId={gameState === 'playing' ? currentSong?.youtubeId : null}
        previewUrl={currentSong?.previewUrl}
        currentSong={currentSong}
        isPlaying={isPlaying}
        playerRef={refs.playerRef}
        onTimeUpdate={(state) => setCurrentTime(state.playedSeconds)}
        onReady={() => setIsPlayerReady(true)}
        onEnded={() => setIsPlaying(false)}
        onError={handlePlayerError}
        hasSync={state.hasSync}
      />

      <ControlBar 
        gameState={gameState} 
        loading={loading} 
        guess={guess} 
        onGuessChange={setGuess} 
        onGuessSubmit={handleGuess} 
        onSkip={giveUp} 
        onNext={startNewRound} 
        onToggleHistory={() => setShowHistory(!showHistory)}
        onToggleSettings={() => setShowHistory(!showHistory)}
        onToggleGuesses={() => setShowRoundGuesses(!showRoundGuesses)} 
        hasSync={!!(currentSong?.previewUrl)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        isYoutubeLoading={isYoutubeLoading}
        isPlayerReady={isPlayerReady}
        showHistory={showHistory} 
        showRoundGuesses={showRoundGuesses} 
        settings={settings} 
        playlistInfo={playlistInfo} 
        currentSong={currentSong} 
        albumArt={albumArt} 
        trackUrl={trackUrl} 
        currentGuesses={currentGuesses} 
        correctParts={correctParts}
      />

      <DashboardModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history} 
        sessionHistory={sessionHistory} 
        settings={settings} 
        setSettings={setSettings} 
        playlistInfo={playlistInfo}
      />

      {gameState === 'congrats' && (
        <CongratsOverlay 
          playlistInfo={playlistInfo} 
          score={score} 
          onReturnHome={resetToRandom} 
        />
      )}

      {isCrashed && <CrashScreen reason={crashReason} />}
    </div>
  );
}
