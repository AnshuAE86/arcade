
import React, { useState, useEffect, useRef } from 'react';
import { User, GameGenre, Game } from '../types';
import { 
  CloudArrowUpIcon, 
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowPathIcon,
  CommandLineIcon,
  BeakerIcon,
  ChevronLeftIcon,
  CpuChipIcon,
  VariableIcon,
  CubeIcon,
  CheckIcon,
  XMarkIcon as CloseIcon,
  PlayIcon,
  WrenchScrewdriverIcon,
  ArrowUpTrayIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { GoogleGenAI, Type } from "@google/genai";
import { useNavigate, useLocation } from 'react-router-dom';

interface CreatorZoneProps {
  user: User | null;
  onUpload: (game: Game) => void;
}

export const CreatorZone: React.FC<CreatorZoneProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'selection' | 'upload' | 'ai-forge' | 'tingz-beta'>('selection');
  
  // General Form State
  const [pitch, setPitch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<GameGenre>(GameGenre.ACTION);
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [gameUrl, setGameUrl] = useState(""); 
  
  // Asset Management State
  const [assets, setAssets] = useState({
    player: "",
    enemy: "",
    background: ""
  });
  const [assetPrompts, setAssetPrompts] = useState({
    player: "Pixel art spaceship, top down view, transparent background",
    enemy: "Red alien spike monster, pixel art, transparent background",
    background: "Deep space nebula with stars, seamless texture"
  });
  const [loadingAsset, setLoadingAsset] = useState<string | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  
  // Forge Specific State
  const [isForging, setIsForging] = useState(false);
  const [forgeStatus, setForgeStatus] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Beta specific state
  const [betaPrompt, setBetaPrompt] = useState("");
  const [generatedLogic, setGeneratedLogic] = useState("");
  const [isGeneratingLogic, setIsGeneratingLogic] = useState(false);

  useEffect(() => {
    setMode('selection');
  }, [location.key]);

  // --- ASSET HELPERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof assets) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssets(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateGameAsset = async (type: keyof typeof assets) => {
    if (!assetPrompts[type]) return;
    setLoadingAsset(type);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // We use the image model to generate a sprite
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a game asset: ${assetPrompts[type]}. Isolated, high contrast, suitable for a video game sprite/texture. Flat style.` }]
        },
        config: {
          imageConfig: { aspectRatio: type === 'background' ? "16:9" : "1:1" }
        }
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setAssets(prev => ({ ...prev, [type]: `data:image/png;base64,${part.inlineData.data}` }));
          break;
        }
      }
    } catch (error) {
      console.error("Asset Gen Error:", error);
      alert("Failed to generate asset.");
    } finally {
      setLoadingAsset(null);
    }
  };

  // --- END ASSET HELPERS ---

  const generateMetadata = async () => {
    if (!pitch) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate arcade game metadata for this idea: ${pitch}. Be creative and name it something unique.`,
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

  const startForgeProcess = async () => {
    if (!pitch) return;
    setIsForging(true);
    setForgeStatus("Initializing Neural Forge...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Generate Metadata
      setForgeStatus("Synthesizing Concept...");
      const metaResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate arcade game metadata for this idea: ${pitch}. Be creative and name it something unique.`,
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
      
      const metaData = JSON.parse(metaResponse.text || "{}");
      setTitle(metaData.title || "");
      setDescription(metaData.description || "");
      setTags(metaData.tags?.join(", ") || "");
      let detectedGenre = GameGenre.ACTION;
      if (metaData.recommendedGenre) {
        const found = Object.values(GameGenre).find(g => g.toLowerCase().includes(metaData.recommendedGenre.toLowerCase()));
        if (found) {
            setGenre(found);
            detectedGenre = found;
        }
      }

      // 2. Generate Game Code with Assets
      setForgeStatus("Compiling Game Engine (HTML5/Canvas)...");
      
      let assetInjection = "";
      if (assets.player || assets.enemy || assets.background) {
        assetInjection = `
        IMPORTANT: I have provided specific graphical assets. 
        You MUST use the following placeholders in your code for the image sources. 
        DO NOT put the actual Base64 data in the code. I will inject it afterwards.
        
        PLACEHOLDERS TO USE:
        ${assets.player ? `- Player: "__PLAYER_ASSET__"` : ''}
        ${assets.enemy ? `- Enemy: "__ENEMY_ASSET__"` : ''}
        ${assets.background ? `- Background: "__BG_ASSET__"` : ''}
        
        IMPLEMENTATION INSTRUCTIONS:
        1. Define the images at the start:
           const playerImg = new Image();
           playerImg.src = "__PLAYER_ASSET__";
           // etc...
        
        2. Use 'ctx.drawImage(playerImg, ...)' in your draw loop.
        3. Ensure you handle image loading to avoid errors (e.g. check complete property).
        `;
      }

      const codeResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a complete, single-file HTML5 arcade game.
        Concept: ${pitch}
        
        ${assetInjection}

        Requirements:
        - Single HTML file with embedded CSS and JS.
        - Use HTML5 Canvas for rendering.
        - Controls: Arrow Keys or WASD.
        - Visuals: Neon aesthetic, polished arcade feel. 
        - Mechanics: Score system, Game Over screen with Restart button.
        - Make it fun, fast, and responsive.
        
        Output strictly the HTML code. Do not wrap in markdown code blocks.`,
      });
      
      let code = codeResponse.text || "";
      code = code.replace(/```html/g, '').replace(/```/g, '');
      
      // Inject Assets
      if (assets.player) code = code.split('__PLAYER_ASSET__').join(assets.player);
      if (assets.enemy) code = code.split('__ENEMY_ASSET__').join(assets.enemy);
      if (assets.background) code = code.split('__BG_ASSET__').join(assets.background);

      setGeneratedCode(code);
      
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setGameUrl(url);

      // 3. Generate Thumbnail
      setForgeStatus("Rendering Assets...");
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A vibrant, eye-catching, high-quality digital art thumbnail for an arcade game titled "${metaData.title}". Genre: ${detectedGenre}. Stylized, modern gaming aesthetic. No text in image.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });
      
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          setThumbnail(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }

      setForgeStatus("Complete");
    } catch (error) {
      console.error("Forge Error:", error);
      alert("An error occurred during the forge process. Please check console for details.");
    } finally {
      setIsForging(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt || !generatedCode) return;
    setIsRefining(true);

    try {
      // Optimize token usage by stripping out large asset strings
      let codeContext = generatedCode;
      if (assets.player) codeContext = codeContext.split(assets.player).join('__PLAYER_ASSET__');
      if (assets.enemy) codeContext = codeContext.split(assets.enemy).join('__ENEMY_ASSET__');
      if (assets.background) codeContext = codeContext.split(assets.background).join('__BG_ASSET__');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are an expert game developer. 
          The user wants to modify an existing HTML5 game.

          CURRENT CODE (With Asset Placeholders):
          ${codeContext}

          MODIFICATION REQUEST:
          ${refinePrompt}

          INSTRUCTIONS:
          1. Analyze the current code and the request.
          2. Apply the requested changes while maintaining the existing functionality.
          3. PRESERVE the asset placeholders (__PLAYER_ASSET__, etc.) exactly where they are. Do not remove them or try to fill them.
          4. Return the FULL updated HTML code.
          5. Do not wrap in markdown code blocks. Just return the raw HTML.
        `,
      });

      let newCode = response.text || "";
      newCode = newCode.replace(/```html/g, '').replace(/```/g, '');
      
      // Re-Inject Assets
      if (assets.player) newCode = newCode.split('__PLAYER_ASSET__').join(assets.player);
      if (assets.enemy) newCode = newCode.split('__ENEMY_ASSET__').join(assets.enemy);
      if (assets.background) newCode = newCode.split('__BG_ASSET__').join(assets.background);
      
      setGeneratedCode(newCode);
      const blob = new Blob([newCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setGameUrl(url); 
      setRefinePrompt("");
      alert("Game updated successfully!");

    } catch (error) {
      console.error("Refine Error:", error);
      alert("Failed to update game. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const generateThumbnail = async () => {
    if (!title) return;
    setIsImgLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A vibrant, eye-catching, high-quality digital art thumbnail for an arcade game titled "${title}". Genre: ${genre}. Stylized, modern gaming aesthetic. No text in image.` }]
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

  const generateBetaLogic = async () => {
    if (!betaPrompt) return;
    setIsGeneratingLogic(true);
    
    // Call External Webhook as requested
    try {
      await fetch("https://athena-automation.app.n8n.cloud/webhook/VAIBE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          componentId: "neural-sandbox-beta-proto-v1",
          randomNumber: Math.floor(Math.random() * 1000000),
          prompt: betaPrompt,
          userId: user?.id,
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.error("Webhook trigger failed:", webhookError);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Create a detailed technical game logic specification for this experimental mechanic: ${betaPrompt}. Include core variables, player actions, and win/loss conditions. Format as a clean technical doc.`,
      });
      setGeneratedLogic(response.text || "");
    } catch (error) {
      console.error("Logic Gen Error:", error);
    } finally {
      setIsGeneratingLogic(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !thumbnail) {
      alert("Please provide at least a title and generate a thumbnail.");
      return;
    }
    
    const finalUrl = gameUrl || "https://www.crazygames.com/embed/polytrack"; // Fallback/Placeholder

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
      iframeUrl: finalUrl,
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
        <h1 className="text-3xl font-black font-orbitron uppercase">CREATOR ACCESS REQUIRED</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Only verified creators can access the Creator Zone. Connect your wallet or apply for creator status in your profile.
        </p>
        <button onClick={() => navigate('/profile')} className="px-8 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-widest font-orbitron">
          Go to Profile
        </button>
      </div>
    );
  }

  // ... SELECTION MODE ...
  if (mode === 'selection') {
    return (
      <div className="max-w-7xl mx-auto space-y-12 py-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black font-orbitron tracking-tighter uppercase">CREATOR ZONE</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your bridge to the Arcade ecosystem. Select a development protocol to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Traditional Upload */}
          <button 
            onClick={() => setMode('upload')}
            className="group relative p-8 rounded-[40px] bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all text-left space-y-5 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>
            <div className="space-y-5">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <CloudArrowUpIcon className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-orbitron tracking-tight mb-2 uppercase">Upload finished game</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Upload HTML5, Unity, or direct JS builds. Full control over assets and deployment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest pt-4">
              Deploy Build <ChevronLeftIcon className="w-3 h-3 rotate-180" />
            </div>
          </button>

          {/* Tingz Game Forge - UPDATED */}
          <button 
            onClick={() => setMode('ai-forge')}
            className="group relative p-8 rounded-[40px] bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 transition-all text-left space-y-5 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl group-hover:bg-fuchsia-500/10 transition-all"></div>
            <div className="space-y-5">
              <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
                <BeakerIcon className="w-7 h-7 text-fuchsia-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-black font-orbitron tracking-tight uppercase">Forge AI</h2>
                  <span className="px-2 py-0.5 bg-fuchsia-500 text-white text-[9px] font-black rounded uppercase">Studio</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Use AI to generate prompts and code for you - from prompt to playable in minutes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-fuchsia-400 font-black text-[10px] uppercase tracking-widest pt-4">
              Launch Studio <SparklesIcon className="w-3 h-3" />
            </div>
          </button>

          {/* Tingz BETA */}
          <button 
            onClick={() => setMode('tingz-beta')}
            className="group relative p-8 rounded-[40px] bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/50 transition-all text-left space-y-5 overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="space-y-5">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <CpuChipIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-black font-orbitron tracking-tight uppercase">Tingz BETA</h2>
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded uppercase animate-pulse">EXP</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Utilize Tingz Game Forge to design & launch complex Unity games.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest pt-4">
              Enter Lab <VariableIcon className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ... BETA MODE ...
  if (mode === 'tingz-beta') {
    return (
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setMode('selection')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Zone
          </button>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-400">
              Lab Access: Level 7 Required
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black font-orbitron tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            NEURAL SANDBOX
          </h1>
          <p className="text-slate-400">Prototype experimental game mechanics with the Gemini 3 Pro reasoning engine.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <VariableIcon className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-black font-orbitron uppercase">PROMPT FORGE</h2>
              </div>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Mechanic Description</p>
              <textarea 
                value={betaPrompt}
                onChange={(e) => setBetaPrompt(e.target.value)}
                placeholder="e.g. A gravity-shifting combat system where players use sound frequency to deflect projectiles..."
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none"
              />
              <button 
                onClick={generateBetaLogic}
                disabled={isGeneratingLogic || !betaPrompt}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {isGeneratingLogic ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CpuChipIcon className="w-4 h-4" />}
                Run Neural Synthesis
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-[40px] h-[600px] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <CommandLineIcon className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Preview</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto font-mono text-sm">
                {isGeneratingLogic ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-900 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-900 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-900 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-900 rounded w-2/3"></div>
                  </div>
                ) : generatedLogic ? (
                  <div className="text-emerald-400/80 leading-relaxed whitespace-pre-wrap">
                    {generatedLogic}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <CubeIcon className="w-16 h-16 opacity-20" />
                    <p className="uppercase text-[10px] font-black tracking-[0.3em]">Awaiting Input</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ... STANDARD/FORGE MODE ...
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setMode('selection')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Zone
        </button>
        <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">
          {mode === 'ai-forge' ? 'Studio Protocol' : 'Standard Upload'}
        </span>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black font-orbitron tracking-tighter uppercase">
          {mode === 'upload' ? 'Submit Game Build' : 'Forge AI Studio'}
        </h1>
        <p className="text-slate-400">
          {mode === 'upload' 
            ? 'Complete the form below to register your finished game in the Arcade catalog.' 
            : 'Turn your idea into a playable game instantly using our Neural Forge engine.'}
        </p>
      </div>

      {/* FORGE AI WORKFLOW */}
      {mode === 'ai-forge' && (
        <section className="bg-slate-900 border-2 border-fuchsia-500/30 p-8 rounded-3xl space-y-8 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
          
          {/* Step 1: Ideation & Generation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-6 h-6 text-fuchsia-400" />
              <h2 className="text-xl font-black font-orbitron uppercase tracking-tighter">1. Concept Forge</h2>
            </div>
            <textarea 
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Describe your game idea in detail... e.g. 'A physics-based climber where you control a magnetic robot in a junkyard. The goal is to reach the top before the magnet battery runs out.'"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none transition-all resize-none min-h-[100px] text-slate-200"
            />
            
            {/* ASSET MANAGER */}
            <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <PaintBrushIcon className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-sm font-black font-orbitron uppercase tracking-widest">Visual Assets (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['player', 'enemy', 'background'] as const).map((type) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{type} Sprite</label>
                      {assets[type] && (
                        <button onClick={() => setAssets(prev => ({...prev, [type]: ''}))} className="text-slate-500 hover:text-red-400">
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group">
                      {assets[type] ? (
                        <img src={assets[type]} alt={type} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                          {loadingAsset === type ? (
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                          ) : (
                            <PhotoIcon className="w-6 h-6" />
                          )}
                          <span className="text-[9px] uppercase font-bold">No Asset</span>
                        </div>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                         <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase w-full text-center border border-slate-700 text-slate-300">
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, type)} />
                           Upload
                         </label>
                         <button 
                           onClick={() => generateGameAsset(type)}
                           disabled={loadingAsset === type}
                           className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-[10px] font-bold uppercase w-full text-center text-white"
                         >
                           Generate AI
                         </button>
                      </div>
                    </div>

                    <input 
                      type="text"
                      value={assetPrompts[type]}
                      onChange={(e) => setAssetPrompts(prev => ({...prev, [type]: e.target.value}))}
                      placeholder={`Describe ${type}...`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-fuchsia-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="button"
              onClick={startForgeProcess}
              disabled={isForging || !pitch}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-lg shadow-fuchsia-500/20"
            >
              {isForging ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CommandLineIcon className="w-5 h-5" />}
              {isForging ? forgeStatus : "FORGE GAME ENGINE"}
            </button>
          </div>

          {/* Step 2: Handoff / Result */}
          {gameUrl && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="h-px bg-slate-800 w-full"></div>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className="w-6 h-6 text-fuchsia-400" />
                      <h2 className="text-xl font-black font-orbitron uppercase tracking-tighter">2. Game Generated</h2>
                    </div>
                    <span className="text-xs text-green-400 font-bold uppercase flex items-center gap-1">
                      <CheckIcon className="w-4 h-4" /> Ready to Play
                    </span>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4">
                   <a 
                     href={gameUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-fuchsia-500/10 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white rounded-2xl font-black transition-all uppercase text-xs tracking-widest group"
                   >
                     Preview Game <PlayIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                   </a>
                   <div className="flex-1 space-y-2">
                     <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          value={gameUrl}
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-sm focus:ring-1 focus:ring-fuchsia-500/50 outline-none text-slate-400"
                        />
                     </div>
                   </div>
                 </div>
                 <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest">
                   Note: This generated URL is temporary. Publish below to save it to the catalog.
                 </p>

                 {/* REFINEMENT SECTION */}
                 <div className="mt-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-fuchsia-400" />
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Iterate & Polish</h3>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={refinePrompt}
                            onChange={(e) => setRefinePrompt(e.target.value)}
                            placeholder="e.g. Make the player move faster, change background to blue..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-fuchsia-500/50 outline-none text-slate-200 placeholder-slate-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                        />
                        <button 
                            onClick={handleRefine}
                            disabled={isRefining || !refinePrompt}
                            className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isRefining ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <WrenchScrewdriverIcon className="w-4 h-4" />}
                            {isRefining ? "Refining..." : "Update"}
                        </button>
                    </div>
                </div>

               </div>
            </div>
          )}
        </section>
      )}

      {mode === 'upload' && (
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <InformationCircleIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-sm text-slate-400">Provide an iframe URL for your hosted game or a direct link to your WebGL build folder.</p>
         </div>
      )}

      {/* METADATA FORM (Shared) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Catalog Metadata</h3>
               {mode === 'ai-forge' && (
                 <button onClick={generateMetadata} disabled={isLoading} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold uppercase flex items-center gap-1">
                   <ArrowPathIcon className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
                 </button>
               )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Game Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                placeholder="e.g. Neon Drift 3000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe mechanics, story, and controls..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Genre</label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as GameGenre)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                >
                  {Object.values(GameGenre).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tags</label>
                <input 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  type="text" 
                  placeholder="3D, Fast, Retro..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>
            {mode === 'upload' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Iframe URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="url" 
                    value={gameUrl}
                    onChange={(e) => setGameUrl(e.target.value)}
                    placeholder="https://example.com/your-game"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Identity</h3>
            <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative group">
              {thumbnail ? (
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-slate-700" />
              )}
              {isImgLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            {/* Thumbnail Generator Button */}
            <button 
              onClick={generateThumbnail}
              disabled={!title}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4" /> {thumbnail ? 'Regenerate' : 'Generate AI Thumbnail'}
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            className={`w-full py-5 text-white font-black rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${
              mode === 'ai-forge' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-fuchsia-500/20' 
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/20'
            }`}
          >
            <RocketLaunchIcon className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            {mode === 'upload' ? 'PUBLISH BUILD' : 'PUBLISH'}
          </button>
          
          <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest px-4">
            By publishing, you agree to the Creator Revenue Share Program and Content Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
