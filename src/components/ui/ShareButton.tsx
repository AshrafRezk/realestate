import { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import { Share, ContentCopy, Check, WhatsApp, Twitter, Facebook } from '@mui/icons-material'
import { useToastStore } from '../../lib/store/toast-store'
import { DEMO_CONFIG } from '../../lib/demo-config'

interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
  image?: string
  size?: 'small' | 'medium' | 'large'
}

export default function ShareButton({
  url = window.location.href,
  title = DEMO_CONFIG.brand.nameAr,
  text = 'اكتشف هذه الوحدة',
  image,
  size = 'medium',
}: ShareButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Try native share API first (mobile)
    if (navigator.share) {
      navigator
        .share({
          title,
          text,
          url,
        })
        .then(() => {
          addToast('تم المشاركة بنجاح', 'success')
        })
        .catch(() => {
          // User cancelled or error - show menu
          setAnchorEl(e.currentTarget)
        })
    } else {
      setAnchorEl(e.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      addToast('تم نسخ الرابط', 'success')
      setTimeout(() => setCopied(false), 2000)
      handleClose()
    } catch {
      addToast('فشل نسخ الرابط', 'error')
    }
  }

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    window.open(whatsappUrl, '_blank')
    addToast('تم فتح واتساب', 'success')
    handleClose()
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
    addToast('تم فتح تويتر', 'success')
    handleClose()
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank')
    addToast('تم فتح فيسبوك', 'success')
    handleClose()
  }

  return (
    <>
      <Tooltip title="مشاركة">
        <IconButton onClick={handleClick} size={size}>
          <Share />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={copyLink}>
          <ListItemIcon>
            {copied ? <Check sx={{ fontSize: 20 }} /> : <ContentCopy sx={{ fontSize: 20 }} />}
          </ListItemIcon>
          <ListItemText>{copied ? 'تم النسخ' : 'نسخ الرابط'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={shareToWhatsApp}>
          <ListItemIcon>
            <WhatsApp sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>واتساب</ListItemText>
        </MenuItem>
        <MenuItem onClick={shareToTwitter}>
          <ListItemIcon>
            <Twitter sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>تويتر</ListItemText>
        </MenuItem>
        <MenuItem onClick={shareToFacebook}>
          <ListItemIcon>
            <Facebook sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>فيسبوك</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

