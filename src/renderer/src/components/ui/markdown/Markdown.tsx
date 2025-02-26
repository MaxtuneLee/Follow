import { parseHtml } from "@renderer/lib/parse-html"
import type { RemarkOptions } from "@renderer/lib/parse-markdown"
import { parseMarkdown } from "@renderer/lib/parse-markdown"
import { cn } from "@renderer/lib/utils"
import { createElement, Fragment, useEffect, useMemo, useState } from "react"

import { MarkdownRenderContainerRefContext } from "./context"

export const Markdown: Component<
  {
    children: string
  } & Partial<RemarkOptions>
> = ({ children, components, className }) => {
  const stableRemarkOptions = useState({ components })[0]

  const markdownElement = useMemo(
    () => parseMarkdown(children, { ...stableRemarkOptions }).content,
    [children, stableRemarkOptions],
  )
  const [refElement, setRefElement] = useState<HTMLElement | null>(null)

  return (
    <MarkdownRenderContainerRefContext.Provider value={refElement}>
      <article
        className={cn(
          "prose relative cursor-auto select-text dark:prose-invert prose-th:text-left",
          className,
        )}
        ref={setRefElement}
      >
        {markdownElement}
      </article>
    </MarkdownRenderContainerRefContext.Provider>
  )
}

export const HTML = <A extends keyof JSX.IntrinsicElements = "div">(
  props: {
    children: string | null | undefined
    as: A

    accessory?: React.ReactNode
  } & JSX.IntrinsicElements[A] &
  Partial<{
    renderInlineStyle: boolean
  }>,
) => {
  const { children, renderInlineStyle, as = "div", accessory, ...rest } = props
  const [remarkOptions, setRemarkOptions] = useState({ renderInlineStyle })

  useEffect(() => {
    setRemarkOptions({ renderInlineStyle })
  }, [renderInlineStyle])

  const [refElement, setRefElement] = useState<HTMLElement | null>(null)

  const markdownElement = useMemo(
    () =>
      children &&
      parseHtml(children, {
        ...remarkOptions,
      }).toContent(),
    [children, remarkOptions],
  )

  if (!markdownElement) return null
  return (
    <MarkdownRenderContainerRefContext.Provider value={refElement}>
      {createElement(as, { ...rest, ref: setRefElement }, markdownElement)}
      {accessory && <Fragment key={children}>{accessory}</Fragment>}
    </MarkdownRenderContainerRefContext.Provider>
  )
}
