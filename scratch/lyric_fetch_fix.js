  const fetchAlbumArt = useCallback(async (artist, track, ytId, rid) => {
    const cleanTerm = (str) => str.replace(/\(.*\)/g, '').replace(/feat\..*/gi, '').replace(/ft\..*/gi, '').trim();
    const query = `${cleanTerm(artist)} ${cleanTerm(track)}`;
    
    try {
      let response = await axios.get(`/api-itunes/search?term=${encodeURIComponent(query)}&limit=1&entity=song`, { timeout: 5000 });
      
      if (rid !== lastRequestId.current) return;

      if (!response.data.results || response.data.results.length === 0) {
        const fallbackQuery = `${artist.split(',')[0]} ${track.split('(')[0]}`;
        response = await axios.get(`/api-itunes/search?term=${encodeURIComponent(fallbackQuery)}&limit=1&entity=song`, { timeout: 5000 });
      }

      if (response.data.results && response.data.results[0]) {
        const art = response.data.results[0].artworkUrl100.replace('100x100bb', '1000x1000bb');
        setAlbumArt(art);
        setTrackUrl(response.data.results[0].trackViewUrl);
        setPreviewUrl(response.data.results[0].previewUrl);
      }
    } catch (err) {
      console.error("Album art fetch failed", err);
    }
  }, []);

  const fetchLyrics = useCallback(async (randomSong, rid) => {
    try {
      const { data } = await axios.get(`/api-lyrics/api/search?artist_name=${encodeURIComponent(randomSong.artist)}&track_name=${encodeURIComponent(randomSong.track)}`);

      if (rid !== lastRequestId.current) return;

      if (data && data.length > 0) {
        const synced = data[0].syncedLyrics;
        const plain = data[0].plainLyrics;
        
        const cleanLrc = (l) => l ? l.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim() : '';
        const fullLyrics = plain || cleanLrc(synced);
        
        setLyrics(fullLyrics);
        setStatusMessage('');

        if (synced) {
          const lines = synced.split('\n');
          const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/;
          const timestampGlobalRegex = /\[\d+:\d+(?:\.\d+)?\]/g;
          
          const parsed = lines.map(line => {
            const match = timeRegex.exec(line);
            if (match) {
              const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
              return { time, text: line.replace(timestampGlobalRegex, '').trim() };
            }
            return null;
          }).filter(l => l && l.text);
          
          setParsedLyrics(parsed);

          // ONLY FETCH YOUTUBE IF SYNCED
          if (!youtubeId) {
            const cacheKey = `yt_cache_${randomSong.artist}_${randomSong.track}`.toLowerCase().replace(/\s+/g, '_');
            const cachedId = localStorage.getItem(cacheKey);
            if (cachedId) {
              setYoutubeId(cachedId);
              setYoutubeStatus('YouTube Linked (Cached)');
            } else {
              setIsYoutubeLoading(true);
              setYoutubeStatus('Searching YouTube...');
              try {
                const ytResponse = await axios.get(`/api-youtube/search?q=${encodeURIComponent(`${randomSong.artist} ${randomSong.track} official audio`)}`, { timeout: 5000 });
                if (ytResponse.data && ytResponse.data.videoId) {
                  setYoutubeId(ytResponse.data.videoId);
                  setYoutubeStatus('YouTube Linked');
                  localStorage.setItem(cacheKey, ytResponse.data.videoId);
                } else {
                  setYoutubeStatus('YouTube Search Failed');
                }
              } catch (err) {
                setYoutubeStatus(`YouTube Error: ${err.message}`);
              } finally {
                setIsYoutubeLoading(false);
              }
            }
          }
        } else {
          setParsedLyrics([]);
          setYoutubeId(null);
          setYoutubeStatus('No Sync Available');
        }

        const coreTitle = randomSong.track.toLowerCase()
          .replace(/\(.*\)/g, '')
          .replace(/feat\..*/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim();

        const lines = fullLyrics.split('\n').filter(l => {
          const cleanL = l.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          const isSpoiler = cleanL.includes(coreTitle);
          return l.trim().length > 10 && !isSpoiler;
        });

        if (lines.length > 1) {
          const sIndex = Math.floor(Math.random() * Math.max(1, lines.length - 5));
          setStartIndex(sIndex);
          setSnippet(lines[sIndex]);
        } else {
          const fallbackLines = fullLyrics.split('\n').filter(l => l.trim().length > 10);
          const sIndex = Math.floor(Math.random() * Math.max(1, fallbackLines.length - 5));
          setStartIndex(sIndex);
          setSnippet(fallbackLines[sIndex]);
        }
        setLoading(false);
      } else {
        handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
      }
    } catch (err) {
      console.error("Failed to fetch lyrics:", err);
      if (rid === lastRequestId.current) handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
    }
  }, []);
