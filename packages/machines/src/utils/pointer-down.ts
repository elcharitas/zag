import { cast } from "@core-foundation/utils"
import { ref } from "valtio"
import { GlobalThis } from "./types"

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  const fn = (event: PointerEvent) => {
    const win = cast<GlobalThis>(event.view ?? window)
    if (event.target instanceof win.HTMLElement) {
      ctx.pointerdownNode = ref(event.target)
    }
  }
  doc.addEventListener("pointerdown", fn)
  return () => {
    doc.removeEventListener("pointerdown", fn)
  }
}