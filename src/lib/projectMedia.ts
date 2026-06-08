import type { ProjectAttachment, ProjectModelFile } from './types'

/** Match Salesforce file titles ending with model-1 … model-10 (before extension). */
const MODEL_TITLE_PATTERN = /model-(\d+)$/i

export function getModelNumberFromTitle(title: string): number | null {
  const base = (title || '').trim().replace(/\.[^.]+$/, '').toLowerCase()
  const match = base.match(MODEL_TITLE_PATTERN)
  if (!match) return null
  const n = parseInt(match[1], 10)
  return Number.isFinite(n) ? n : null
}

export function isModelAttachmentTitle(title: string): boolean {
  return getModelNumberFromTitle(title) !== null
}

export function extractProjectModelFiles(attachments: ProjectAttachment[]): ProjectModelFile[] {
  return attachments
    .map((a) => {
      const number = getModelNumberFromTitle(a.title)
      if (number === null) return null
      return {
        id: a.id,
        number,
        title: a.title,
        url: a.url,
        fileExtension: a.fileExtension,
      }
    })
    .filter((m): m is ProjectModelFile => m !== null)
    .sort((a, b) => a.number - b.number)
}

export function isModelImageFile(fileExtension?: string): boolean {
  const e = (fileExtension || '').toLowerCase()
  return e === 'png' || e === 'jpg' || e === 'jpeg' || e === 'webp' || e === 'gif'
}

export function isModelPdfFile(fileExtension?: string): boolean {
  return (fileExtension || '').toLowerCase() === 'pdf'
}

/** Parse Unit__c Model__c picklist (e.g. "Model 3") to a model number. */
export function getModelNumberFromPicklistValue(model?: string): number | null {
  if (!model?.trim()) return null
  const trimmed = model.trim()
  const fromLabel = trimmed.match(/^model\s*(\d+)$/i)
  if (fromLabel) return parseInt(fromLabel[1], 10)
  const fromDash = trimmed.match(/model-(\d+)$/i)
  if (fromDash) return parseInt(fromDash[1], 10)
  const onlyNum = trimmed.match(/^(\d+)$/)
  if (onlyNum) return parseInt(onlyNum[1], 10)
  return null
}

export function findProjectModelFile(
  modelFiles: ProjectModelFile[],
  modelPicklist?: string
): ProjectModelFile | null {
  const n = getModelNumberFromPicklistValue(modelPicklist)
  if (n === null) return null
  return modelFiles.find((f) => f.number === n) ?? null
}
