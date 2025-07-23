import { useState, useEffect, useRef } from "react";
import { BsRobot } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { FiVolume2, FiCopy } from "react-icons/fi";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AiPicker = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "👋 Hi! I'm Gemini. How can I help you design your t-shirt?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

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
    setInput("");
    setLoading(true);

    try {
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
                    text: input,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't come up with a response.";

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
          text: "Something went wrong. Please try again later.",
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
      <div className="w-[310px] h-[380px] bg-gray-900 text-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-3 bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-2 rounded-lg">  
              <BsRobot size={16} color="white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Gemini Assistant</h2>
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
                className={`max-w-[80%] p-3 rounded-lg text-sm backdrop-blur-sm ${
                  msg.from === "ai"
                    ? "bg-gray-700 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                <div>{msg.text}</div>
                <div className="flex gap-1 mt-2 justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-xs hover:text-blue-300"
                  >
                    <FiCopy size={12} />
                  </button>
                  {msg.from === "ai" && (
                    <button
                      onClick={() => speakMessage(msg.text)}
                      className="text-xs hover:text-blue-300"
                    >
                      <FiVolume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-400">Gemini is thinking...</div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white resize-none outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-lg ${
                listening
                  ? "bg-red-600 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
            >
              {listening ? <FaMicrophoneSlash size={14} /> : <FaMicrophone size={14} />}
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                !input.trim()
                  ? "bg-gray-600 text-gray-400"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105"
              }`}
            >
              <IoMdSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPicker;
