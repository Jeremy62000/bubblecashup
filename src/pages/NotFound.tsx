import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col text-white"
      style={{
        background:
          "radial-gradient(130% 90% at 50% -12%, #4c1d95 0%, #2e1065 44%, #19063a 100%)",
      }}
    >

      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-5xl mx-auto relative px-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h1 className="text-5xl font-black text-fuchsia-400 mb-4">404</h1>
              <p className="text-lg text-violet-300/70">Bulle introuvable… 🫧</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
