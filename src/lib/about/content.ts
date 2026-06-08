import { DEMO_CONFIG } from '../demo-config'

export type BoardMember = {
  nameAr: string
  nameEn: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  image: string
}

export const boardMembers: BoardMember[] = [
  {
    nameAr: 'مينا ميشيل',
    nameEn: 'Mina Michel',
    titleAr: 'الرئيس التنفيذي',
    titleEn: 'Chief Executive Officer',
    descriptionAr:
      'مؤسس ورئيس تنفيذي بخبرة واسعة في قيادة التحول الرقمي وتطوير حلول تقنية مبتكرة لقطاع العقارات.',
    descriptionEn:
      'Founder and CEO with extensive experience in leading digital transformation and developing innovative technology solutions for the real estate sector.',
    image: '',
  },
  {
    nameAr: 'جون شدودي',
    nameEn: 'John Shedoudy',
    titleAr: 'مستشار Salesforce',
    titleEn: 'Salesforce Consultant',
    descriptionAr:
      'خبير في استشارات Salesforce مع خبرة عميقة في تصميم وتنفيذ الحلول العقارية على منصة Salesforce.',
    descriptionEn:
      'Salesforce consultant with deep expertise in designing and implementing real estate solutions on the Salesforce platform.',
    image: '',
  },
  {
    nameAr: 'لؤي علاء الدين',
    nameEn: 'Luay Aladin',
    titleAr: 'مستشار Salesforce',
    titleEn: 'Salesforce Consultant',
    descriptionAr:
      'مستشار Salesforce محترف ذو خبرة في تحسين العمليات التجارية وتنفيذ حلول تقنية متكاملة.',
    descriptionEn:
      'Professional Salesforce consultant with expertise in optimizing business processes and implementing integrated technical solutions.',
    image: '',
  },
  {
    nameAr: 'شادي توماس',
    nameEn: 'Shady Thomas',
    titleAr: 'مستشار Salesforce',
    titleEn: 'Salesforce Consultant',
    descriptionAr:
      'مستشار Salesforce محترف يمتلك خبرة في تحسين العمليات التجارية وتطوير حلول تقنية متكاملة.',
    descriptionEn:
      'Professional Salesforce consultant with expertise in optimizing business processes and developing integrated technical solutions.',
    image: '',
  },
  {
    nameAr: 'أشرف رزق',
    nameEn: 'Ashraf Rezk',
    titleAr: 'رئيس قسم التقنية',
    titleEn: 'Head of Technology',
    descriptionAr: 'قائد تقني بخبرة في تطوير الحلول البرمجية وإدارة فرق الهندسة لبناء منصات عقارية مبتكرة.',
    descriptionEn:
      'Technology leader with experience in software development and managing engineering teams to build innovative real estate platforms.',
    image: '',
  },
]

export type LocalizedBoardMember = {
  name: string
  title: string
  description: string
  image: string
}

export function getBoardMembers(language: string): LocalizedBoardMember[] {
  if (!DEMO_CONFIG.features.showBoardMembers) return []
  const isEnglish = language.startsWith('en')
  return boardMembers.map((member) => ({
    name: isEnglish ? member.nameEn : member.nameAr,
    title: isEnglish ? member.titleEn : member.titleAr,
    description: isEnglish ? member.descriptionEn : member.descriptionAr,
    image: member.image,
  }))
}

export async function loadMissionVisionMarkdown(language: string): Promise<string> {
  const primaryLanguage = language.startsWith('en') ? 'en' : 'ar'
  const fallbackLanguage = primaryLanguage === 'en' ? 'ar' : 'en'

  for (const lang of [primaryLanguage, fallbackLanguage]) {
    const response = await fetch(`/content/about/mission-vision.${lang}.md`)
    if (response.ok) {
      return response.text()
    }
  }

  throw new Error('Unable to load mission and vision content')
}
