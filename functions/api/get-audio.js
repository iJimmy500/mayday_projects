import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const artist = searchParams.get('artist');
  const track = searchParams.get('track');

  if (!artist || !track) {
    return new Response(JSON.stringify({ error: "Missing artist or track" }), { 
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    // 1. Search for the song on YouTube
    const query = `${artist} ${track} audio`;
    const r = await yts(query);
    const video = r.videos[0];

    if (!video) {
      return new Response(JSON.stringify({ error: "No video found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 2. Get the direct audio stream URL
    // Note: We use filter 'audioonly' to get the smallest, fastest-loading stream
    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio', 
      filter: 'audioonly' 
    });

    if (!format || !format.url) {
      throw new Error("Could not find a valid audio format");
    }

    return new Response(JSON.stringify({
      videoId: video.videoId,
      audioUrl: format.url,
      title: video.title,
      duration: video.seconds
    }), {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600" // Cache the result for an hour
      }
    });

  } catch (error) {
    console.error("Audio Proxy Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
