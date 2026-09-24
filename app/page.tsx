export default function Home() {
  return (
    <div className="relative flex flex-col h-screen w-full items-center justify-center overflow-hidden bg-background gap-5">
      <h1 className="text-3xl font-semibold">Szkoła Jazdy</h1>
      <video
        src="/videos/szkola-jazdy.mp4"
        autoPlay
        loop
        muted
        className="shadow-lg shadow-gray-700 rounded-sm border-4 border-gray-500 "
      />
    </div>
  );
}
