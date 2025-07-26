import { useState, useEffect, useRef } from "react";
import { BsRobot } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { FiVolume2, FiCopy } from "react-icons/fi";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useCustomizer } from "../Dynamiccolour/useCustomizer";
import { Color } from "three";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface Irgb {
  r: number;
  g: number;
  b: number;
}

const AiPicker = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! I'm your T-shirt design specialist. I can help you with colors, styles, and design ideas for your t-shirt. What would you like to create today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Get setColor function from Zustand store inside component
  const setColor = useCustomizer((state) => state.setColor);

  // Enhanced color mapping for t-shirt colors
  const colorMap: Record<string, { r: number; g: number; b: number }> = {
    // Basic colors
    red: { r: 0.8, g: 0.1, b: 0.1 },
    green: { r: 0.1, g: 0.7, b: 0.1 },
    blue: { r: 0.1, g: 0.3, b: 0.8 },
    yellow: { r: 0.9, g: 0.9, b: 0.1 },
    white: { r: 0.95, g: 0.95, b: 0.95 },
    black: { r: 0.05, g: 0.05, b: 0.05 },
    purple: { r: 0.6, g: 0.2, b: 0.8 },
    orange: { r: 0.9, g: 0.5, b: 0.1 },
    pink: { r: 0.9, g: 0.4, b: 0.6 },
    
    // Extended clothing colors
    navy: { r: 0.0, g: 0.0, b: 0.5 },
    maroon: { r: 0.5, g: 0.0, b: 0.0 },
    teal: { r: 0.0, g: 0.5, b: 0.5 },
    lime: { r: 0.5, g: 1.0, b: 0.0 },
    cyan: { r: 0.0, g: 1.0, b: 1.0 },
    magenta: { r: 1.0, g: 0.0, b: 1.0 },
    gray: { r: 0.5, g: 0.5, b: 0.5 },
    grey: { r: 0.5, g: 0.5, b: 0.5 },
    brown: { r: 0.6, g: 0.3, b: 0.1 },
    beige: { r: 0.9, g: 0.8, b: 0.7 },
    ivory: { r: 1.0, g: 1.0, b: 0.9 },
    coral: { r: 1.0, g: 0.5, b: 0.3 },
    salmon: { r: 0.98, g: 0.5, b: 0.45 },
    gold: { r: 1.0, g: 0.84, b: 0.0 },
    silver: { r: 0.75, g: 0.75, b: 0.75 },
    khaki: { r: 0.76, g: 0.69, b: 0.57 },
    mint: { r: 0.6, g: 0.98, b: 0.6 },
    lavender: { r: 0.9, g: 0.9, b: 0.98 },
    
    // Fashion/style colors
    neutral: { r: 0.7, g: 0.7, b: 0.65 },
    vintage: { r: 0.7, g: 0.6, b: 0.5 },
    pastel: { r: 0.85, g: 0.9, b: 0.95 },
    neon: { r: 0.0, g: 1.0, b: 0.5 },
    midnight: { r: 0.05, g: 0.05, b: 0.15 },
    cream: { r: 0.98, g: 0.95, b: 0.9 },
    charcoal: { r: 0.2, g: 0.2, b: 0.2 },
    burgundy: { r: 0.5, g: 0.0, b: 0.13 },
    forest: { r: 0.13, g: 0.55, b: 0.13 },
    royal: { r: 0.25, g: 0.41, b: 0.88 },
  };

  
  const isClothingRelated = (text: string): boolean => {
    const clothingKeywords = [
      // Direct clothing terms
      'tshirt', 't-shirt', 'shirt', 'clothing', 'apparel', 'wear', 'garment',
      'fashion', 'style', 'outfit', 'design', 'fabric', 'material', 'textile',
      
      // Colors (always relevant for clothing)
      'color', 'colour', 'red', 'blue', 'green', 'yellow', 'purple', 'pink',
      'orange', 'black', 'white', 'gray', 'grey', 'brown', 'navy', 'maroon',
      'teal', 'cyan', 'magenta', 'beige', 'coral', 'gold', 'silver', 'mint',
      'lavender', 'khaki', 'burgundy', 'charcoal', 'cream', 'ivory',
      
      // Style terms
      'casual', 'formal', 'vintage', 'modern', 'trendy', 'classic', 'retro',
      'minimalist', 'bold', 'subtle', 'bright', 'dark', 'light', 'vibrant',
      'muted', 'pastel', 'neon', 'neutral', 'warm', 'cool',
      
      // Design terms
      'print', 'pattern', 'logo', 'graphic', 'text', 'image', 'artwork',
      'design', 'customize', 'personalize', 'brand', 'slogan',
      
      // Occasions/purposes
      'casual', 'work', 'party', 'event', 'summer', 'winter', 'spring', 'fall',
      'gym', 'sports', 'workout', 'beach', 'travel',
      
      // Fit and comfort
      'fit', 'size', 'comfort', 'soft', 'cotton', 'polyester', 'blend',
      
      // Actions
      'change', 'make', 'create', 'design', 'customize', 'modify', 'alter',
      'switch', 'try', 'pick', 'choose', 'select', 'suggest', 'recommend'
    ];

    const lowerText = text.toLowerCase();
    return clothingKeywords.some(keyword => lowerText.includes(keyword));
  };

  
  const generateClothingPrompt = (userInput: string): string => {
    const isRelated = isClothingRelated(userInput);
    
    if (!isRelated) {
      return `The user said: "${userInput}"

This doesn't seem to be related to t-shirt design, clothing, or fashion. Please politely redirect them back to t-shirt design topics.

Respond with something like: "I'm specifically designed to help with t-shirt design and clothing! I can help you with colors, styles, design ideas, or fashion advice for your t-shirt. What would you like to know about t-shirt design?"

Keep it friendly but redirect them to clothing/fashion topics.`;
    }

    return `You are a professional t-shirt design and fashion consultant. The user said: "${userInput}"

Please respond as an expert in t-shirt design, fashion, and clothing. Focus on:

COLORS: If they mention colors, suggest great color combinations, what colors work well together, seasonal color trends, or colors that suit different occasions.

STYLE ADVICE: Offer fashion advice about t-shirt styles, when to wear certain colors, what looks good together, current trends.

DESIGN IDEAS: Suggest design concepts, themes, or creative ideas for their t-shirt.

OCCASIONS: Help them choose appropriate colors/designs for specific events, seasons, or purposes.

FASHION TIPS: Share knowledge about color psychology in fashion, what colors are trending, or classic combinations.

Guidelines:
- Always mention specific color names clearly in your response so they can be detected and applied
- Be enthusiastic about fashion and design
- Offer 2-3 specific suggestions when possible
- Include practical fashion advice
- Keep responses conversational and helpful
- If they ask for color changes, acknowledge it and explain why it's a good choice

Available colors you can suggest: red, blue, green, yellow, purple, pink, orange, black, white, gray, navy, maroon, teal, coral, gold, silver, mint, lavender, khaki, burgundy, charcoal, cream, ivory, and many more.

Respond now as a fashion expert:`;
  };

  
  const detectAndApplyColor = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    // Try to find color matches
    const colorKeys = Object.keys(colorMap);
    const foundColor = colorKeys.find(color => 
      lowerText.includes(color) || 
      lowerText.includes(`${color} color`) ||
      lowerText.includes(`make it ${color}`) ||
      lowerText.includes(`change to ${color}`) ||
      lowerText.includes(`try ${color}`) ||
      lowerText.includes(`go with ${color}`)
    );

    if (foundColor) {
      const rgb = colorMap[foundColor];
      setColor(new Color(rgb.r, rgb.g, rgb.b));
      return foundColor;
    }

    
    const hexMatch = text.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
    if (hexMatch) {
      const color = new Color(hexMatch[0]);
      setColor(color);
      return hexMatch[0];
    }

    return null;
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg = {
      from: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      
      const detectedColor = detectAndApplyColor(currentInput);

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyDJ30KCzivppBcDJSd09QpZq_7L798JUXY",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: generateClothingPrompt(currentInput),
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      let aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't come up with a response.";

      
      if (!detectedColor && isClothingRelated(currentInput)) {
        const aiDetectedColor = detectAndApplyColor(aiReply);
        if (aiDetectedColor) {
          aiReply += ` 🎨 Applied: ${aiDetectedColor}`;
        }
      } else if (detectedColor) {
        aiReply += ` 🎨 Color applied: ${detectedColor}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: aiReply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Gemini API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Oops! Something went wrong. Let's get back to designing your perfect t-shirt! What color or style are you thinking about?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speakMessage = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-1 right--20 z-50">
      <div className="w-[320px] h-[400px] bg-gray-900 text-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-purple-500/30">
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-800 to-pink-600">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg">
              <BsRobot size={16} color="#7c3aed" />
            </div>
            <div>
              <h2 className="text-sm font-bold">T-Shirt Design Expert</h2>
              <p className="text-xs text-purple-100">Fashion & Color Specialist</p>
            </div>
          </div>
        </div>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-800/70"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.from === "ai" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm backdrop-blur-sm ${
                  msg.from === "ai"
                    ? "bg-gray-700 text-white border-l-2 border-purple-400"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="flex gap-1 mt-2 justify-end opacity-70 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-xs hover:text-purple-300 p-1 rounded hover:bg-gray-600"
                    title="Copy message"
                  >
                    <FiCopy size={12} />
                  </button>
                  {msg.from === "ai" && (
                    <button
                      onClick={() => speakMessage(msg.text)}
                      className="text-xs hover:text-purple-300 p-1 rounded hover:bg-gray-600"
                      title="Read aloud"
                    >
                      <FiVolume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 px-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              Fashion expert is thinking...
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700 bg-gray-900">
                    <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about t-shirt colors, styles, or design ideas..."
                className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white resize-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{ minHeight: '36px', maxHeight: '72px' }}
              />
            </div>
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-lg transition-all ${
                listening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? (
                <FaMicrophoneSlash size={14} />
              ) : (
                <FaMicrophone size={14} />
              )}
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                !input.trim()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg"
              }`}
              title="Send message"
            >
              <IoMdSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPicker;