import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      Menu.machine.withContext({
        contextMenu: true,
        onSelect: console.log,
      }),
    )

    const ref = useSetup({ send, id: "1" })

    const menuRef = computed(() => Menu.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { triggerProps, contextTriggerProps, contentProps, getItemProps } = menuRef.value
      console.log("contextTriggerProps :>> ", contextTriggerProps)
      return (
        <>
          <div {...contextTriggerProps}>
            <div style={{ border: "solid 1px red" }}>Open context menu</div>
          </div>
          <button class="menu__trigger" ref={ref} {...triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>
          <ul ref={ref} class="menu__content" {...contentProps}>
            <li class="menu__item" {...getItemProps({ id: "edit" })}>
              Edit
            </li>
            <li class="menu__item" {...getItemProps({ id: "duplicate" })}>
              Duplicate
            </li>
            <li class="menu__item" {...getItemProps({ id: "delete" })}>
              Delete
            </li>
            <li class="menu__item" {...getItemProps({ id: "export" })}>
              Export...
            </li>
          </ul>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
