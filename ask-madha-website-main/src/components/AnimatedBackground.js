"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px] animate-float"
        style={{
          background:
            "radial-gradient(circle, var(--gradient-from) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[700px] w-[700px] rounded-full opacity-25 blur-[120px] animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, var(--gradient-via) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full opacity-20 blur-[90px] animate-float"
        style={{
          animationDelay: "2s",
          background:
            "radial-gradient(circle, var(--gradient-to) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
