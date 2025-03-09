import { AxiosInstance } from 'axios'

import {
  Branch,
  CreateBranchDTO,
  Booth,
  CreateBoothDTO,
  UpdateBranchDTO,
  CreateBranchTranslationDTO,
  BranchTranslation,
  BoothTranslation,
  UpdateBoothRunningReservationDTO,
  ResponseToDesktop
} from './interface'

export class FacilityService {
  private instance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  async createBranch(createBranchDto: CreateBranchDTO) {
    const res = await this.instance.post('/facility/branch', createBranchDto)

    return res.data.branch_id as number
  }

  async createBranchTranslation(
    branchId: number,
    branchTranslationData: CreateBranchTranslationDTO
  ) {
    const res = await this.instance.post(
      `/facility/branch/${branchId}/translation`,
      branchTranslationData
    )

    return res.data.translation_id as number
  }

  async readBranch(branchId: number, lang: string) {
    const res = await this.instance.get(`/facility/branch/${branchId}`, {
      params: { lang }
    })

    return res.data as Branch
  }

  async readAllBranches(lang: string) {
    const res = await this.instance.get('/facility/branch', {
      params: { lang }
    })

    return res.data as Branch[]
  }

  async readAllbranchTranslationsByBranchId(branchId: number) {
    const res = await this.instance.get(`/facility/branch/${branchId}/translation`)

    return res.data as BranchTranslation[]
  }

  async updateBranch(branchId: number, updateBranchDto: UpdateBranchDTO) {
    await this.instance.put(`/facility/branch/${branchId}`, updateBranchDto)
  }

  async deleteBranch(branchId: number) {
    await this.instance.delete(`/facility/branch/${branchId}`)
  }

  async deleteBranchTranslation(translationId: number) {
    await this.instance.delete(`/facility/branch/translation/${translationId}`)
  }

  async createBooth(branchId: number, createBoothDto: CreateBoothDTO) {
    const res = await this.instance.post(`/facility/branch/${branchId}/booth`, createBoothDto)

    return res.data.booth_id as number
  }

  async readBooth(boothId: number, lang: string) {
    const res = await this.instance.get(`/facility/booth/${boothId}`, {
      params: { lang }
    })

    return res.data as Booth
  }

  async readBoothsByBranchId(branchId: number, lang: string) {
    const res = await this.instance.get(`/facility/branch/${branchId}/booth`, {
      params: { lang }
    })

    return res.data as Booth[]
  }

  async readAllBooths(lang: string) {
    const res = await this.instance.get('/facility/booth', {
      params: { lang }
    })

    return res.data as Booth[]
  }

  async readAllBoothTranslationsByBoothId(boothId: number) {
    const res = await this.instance.get(`/facility/booth/${boothId}/translation`)

    return res.data as BoothTranslation[]
  }

  async updateBooth(boothId: number, updateBoothDto: CreateBoothDTO) {
    await this.instance.put(`/facility/booth/${boothId}`, updateBoothDto)
  }

  async deleteBooth(boothId: number) {
    await this.instance.delete(`/facility/booth/${boothId}`)
  }

  async deleteBoothTranslation(translationId: number) {
    await this.instance.delete(`/facility/booth/translation/${translationId}`)
  }

  async readBoothStatus(boothId: number) {
    const res = await this.instance.get(`/facility/booth/${boothId}/status`)

    return res.data as { status: string }
  }

  async readBoothRunningReservationId(boothId: number) {
    const res = await this.instance.get(`/facility/booth/${boothId}/running-reservation`)

    return res.data as { running_reservation_id: number }
  }

  async updateBoothStatus(boothId: number, status: string) {
    await this.instance.put(`/facility/booth/${boothId}/status`, {
      status
    })
  }

  async updateBoothRunningReservationId(boothId: number, reservationId: number) {
    await this.instance.put(`/facility/booth/${boothId}/running-reservation`, {
      running_reservation_id: reservationId
    } as UpdateBoothRunningReservationDTO)
  }

  async getDesktopStartResponse(boothId: number) {
    const res = await this.instance.get(`/facility/booth/${boothId}/desktop-start`)

    return res.data as ResponseToDesktop
  }
}
