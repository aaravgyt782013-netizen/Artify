import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true,
});

export const Home = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>);
export const Search = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.74 4.74-1.41 1.41-4.74-4.74A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/></svg>);
export const Library = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 3h2v18H4zm5 0h2v18H9zm4.6.7 1.9-.6 5.4 17.2-1.9.6z"/></svg>);
export const Play = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>);
export const Pause = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>);
export const Next = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 5.2v13.6a.8.8 0 0 0 1.2.7L16 13v5.5h2.5v-13H16V11L6.2 4.5a.8.8 0 0 0-1.2.7z"/></svg>);
export const Prev = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M19 5.2v13.6a.8.8 0 0 1-1.2.7L8 13v5.5H5.5v-13H8V11l9.8-6.5a.8.8 0 0 1 1.2.7z"/></svg>);
export const Shuffle = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M17 3l4 4-4 4V8h-2.2l-3.1 4 3.1 4H17v-3l4 4-4 4v-3h-3.2l-3.6-4.7L6.6 18H3v-2h2.6l3.1-4-3.1-4H3V6h3.6l3.6 4.7L13.8 6H17z"/></svg>);
export const Repeat = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>);
export const Heart = ({ size, ...p }: P) => (<svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={2} {...p}><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 4 4.5 7.4 4.5c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.4 0 5.8 3.3 4.6 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>);
export const HeartFilled = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 4 4.5 7.4 4.5c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.4 0 5.8 3.3 4.6 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>);
export const Volume = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 9v6h4l5 4V5L7 9zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>);
export const Mute = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 9v6h4l5 4V5L7 9zm18.4 0L20 7.6l-3 3-3-3L12.6 9l3 3-3 3 1.4 1.4 3-3 3 3 1.4-1.4-3-3z"/></svg>);
export const Queue = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 5h14v2H3zm0 6h14v2H3zm0 6h9v2H3zm13-1.5V21l5-2.75z"/></svg>);
export const Plus = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg>);
export const More = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>);
export const Back = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M15.5 4 7.5 12l8 8 1.4-1.4L10.3 12l6.6-6.6z"/></svg>);
export const Forward = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m8.5 4 8 8-8 8-1.4-1.4 6.6-6.6-6.6-6.6z"/></svg>);
export const Clock = ({ size, ...p }: P) => (<svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={2} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
export const Upload = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M11 16V7.8L7.4 11.4 6 10l6-6 6 6-1.4 1.4L13 7.8V16zm-7 2h16v2H4z"/></svg>);
export const Offline = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v6.2l2.6-2.6 1.4 1.4-5 5-5-5 1.4-1.4 2.6 2.6z"/></svg>);
export const Moon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg>);
export const Close = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg>);
export const Music = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M9 18.5a3 3 0 1 1-2-2.83V5l12-2v12.5a3 3 0 1 1-2-2.83V7.4l-8 1.33z"/></svg>);
export const Trash = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z"/></svg>);
