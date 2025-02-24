"use client"

import type React from "react"

import { useState, useEffect, useTransition, useCallback } from "react"
import { Combobox } from "@repo/design-system/components/ui/combobox"
import { getCorporations, getCorporationByIdAction } from "@/app/actions/corporations/corporations-actions"
import type { Corporation } from "@repo/database/src/tenant-app/schema/corporations-schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog"
import CorporationForm from "../forms/corporation-form"
import { PlusIcon } from "lucide-react"

interface CorporationComboboxProps {
  onSelect: (corporationId: string) => void
  initialCorporationId?: string
  tempClientId: string | null
}

const CorporationCombobox: React.FC<CorporationComboboxProps> = ({ onSelect, initialCorporationId, tempClientId }) => {
  const [corporations, setCorporations] = useState<Corporation[]>([])
  const [filteredCorporations, setFilteredCorporations] = useState<Corporation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingInitialCorporation, setIsFetchingInitialCorporation] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchInitialCorporation = useCallback(async () => {
    if (initialCorporationId) {
      setIsFetchingInitialCorporation(true)
      startTransition(async () => {
        const initialCorporationData = await getCorporationByIdAction(initialCorporationId)
        if (initialCorporationData) {
          setCorporations([initialCorporationData])
          setFilteredCorporations([initialCorporationData])
          setSearchTerm(initialCorporationData.name)
        }
        setIsFetchingInitialCorporation(false)
      })
    }
  }, [initialCorporationId])

  const fetchCorporationsData = useCallback(async () => {
    setIsLoading(true)
    const fetchedCorporations = await getCorporations()
    if (fetchedCorporations) {
      setCorporations(fetchedCorporations)
      setFilteredCorporations(fetchedCorporations)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (initialCorporationId) {
      fetchInitialCorporation()
    } else {
      fetchCorporationsData()
    }
  }, [initialCorporationId, fetchInitialCorporation, fetchCorporationsData])

  useEffect(() => {
    if (searchTerm) {
      const filtered = corporations.filter((corporation) =>
        corporation.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCorporations(filtered)
    } else {
      setFilteredCorporations(corporations)
    }
  }, [searchTerm, corporations])

  const handleSelect = (corporationId: string) => {
    const selectedCorporation = corporations.find((corporation) => corporation.id === corporationId)
    if (selectedCorporation) {
      setSearchTerm(selectedCorporation.name)
    }
    onSelect(corporationId)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <>
      <Combobox
        isLoading={isLoading || isFetchingInitialCorporation || isPending}
        items={filteredCorporations}
        onSelect={handleSelect}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        displayKey="name"
        valueKey="id"
        placeholder="Buscar sociedad..."
        noResultsMessage="Sin sociedades"
        label="Seleccionar sociedad"
        createOption={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-blue-500 hover:underline">
                <PlusIcon className="mr-1 h-4 w-4 inline-block" /> Crear Sociedad
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Sociedad</DialogTitle>
                <DialogDescription>Ingrese los datos de la nueva sociedad.</DialogDescription>
              </DialogHeader>
              <CorporationForm closeDialog={closeDialog} tempClientId={tempClientId} />
            </DialogContent>
          </Dialog>
        }
      />
    </>
  )
}

export default CorporationCombobox

