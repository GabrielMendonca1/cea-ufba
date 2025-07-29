
"use client"

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UploadCloud } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ResearchOpportunity } from '@/hooks/use-infinite-scroll'
import { v4 as uuidv4 } from 'uuid'

interface ApplicationFormModalProps {
  isOpen: boolean
  onClose: () => void
  researchOpportunity: ResearchOpportunity
  onApplicationSubmit: (newApplication: any) => void // Callback for optimistic update
}

export function ApplicationFormModal({
  isOpen,
  onClose,
  researchOpportunity,
  onApplicationSubmit,
}: ApplicationFormModalProps) {
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [cvVitaeFile, setCvVitaeFile] = useState<File | null>(null)
  const [academicRecordFile, setAcademicRecordFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverLetterRef = useRef<HTMLInputElement>(null)
  const cvVitaeRef = useRef<HTMLInputElement>(null)
  const academicRecordRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setter(file)
        setError(null)
      } else {
        setter(null)
        setError('Por favor, selecione apenas arquivos PDF.')
      }
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!coverLetterFile || !cvVitaeFile || !academicRecordFile) {
      setError('Por favor, anexe todos os documentos PDF necessários.')
      setIsSubmitting(false)
      return
    }

    const tempApplicationId = uuidv4()
    const now = new Date().toISOString()
    const userId = (await supabase.auth.getUser()).data.user?.id || ''

    // Optimistic UI update
    const optimisticApplication = {
      id: tempApplicationId,
      student_id: userId,
      research_opportunity_id: researchOpportunity.id,
      status: 'pending',
      cover_letter_pdf: '', // Placeholder, will be updated by real-time
      cv_vitae_pdf: '', // Placeholder
      academic_record_pdf: '', // Placeholder
      created_at: now,
      updated_at: now,
      user_profiles: { // Basic optimistic profile data
        id: userId,
        email: (await supabase.auth.getUser()).data.user?.email || '',
        full_name: 'Você (otimista)',
        user_type: 'student',
        avatar_url: null,
      },
    }
    onApplicationSubmit(optimisticApplication)

    try {
      const filePaths = {
        coverLetter: `applications/${userId}/${researchOpportunity.id}/cover_letter_${uuidv4()}.pdf`,
        cvVitae: `applications/${userId}/${researchOpportunity.id}/cv_vitae_${uuidv4()}.pdf`,
        academicRecord: `applications/${userId}/${researchOpportunity.id}/academic_record_${uuidv4()}.pdf`,
      }

      const coverLetterUrl = await uploadFile(coverLetterFile, 'documents', filePaths.coverLetter)
      const cvVitaeUrl = await uploadFile(cvVitaeFile, 'documents', filePaths.cvVitae)
      const academicRecordUrl = await uploadFile(academicRecordFile, 'documents', filePaths.academicRecord)

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_opportunity_id: researchOpportunity.id,
          cover_letter_pdf: coverLetterUrl,
          cv_vitae_pdf: cvVitaeUrl,
          academic_record_pdf: academicRecordUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar candidatura')
      }

      // Real-time hook will update the actual application data
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao enviar candidatura.')
      // Revert optimistic update
      onApplicationSubmit((prev: any[]) => prev.filter((app: any) => app.id !== tempApplicationId))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Candidatar-se à Pesquisa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes e anexe os documentos para se candidatar à oportunidade:
            <br />
            <strong>{researchOpportunity.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="coverLetter">Carta de Apresentação (PDF)</Label>
            <Input
              id="coverLetter"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setCoverLetterFile)}
              ref={coverLetterRef}
              disabled={isSubmitting}
            />
            {coverLetterFile && <p className="text-sm text-muted-foreground">Arquivo selecionado: {coverLetterFile.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvVitae">Currículo Vitae (PDF)</Label>
            <Input
              id="cvVitae"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setCvVitaeFile)}
              ref={cvVitaeRef}
              disabled={isSubmitting}
            />
            {cvVitaeFile && <p className="text-sm text-muted-foreground">Arquivo selecionado: {cvVitaeFile.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="academicRecord">Histórico Acadêmico (PDF)</Label>
            <Input
              id="academicRecord"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setAcademicRecordFile)}
              ref={academicRecordRef}
              disabled={isSubmitting}
            />
            {academicRecordFile && <p className="text-sm text-muted-foreground">Arquivo selecionado: {academicRecordFile.name}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Enviar Candidatura
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
