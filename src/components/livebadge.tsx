const LiveBadge = () => {
  // it should be able to injected inside a sentence like "Share your [LiveBadge] location"
  return (
    <span className="inline-flex items-center gap-1 bg-black/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-black/20 shadow-sm align-middle  transform rotate-342">
      <span className="relative flex h-2.5 w-2.5">
        < span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" ></span >
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
      </span >
      <span className="text-sm font-semibold tracking-wide text-black">
        LIVE
      </span>
    </span >
  )
}

export default LiveBadge