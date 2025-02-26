import { useUISettingSelector } from "@renderer/atoms/settings/ui"
import { m } from "@renderer/components/common/Motion"
import { Logo } from "@renderer/components/icons/logo"
import { useResizeableModal } from "@renderer/components/ui/modal"
import { preventDefault } from "@renderer/lib/dom"
import { cn } from "@renderer/lib/utils"
import { useDragControls } from "framer-motion"
import { Resizable } from "re-resizable"
import type { PointerEventHandler, PropsWithChildren } from "react"
import { Suspense, useCallback, useEffect, useRef } from "react"

import { settings } from "../constants"
import { SettingsSidebarTitle } from "../title"
import { useSetSettingTab, useSettingTab } from "./context"

export function SettingModalLayout(
  props: PropsWithChildren<{
    initialTab?: string
  }>,
) {
  const { children, initialTab } = props
  const setTab = useSetSettingTab()
  const tab = useSettingTab()
  const elementRef = useRef<HTMLDivElement>(null)
  const { handlePointDown, isResizeable, resizeableStyle } = useResizeableModal(
    elementRef,
    {
      enableResizeable: true,
    },
  )

  useEffect(() => {
    if (!tab) {
      if (initialTab) {
        setTab(initialTab)
      } else {
        setTab(settings[0].path)
      }
    }
  }, [])

  const { draggable, overlay } = useUISettingSelector((state) => ({
    draggable: state.modalDraggable,
    overlay: state.modalOverlay,
  }))
  const dragController = useDragControls()
  const handleDrag: PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (draggable) {
        dragController.start(e)
        handlePointDown()
      }
    },
    [dragController, draggable, handlePointDown],
  )

  return (
    <div className={cn("h-full", !isResizeable && "center")}>
      <m.div
        exit={{
          opacity: 0,
          scale: 0.96,
        }}
        className={cn(
          "relative flex overflow-hidden rounded-xl border border-border",
          !overlay && "shadow-perfect",
        )}
        style={resizeableStyle}
        onContextMenu={preventDefault}
        drag={draggable}
        dragControls={dragController}
        dragListener={false}
        dragMomentum={false}
        dragElastic={false}
        whileDrag={{
          cursor: "grabbing",
        }}
      >
        <Resizable
          onResizeStart={handlePointDown}
          enable={{
            bottomRight: true,
          }}
          style={{ ...resizeableStyle, position: "static" }}
          defaultSize={{
            width: 800,
            height: 700,
          }}
          maxHeight="80vh"
          minHeight={500}
          minWidth={600}
          maxWidth="95vw"
          className="flex flex-col"
        >
          {draggable && (
            <div
              className="absolute inset-x-0 top-0 z-[1] h-8"
              onPointerDown={handleDrag}
            />
          )}
          <div
            className="flex h-0 flex-1 bg-theme-modal-background-opaque"
            ref={elementRef}
          >
            <div className="w-44 border-r px-2 py-6">
              <div className="mb-4 flex h-8 items-center gap-2 px-2 font-bold">
                <Logo className="mr-1 size-6" />
                {APP_NAME}
              </div>
              {settings.map((t) => (
                <button
                  key={t.path}
                  className={`my-1 flex w-full items-center rounded-lg px-2.5 py-0.5 leading-loose text-theme-foreground/70 transition-colors ${
                    tab === t.path ?
                      "bg-theme-item-active text-theme-foreground/90" :
                      ""
                  }`}
                  type="button"
                  onClick={() => setTab(t.path)}
                >
                  <SettingsSidebarTitle
                    path={t.path}
                    className="text-[0.94rem] font-medium"
                  />
                </button>
              ))}
            </div>
            <div className="relative flex h-full flex-1 flex-col bg-theme-background pt-1">
              <Suspense>{children}</Suspense>
            </div>
          </div>
        </Resizable>
      </m.div>
    </div>
  )
}
