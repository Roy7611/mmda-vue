import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  imageEditorHookClass,
  resolveImageEditorTools,
  UiPluginName,
  type UiImageEditorProps,
  type UiImageEditorTool,
  type UiPlugin,
} from '@mmda/core'
import { cssSize, joinClass, reactDomProps } from './utils'

function ej2ToolbarOf(tools: UiImageEditorTool[], readonly: boolean): string[] {
  if (readonly) return []
  const items: string[] = []
  if (tools.includes('crop')) items.push('Crop')
  if (tools.includes('rotate') || tools.includes('flip')) {
    items.push('Transform')
  }
  items.push('Undo', 'Redo', 'Reset')
  return items
}

function MissingImageEditor(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-image-editor-missing' },
    'Image editor requires @syncfusion/ej2-react-image-editor',
  )
}

const ImageEditorImpl = lazy(async (): Promise<{
  default: ComponentType<any>
}> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingImageEditor
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-image-editor')
    return { default: mod.ImageEditorComponent as ComponentType<any> }
  } catch {
    return { default: MissingImageEditor }
  }
})

export function SfImageEditorView(props: UiImageEditorProps): ReactElement {
  const readonly = props.readonly === true
  const tools = resolveImageEditorTools(props)

  return createElement(
    'div',
    {
      className: joinClass(imageEditorHookClass(props.class, readonly)),
      style: {
        width: cssSize(props.width, '100%'),
        height: cssSize(props.height, '70vh'),
      },
      ...reactDomProps(props),
    },
    createElement(
      Suspense,
      { fallback: null },
      createElement(ImageEditorImpl as any, {
        toolbar: ej2ToolbarOf(tools, readonly),
        disabled: readonly,
        height: '100%',
        width: '100%',
        created: (args: any) => {
          if (props.src) args?.ej2Instances?.open?.(props.src)
        },
      }),
    ),
  )
}

export function createSfImageEditorPlugin(): UiPlugin {
  return {
    name: UiPluginName.imageEditor,
    buildUi(_context, props) {
      return SfImageEditorView(props as UiImageEditorProps)
    },
  }
}
