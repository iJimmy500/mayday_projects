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
import ModeSelect from '../components/lyric-finder/ModeSelect';

import './SongSong.css';

export default function SongSong({ artistName, isGlobal, initialMode }) {
  const { state, actions, refs } = useLyricGame(artistName, isGlobal, initialMode);

  const {
    currentSong, lyrics, snippet, loading, statusMessage, albumArt, prevAlbumArt,
    guess, gameState, trackUrl, currentTime, parsedLyrics, hintLines, hintStartTime, score, attempts,
    startIndex, history, sessionHistory, currentGuesses, settings, showHistory,
    showRoundGuesses, isSearching, isLandingState, customPlaylist, playlistInfo,
    artistImage, isImporting, importUrl, isCrashed, crashReason, isPlaying, isPlayerReady,
    isYoutubeLoading, correctParts, finishChallenge, modeChosen
  } = state;

  const {
    setGuess, setSettings, setShowHistory, setShowRoundGuesses, setIsSearching,
    setIsImporting, setImportUrl, setIsPlaying, setCurrentTime,
    handleGuess, giveUp, startNewRound, resetToRandom, fetchArtistPlaylist,
    handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl,
    handlePlayerReady, handlePlayerError, chooseMode, handlePlaybackEnded
  } = actions;

  const hasAudio = !!(currentSong?.previewUrl || currentSong?.streamUrl || currentSong?.youtubeId);

  const isPlayable = gameState === 'playing' || gameState === 'error';
  const isFinishMode = settings.challengeMode === 'finish';
  const FINISH_LEADIN = 10;
  const answerTime = finishChallenge?.answerTime;

  // Where playback seeks and how long it's capped, by phase + mode:
  //  - Finish, guessing: lead up to the answer line, capped (stops at the line).
  //  - Other modes, guessing: the lyric snippet moment, capped to clip length.
  //  - Finish, revealed: play FROM the answer line (the line they had to guess).
  //  - Other modes, revealed: uncapped from wherever (full song).
  let playbackStartAt = null;
  let capSeconds = null;
  if (isPlayable) {
    if (isFinishMode) {
      playbackStartAt = answerTime != null ? Math.max(0, answerTime - FINISH_LEADIN) : null;
      capSeconds = FINISH_LEADIN;
    } else {
      playbackStartAt = hintStartTime;
      capSeconds = settings.clipLength === 'full' ? null : (settings.clipLength || 10);
    }
  } else if (isFinishMode && answerTime != null) {
    // Reveal: play from the line they had to guess. With auto-skip on, cap it to
    // a short window so it plays the line and a beat more, then advances; with
    // auto-skip off, let it keep playing.
    playbackStartAt = answerTime;
    capSeconds = settings.autoSkip ? 8 : null;
  }

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
        finishChallenge={finishChallenge}
        hintLines={hintLines}
        currentTime={currentTime}
        attempts={attempts} 
        startIndex={startIndex} 
        gameState={gameState} 
        loading={loading} 
        settings={settings}
        statusMessage={statusMessage}
        isPlaying={isPlaying}
      />

      <SyncPlayer
        youtubeId={currentSong?.youtubeId}
        previewUrl={currentSong?.previewUrl}
        currentSong={currentSong}
        isPlaying={isPlaying}
        playerRef={refs.playerRef}
        onTimeUpdate={setCurrentTime}
        onReady={handlePlayerReady}
        onEnded={handlePlaybackEnded}
        onError={handlePlayerError}
        hasSync={state.hasSync}
        startAt={playbackStartAt}
        capSeconds={capSeconds}
      />

      <ControlBar 
        gameState={gameState} 
        loading={loading} 
        guess={guess} 
        onGuessChange={setGuess} 
        onGuessSubmit={handleGuess} 
        onSkip={giveUp} 
        onNext={() => startNewRound()}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onToggleSettings={() => setShowHistory(!showHistory)}
        onToggleGuesses={() => setShowRoundGuesses(!showRoundGuesses)} 
        hasSync={hasAudio}
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
        finishChallenge={finishChallenge}
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

      {!modeChosen && (
        <ModeSelect current={settings.challengeMode} onSelect={chooseMode} />
      )}

      {isCrashed && <CrashScreen reason={crashReason} />}
    </div>
  );
}
