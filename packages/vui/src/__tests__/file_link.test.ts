import { describe, expect, it } from 'vitest'
import {
  renderFileLink,
  fileLinkDownloadableOf,
  fileLinkExtOf,
  fileLinkLabelOf,
  fileLinkPreviewKindOf,
  fileLinkPropsFromField,
  FILE_LINK_APP_PREVIEW_EXTS,
  FILE_LINK_BROWSER_PREVIEW_EXTS,
} from '../ui/factory/file_link'

describe('fileLink helpers', () => {
  it('cuts file name from url', () => {
    expect(fileLinkLabelOf({ url: '/files/a/report.docx' })).toBe('report.docx')
    expect(fileLinkExtOf('/files/a/report.PDF')).toBe('pdf')
  })

  it('downloadable defaults true; false is explicit', () => {
    expect(fileLinkDownloadableOf({})).toBe(true)
    expect(fileLinkDownloadableOf({ downloadable: false })).toBe(false)
  })

  it('preview kind: app for office, browser for pdf/txt/csv', () => {
    expect(fileLinkPreviewKindOf({ url: 'a.xlsx', preview: true })).toBe('app')
    expect(fileLinkPreviewKindOf({ url: 'a.docx', preview: true })).toBe('app')
    expect(fileLinkPreviewKindOf({ url: 'a.pdf', preview: true })).toBe('browser')
    expect(fileLinkPreviewKindOf({ url: 'a.csv', preview: true })).toBe('browser')
    expect(fileLinkPreviewKindOf({ url: 'a.txt', preview: true })).toBe('browser')
    expect(fileLinkPreviewKindOf({ url: 'a.png', preview: true })).toBe('none')
    expect(fileLinkPreviewKindOf({ url: 'a.pdf' })).toBe('none')
    expect(FILE_LINK_APP_PREVIEW_EXTS).toContain('xlsx')
    expect(FILE_LINK_BROWSER_PREVIEW_EXTS).toContain('pdf')
  })

  it('maps allowDownload !== false from module auth', () => {
    const field = { fieldName: 'doc' } as any
    const withAuth = fileLinkPropsFromField(field, {
      getFieldValue: () => '/f/a.pdf',
      getModuleAuth: () => ({ allowDownload: false }),
    })
    expect(withAuth.downloadable).toBe(false)
    const legacy = fileLinkPropsFromField(field, {
      getFieldValue: () => '/f/a.pdf',
      getModuleAuth: () => ({}),
    })
    expect(legacy.downloadable).toBe(true)
  })

  it('omits anchor when not downloadable', () => {
    const node = renderFileLink({ url: '/f/a.pdf', downloadable: false })
    expect(node.type).toBe('span')
    const ok = renderFileLink({ url: '/f/a.pdf' })
    expect(ok.type).toBe('a')
    expect(ok.props.href).toBe('/f/a.pdf')
  })
})
