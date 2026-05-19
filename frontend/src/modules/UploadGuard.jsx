import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Crosshair, AlertTriangle, Fingerprint, Lock, Download } from "lucide-react";
import { useToast } from "../context/ToastContext";

const SCAN_PROTOCOLS = [
  { id: "exif", label: "EXIF Metadata Purge", duration: 1200 },
  { id: "telemetry", label: "Stripping Telemetry", duration: 1600 },
  { id: "deepfake", label: "Deepfake Neural Analysis", duration: 2200 },
  { id: "hash", label: "Binary Hash Verification", duration: 1400 },
];

export default function UploadGuard() {
  const { showToast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [protocolProgress, setProtocolProgress] = useState({});
  const [gpsFound, setGpsFound] = useState(false);
  const [realGps, setRealGps] = useState("");
  const [deepfake, setDeepfake] = useState(null);
  const [protectedUrl, setProtectedUrl] = useState(null);
  const [finalFilename, setFinalFilename] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runProtocolAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const initial = {};
    SCAN_PROTOCOLS.forEach((p) => { initial[p.id] = 0; });
    setProtocolProgress(initial);

    let offset = 0;
    SCAN_PROTOCOLS.forEach((protocol) => {
      const startId = setTimeout(() => {
        setProtocolProgress((prev) => ({ ...prev, [protocol.id]: 30 }));
      }, offset);
      timersRef.current.push(startId);

      const midId = setTimeout(() => {
        setProtocolProgress((prev) => ({ ...prev, [protocol.id]: 70 }));
      }, offset + protocol.duration * 0.4);
      timersRef.current.push(midId);

      const endId = setTimeout(() => {
        setProtocolProgress((prev) => ({ ...prev, [protocol.id]: 100 }));
      }, offset + protocol.duration);
      timersRef.current.push(endId);

      offset += protocol.duration * 0.85;
    });
  };

 const handleDrop = async (e) => {

<<<<<<< HEAD
  e.preventDefault();
=======
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setAnalyzing(true);
    setAnalyzed(false);
    setDeepfake(null);
    setGpsFound(false);
    setRealGps("");
    setProtectedUrl(null);
    setFinalFilename(null);
    runProtocolAnimation();
>>>>>>> b1235906b8af5fb73d0085ae190c9cd6125fc419

  setDragging(false);

<<<<<<< HEAD
  const selectedFile =

    e.dataTransfer?.files?.[0]

    ||

    e.target.files?.[0];

  if (!selectedFile) return;


  if (previewUrl)

    URL.revokeObjectURL(
      previewUrl
    );


  setFile(
    selectedFile
  );

  setPreviewUrl(

    URL.createObjectURL(
      selectedFile
    )

  );


  // RESET

  setAnalyzing(true);

  setAnalyzed(false);

  setDeepfake(null);

  setGpsFound(false);

  setGpsRemoved(false);

  setRealGps("");

  setProtectedUrl(null);

  setFinalFilename(null);


  const formData =
    new FormData();

  formData.append(
    "file",
    selectedFile
  );


  try {

    const token =

      localStorage.getItem(
        "token"
      );


    const response =

      await axios.post(

        "http://127.0.0.1:8000/upload",

        formData,

        {
          headers: {

            Authorization:

            `Bearer ${token}`,

            "Content-Type":

            "multipart/form-data"
          }
        }
      );


    const data =
      response.data;


    console.log(
      "UPLOAD RESPONSE:",
      data
    );


    // GPS

    if (data.gps) {

      setGpsFound(
        true
      );

      setRealGps(
        data.gps
      );

=======
    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData);
      const data = response.data;
      if (data.gps) { setGpsFound(true); setRealGps(data.gps); }
      if (data.ai_results) setDeepfake(data.ai_results);
      if (data.protected_url) setProtectedUrl(data.protected_url);
      if (data.final_filename) setFinalFilename(data.final_filename);
      setAnalyzing(false);
      setAnalyzed(true);
      showToast("Neural scan complete — file sanitized.", "success");
    } catch {
      setAnalyzing(false);
      timersRef.current.forEach(clearTimeout);
      showToast("Security alert: Backend connection failed.", "alert");
>>>>>>> b1235906b8af5fb73d0085ae190c9cd6125fc419
    }


    setGpsRemoved(

      data.gps_removed

      ||

      false
    );


    // DEEPFAKE

    if (

      data.ai_results

    ) {

      setDeepfake(

        data.ai_results
      );

    }


    // DOWNLOAD

    if (

      data.protected_url

    ) {

      setProtectedUrl(

        data.protected_url
      );

    }


    if (

      data.final_filename

    ) {

      setFinalFilename(

        data.final_filename
      );

    }


    // FORCE UI UPDATE

    setAnalyzing(
      false
    );

    setAnalyzed(
      true
    );

  }

  catch (error) {

    console.log(
      error
    );

    showToast(

      "Upload failed",

      "error"
    );

    setAnalyzing(
      false
    );

    setAnalyzed(
      false
    );

  }

};

  const PrivacyGauge = ({ score }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score > 70 ? "var(--danger-red)" : score > 40 ? "var(--warning-orange)" : "var(--neon-teal)";
    return (
      <div className="relative w-[90px] h-[90px] flex items-center justify-center">
        <svg width="90" height="90" className="-rotate-90">
          <circle cx="45" cy="45" r={radius} stroke="#1e293b" strokeWidth="6" fill="transparent" />
          <circle cx="45" cy="45" r={radius} stroke={color} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        </svg>
        <motion.div className="absolute text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <div className="mono text-lg font-bold" style={{ color }}>{score}%</div>
          <div className="text-[9px] text-slate-500 tracking-widest">RISK</div>
        </motion.div>
      </div>
    );
  };

  const riskScore = deepfake ? Math.round(deepfake.score * 100) : (gpsFound ? 65 : 15);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
        <Crosshair size={22} className="text-[#2dd4bf]" />
        <div>
          <h3 className="text-lg font-bold tracking-widest text-white">NEURAL PROTECTION INTERFACE</h3>
          <p className="text-xs text-slate-500 mono mt-1">Deepfake / EXIF sandbox · local processing only</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div layout className="glass-card glass-card-mint flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <Fingerprint size={20} className="text-[#2dd4bf]" />
            <span className="text-sm font-semibold tracking-widest text-white">SCANNER VIEWPORT</span>
          </div>

<<<<<<< HEAD
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Drop zone */}
        <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF" }}>
          <div style={cardTitle(t)}><span style={dot(t.amber)} />PRE-FLIGHT SANITIZER</div>

          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: "block",
              marginTop: 16,
              border: `2px dashed ${dragging ? t.green : t.borderMid}`,
              borderRadius: 12,
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s",
              background: dragging ? `${t.green}0a` : "transparent"
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleDrop}
              style={{ display: "none" }}
            />

            {previewUrl ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, objectFit: "contain" }} />
                <div style={{ color: t.textDim, fontSize: 11, fontFamily: "'Courier New', monospace" }}>
                  {file?.name}
                </div>
              </div>
            ) : (
              <div style={{ padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: t.textDim }}>⬡</div>
                <div style={{ color: t.textDim, fontSize: 13 }}>
                  Drop photo here to analyze
                </div>
                <div style={{ color: t.textFaint, fontSize: 11, marginTop: 4 }}>
                  GPS will be stripped and image cloaked automatically
                </div>
              </div>
            )}
          </label>

          {analyzing && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: t.textMid, marginBottom: 10 }}>
                Processing your photo…
              </div>

              {CHECKS.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: t.green, animation: `grow ${0.6 + i * 0.3}s ease-out forwards`, width: 0 }} />
                  </div>

                  <span style={{ fontSize: 10, color: t.textDim, width: 160, textAlign: "right" }}>
                    {check}
                  </span>
