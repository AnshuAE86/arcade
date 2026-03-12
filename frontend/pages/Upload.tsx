
import React, { useState } from 'react';
import { User, GameGenre, Game } from '../types';
import {
  CloudArrowUpIcon,
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { GoogleGenAI, Type } from "@google/genai";
import { useNavigate } from 'react-router-dom';

interface UploadProps {
  user: User | null;
  onUpload: (game: Game) => void;
}

export const Upload: React.FC<UploadProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const [pitch, setPitch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<GameGenre>(GameGenre.ACTION);
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);

  const generateMetadata = async () => {
    if (!pitch) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate arcade game metadata for this idea: ${pitch}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedGenre: { type: Type.STRING }
            },
            required: ["title", "description", "tags"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setTitle(data.title || "");
      setDescription(data.description || "");
      setTags(data.tags?.join(", ") || "");
      if (data.recommendedGenre) {
        const found = Object.values(GameGenre).find(g => g.toLowerCase().includes(data.recommendedGenre.toLowerCase()));
        if (found) setGenre(found);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateThumbnail = async () => {
    if (!title) return;
    setIsImgLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality, professional game thumbnail for an arcade game titled "${title}". Genre: ${genre}. Style: Vibrant, eye-catching, digital art. No text in image.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setThumbnail(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Image Gen Error:", error);
    } finally {
      setIsImgLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !thumbnail) {
      alert("Please fill in at least the title and generate a thumbnail.");
      return;
    }

    // Fix: Added missing weeklyPlays property to satisfy the Game interface requirement.
    const newGame: Game = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      thumbnail,
      genre,
      plays: 0,
      weeklyPlays: 0,
      rating: 5.0,
      creator: user?.name || "Guest",
      creatorId: user?.id || "",
      iframeUrl: "https://www.crazygames.com/embed/polytrack", // placeholder
      tags: tags.split(",").map(t => t.trim()),
      createdAt: new Date().toISOString(),
      isFeatured: false
    };

    onUpload(newGame);
    navigate('/');
  };

  if (!user || user.role !== 'Creator') {
    return (
      <div className="py-20 text-center space-y-6">
        <InformationCircleIcon className="w-20 h-20 text-slate-700 mx-auto" />
        <h1 className="text-3xl font-black font-orbitron">CREATOR ACCESS REQUIRED</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Only verified creators can upload games to VAIBE Arcade. Connect your wallet and apply for creator status in your profile.
        </p>
        <button className="px-8 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl">
          Apply Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black font-orbitron tracking-tighter">SUBMIT YOUR GAME</h1>
        <p className="text-slate-400">Share your creation with the world. Instant deployment, global audience.</p>
      </div>

      <section className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-3xl space-y-6 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-black font-orbitron">AI SPARK ENGINE</h2>
        </div>
        <p className="text-sm text-slate-400">Enter your game concept and let VAIBE generate assets.</p>

        <div className="flex flex-col gap-4">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Describe your game idea... e.g. 'A neon racer with synthwave music.'"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all resize-none min-h-[120px]"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={generateMetadata}
              disabled={isLoading || !pitch}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black transition-all disabled:opacity-50"
            >
              {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
              GENERATE METADATA
            </button>
            <button
              type="button"
              onClick={generateThumbnail}
              disabled={isImgLoading || !title}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black transition-all disabled:opacity-50"
            >
              {isImgLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PhotoIcon className="w-5 h-5" />}
              GENERATE THUMBNAIL
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Game Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as GameGenre)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                >
                  {Object.values(GameGenre).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Tags</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Thumbnail Preview</h3>
            <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
              {thumbnail ? (
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-slate-700" />
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            PUBLISH GAME
          </button>
        </div>
      </div>
    </div>
  );
};
