import { describe, expect, it } from 'vitest'
import {
  fileUploaderAcceptOf,
  fileUploaderAutoUploadOf,
  fileUploaderModifierClasses,
  fileUploaderTakeOne,
  filesUploaderShowDropAreaOf,
  fileUploaderPropsFromField,
} from '../ui/factory/file_uploader'
import {
  IMAGE_UPLOADER_EXTENSIONS,
  imageUploaderAcceptOf,
  imageUploaderPropsFromField,
} from '../ui/factory/image_uploader'

describe('fileUploader helpers', () => {
  it('autoUpload defaults true for single, false for multiple', () => {
    expect(fileUploaderAutoUploadOf({}, false)).toBe(true)
    expect(fileUploaderAutoUploadOf({}, true)).toBe(false)
    expect(fileUploaderAutoUploadOf({ autoUpload: false }, false)).toBe(false)
  })

  it('takes only the first file for single uploader', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    expect(fileUploaderTakeOne([a, b])).toBe(a)
  })

  it('showDropArea defaults true for multi only', () => {
    expect(filesUploaderShowDropAreaOf({})).toBe(true)
    expect(filesUploaderShowDropAreaOf({ showDropArea: false })).toBe(false)
  })

  it('accept joins extension list', () => {
    expect(fileUploaderAcceptOf('.png,.jpg')).toBe('.png,.jpg')
  })

  it('modifier classes mark single as input, not dropArea', () => {
    const classes = fileUploaderModifierClasses({}, { multiple: false })
    expect(classes).toContain('mmda-file-uploader--input')
    expect(classes.join(' ')).not.toContain('dropArea')
  })

  it('field props write url and default onUpload', () => {
    const field = { fieldName: 'attach' } as any
    const setFieldValue = (f: any, value: unknown) => {
      expect(f).toBe(field)
      expect(value).toBe('/u/x.pdf')
    }
    const props = fileUploaderPropsFromField(field, {
      getFieldValue: () => '/u/old.pdf',
      setFieldValue,
      isFieldReadonly: () => false,
      editing: true,
      getModuleAuth: () => ({ allowDownload: true }),
    })
    expect(props.url).toBe('/u/old.pdf')
    expect(typeof props.onUpload).toBe('function')
    expect((props as any).layout).toBeUndefined()
  })
})

describe('imageUploader helpers', () => {
  it('locks image extensions', () => {
    expect(imageUploaderAcceptOf()).toBe(IMAGE_UPLOADER_EXTENSIONS)
    expect(imageUploaderAcceptOf('.png')).toBe('.png')
  })

  it('field props keep image accept', () => {
    const props = imageUploaderPropsFromField(
      { fieldName: 'photo' } as any,
      {
        getFieldValue: () => '',
        setFieldValue: () => undefined,
        isFieldReadonly: () => false,
        editing: true,
      },
    )
    expect(props.allowedExtensions).toBe(IMAGE_UPLOADER_EXTENSIONS)
  })
})
