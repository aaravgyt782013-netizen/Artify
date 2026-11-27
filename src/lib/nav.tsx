import { createContext, useContext, useState, type ReactNode } from "react";
import type { View } from "./types";

interface NavCtx {
  view: View;
  go: (v: View) => void;
  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;
}
const Ctx = createContext<NavCtx | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<View[]>([{ name: "home" }]);
  const [pos, setPos] = useState(0);
  const view = stack[pos];
  const value: NavCtx = {
    view,
    go: (v) => {
      if (JSON.stringify(v) === JSON.stringify(view)) return;
      setStack((s) => [...s.slice(0, pos + 1), v]);
      setPos((p) => p + 1);
    },
    back: () => setPos((p) => Math.max(0, p - 1)),
    forward: () => setPos((p) => Math.min(stack.length - 1, p + 1)),
    canBack: pos > 0,
    canForward: pos < stack.length - 1,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNav outside provider");
  return c;
}