=======
          <div className="p-6 flex-1 flex flex-col">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex-1 min-h-[280px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                dragging ? "border-[#2dd4bf] bg-[#2dd4bf]/10" : "border-slate-800 bg-[#121c2a]/80 hover:border-[#2dd4bf]/40"
              }`}
            >
              <input type="file" accept="image/*" onChange={handleDrop} className="hidden" />
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-60 rounded-lg object-contain z-10" />
                  {analyzing && <div className="animate-scan-line z-20" />}
                </>
              ) : (
                <div className="text-center p-8">
                  <Fingerprint size={48} className="text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-300 font-medium mb-2">Drop target imagery here</p>
                  <p className="text-xs text-slate-500 mono">Initialize deepfake &amp; EXIF neural scan</p>
>>>>>>> b1235906b8af5fb73d0085ae190c9cd6125fc419
                </div>
              )}
            </label>

<<<<<<< HEAD
        {/* Results */}

<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

  {(analyzed || protectedUrl || deepfake) ? (

    <>

      <div style={{
        ...card(t),

        border: `1px solid ${t.green}`,

        background: cardBg(t.green)
      }}>

        <div style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "flex-start",

          gap: 12
        }}>

          <div style={{ flex: 1 }}>

            <div style={cardTitle(t)}>

              <span style={dot(t.green)} />

              PHOTO PROTECTION

            </div>

            <div style={{
              fontSize: 11,

              color: t.textDim,

              marginTop: 6,

              marginBottom: 10,

              lineHeight: 1.6
            }}>

              GPS stripped and image cloaked.

            </div>

            {gpsFound && realGps && (

              <div style={{
                fontSize: 10,

                color: t.textFaint,

                marginTop: 8
              }}>

                Location Removed:

                📍 {realGps}

              </div>

            )}

          </div>

          {protectedUrl && (

            <a

              href={protectedUrl}

              download={

                finalFilename

                ||

                "protected-image.jpg"

              }

              style={{

                ...actionBtn(t.green),

                textDecoration:

                "none"

              }}

            >

              DOWNLOAD

            </a>

=======
            <AnimatePresence>
              {analyzing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
                  <motion.div className="flex items-center gap-3 text-[#2dd4bf] text-sm tracking-wide">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-4 h-4 rounded-full border-2 border-dashed border-[#2dd4bf]" />
                    NEURAL NETWORK ANALYZING…
                  </motion.div>
                  {SCAN_PROTOCOLS.map((protocol, i) => (
                    <motion.div key={protocol.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="space-y-1.5">
                      <div className="flex justify-between mono text-[11px]">
                        <span className="text-slate-400">{protocol.label.toUpperCase()}</span>
                        <span className="text-[#2dd4bf]">{protocolProgress[protocol.id] || 0}%</span>
                      </div>
                      <motion.div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          className="h-full bg-[#2dd4bf] rounded-full"
                          style={{ boxShadow: "0 0 8px rgba(45,212,191,0.5)" }}
                          animate={{ width: `${protocolProgress[protocol.id] || 0}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {analyzed ? (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4" style={{ borderTopColor: riskScore > 70 ? "var(--danger-red)" : "var(--neon-teal)" }}>
                <div className="flex items-center gap-6">
                  <PrivacyGauge score={riskScore} />
                  <div>
                    <h3 className="text-lg text-white mb-2 flex items-center gap-2">
                      {riskScore > 70 ? <AlertTriangle size={20} className="text-rose-500" /> : <ShieldCheck size={20} className="text-[#2dd4bf]" />}
                      SECURITY AUDIT COMPLETE
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {riskScore > 70 ? "High risk elements detected. Immediate purging recommended." : "Threat level acceptable. Defensive measures applied."}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 bg-[#121c2a]/60">
                  <div className="text-xs font-bold tracking-widest text-amber-500 mb-4 border-b border-white/5 pb-2">PRIVACY TRIGGERS</div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    {gpsFound && <li><span className="text-rose-500 mr-2">⨯</span>EXIF Location: {realGps}</li>}
                    {deepfake?.is_deepfake && <li><span className="text-rose-500 mr-2">⨯</span>AI Manipulation Detected</li>}
                    {!gpsFound && !deepfake?.is_deepfake && <li className="text-slate-500">No critical triggers.</li>}
                  </ul>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5 bg-[#121c2a]/60">
                  <motion.div className="text-xs font-bold tracking-widest text-[#2dd4bf] mb-4 border-b border-white/5 pb-2">DEFENSE PLAN</motion.div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    <li><span className="text-[#2dd4bf] mr-2">✓</span>Metadata Stripped</li>
                    <li><span className="text-[#2dd4bf] mr-2">✓</span>Adversarial Noise Added</li>
                  </ul>
                </motion.div>
              </div>

              <motion.button
                onClick={(e) => {
                  if (protectedUrl) {
                    const a = document.createElement("a");
                    a.href = protectedUrl;
                    a.download = finalFilename || "protected-image.jpg";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } else {
                    showToast("Protected file is being prepared. Please try again.", "alert");
                  }
                }}
                disabled={!protectedUrl}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: protectedUrl ? 1.02 : 1 }}
                className={`flex items-center justify-center gap-3 py-4 px-8 font-bold tracking-widest text-sm rounded-lg transition-all ${
                  protectedUrl 
                    ? "bg-[#2dd4bf] text-slate-900 cursor-pointer shadow-lg hover:shadow-xl" 
                    : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                }`}
              >
                <Download size={30} strokeWidth={2.5} />
                <span>EXECUTE PURGE &amp; SECURE DOWNLOAD</span>
              </motion.button>
            </>
          ) : !analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col items-center justify-center min-h-[380px] gap-4 text-center bg-[#121c2a]/60">
              <Lock size={48} className="text-slate-800" />
              <p className="text-sm font-bold tracking-[0.2em] text-slate-500">AWAITING DATA</p>
              <p className="text-xs text-slate-600 max-w-[220px]">Upload imagery to initialize security audit and cloaking protocols</p>
            </motion.div>
>>>>>>> b1235906b8af5fb73d0085ae190c9cd6125fc419
          )}

        </div>

      </div>


      {deepfake && (

        <div style={{

          ...card(t),

          border:

          `1px solid ${deepfakeColor()}`,

          background:

          cardBg(

            deepfakeColor()

          )

        }}>

          <div style={cardTitle(t)}>

            <span style={dot(

              deepfakeColor()

            )} />

            DEEPFAKE ANALYSIS

          </div>

          <div style={{

            marginTop: 8,

            color:

            deepfakeColor()

          }}>

            {

              deepfake.is_deepfake

              ?

              `Likely manipulated (${(deepfake.score * 100).toFixed(1)}%)`

              :

              `Looks real (${(deepfake.score * 100).toFixed(1)}%)`

            }

          </div>

        </div>

      )}

    </>

  ) : (

    <div style={{

      ...card(t),

      display: "flex",

      justifyContent: "center",

      alignItems: "center",

      minHeight: 300,

      flexDirection: "column"

    }}>

      AWAITING DATA

    </div>

  )}

</div>
      </div>
    </motion.div>
  );
}
