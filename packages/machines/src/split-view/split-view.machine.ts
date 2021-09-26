import { focus } from "@core-dom/event"
import { NumericRange } from "@core-foundation/numeric-range"
import { createMachine, ref, guards } from "@ui-machines/core"
import { trackPointerMove } from "../utils/pointer-move"
import { WithDOM } from "../utils/types"
import { getElements } from "./split-view.dom"

const { not } = guards

export type SplitViewMachineContext = WithDOM<{
  /**
   * Whether to allow the separator to be dragged.
   */
  fixed?: boolean
  /**
   * The orientation of the split view.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The minimum size of the primary pane.
   */
  min: number
  /**
   * The maximum size of the primary pane.
   */
  max: number
  /**
   * The size of the primary pane.
   */
  value: number
  /**
   * The step increments of the primary pane when it is dragged
   * or resized with keyboard.
   */
  step: number
  /**
   * Callback to be invoked when the primary pane is resized.
   */
  onChange?: (size: number) => void
  /**
   * Whether the primary pane is disabled.
   */
  disabled?: boolean
}>

export type SplitViewMachineState = {
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
}

export const splitViewMachine = createMachine<SplitViewMachineContext, SplitViewMachineState>(
  {
    id: "split-view-machine",
    initial: "unknown",
    context: {
      uid: "spliter",
      orientation: "horizontal",
      min: 224,
      max: 340,
      step: 1,
      value: 256,
    },
    on: {
      COLLAPSE: {
        actions: "setToMin",
      },
      EXPAND: {
        actions: "setToMax",
      },
      TOGGLE: [
        {
          cond: "isCollapsed",
          actions: "setToMax",
        },
        {
          cond: not("isCollapsed"),
          actions: "setToMin",
        },
      ],
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },

      idle: {
        on: {
          POINTER_OVER: "hover:temp",
          POINTER_LEAVE: "idle",
          FOCUS: "focused",
        },
      },

      "hover:temp": {
        after: {
          250: "hover",
        },
        on: {
          POINTER_DOWN: "dragging",
          POINTER_LEAVE: "idle",
        },
      },

      hover: {
        on: {
          POINTER_DOWN: "dragging",
          POINTER_LEAVE: "idle",
        },
      },

      focused: {
        on: {
          BLUR: "idle",
          POINTER_DOWN: "dragging",
          ARROW_LEFT: {
            cond: "isHorizontal",
            actions: "decrement",
          },
          ARROW_RIGHT: {
            cond: "isHorizontal",
            actions: "increment",
          },
          ARROW_UP: {
            cond: "isVertical",
            actions: "increment",
          },
          ARROW_DOWN: {
            cond: "isVertical",
            actions: "decrement",
          },
          ENTER: [
            { cond: "isCollapsed", actions: "setToMin" },
            { cond: not("isCollapsed"), actions: "setToMin" },
          ],
          HOME: {
            actions: "setToMin",
          },
          END: {
            actions: "setToMax",
          },
          DOUBLE_CLICK: [
            {
              cond: "isCollapsed",
              actions: "setToMax",
            },
            {
              cond: not("isCollapsed"),
              actions: "setToMin",
            },
          ],
        },
      },

      dragging: {
        entry: "focusSplitter",
        activities: "trackPointerMove",
        on: {
          POINTER_UP: "focused",
        },
      },
    },
  },
  {
    activities: {
      trackPointerMove: (ctx, _evt, { send }) => {
        return trackPointerMove({
          ctx,
          onPointerMove(_evt, info) {
            const { primaryPane } = getElements(ctx)
            if (!primaryPane) return

            const { point } = info.point.relativeToNode(primaryPane)
            const { min, max, step } = ctx

            const range = new NumericRange({ min, max, step, value: point.x })
            ctx.value = range.clamp().snapToStep().valueOf()
          },
          onPointerUp() {
            send("POINTER_UP")
          },
        })
      },
    },
    guards: {
      isCollapsed: (ctx) => ctx.value === ctx.min,
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isFixed: (ctx) => !!ctx.fixed,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
      increment(ctx, evt) {
        ctx.value = new NumericRange(ctx).increment(evt.step).clamp().valueOf()
      },
      decrement(ctx, evt) {
        ctx.value = new NumericRange(ctx).decrement(evt.step).clamp().valueOf()
      },
      focusSplitter(ctx) {
        const { splitter } = getElements(ctx)
        if (!splitter) return
        focus.nextTick(splitter)
      },
    },
  },
)